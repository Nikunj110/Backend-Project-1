import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,

        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        avatar: {
            type: String,//Cloudnary Url
            required: true
        },
        coverImage: {
            type: String
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }

        ],
        password:{
            type:String,
            required:[true,"Password is required"]
        },
        refreshToken:{
            type:String
        }

    },{
        timestamps:true
    }
);
userSchema.pre("save",async function (next){
    if(!this.isModified("password")){
        return next();
        //jo password modify nai karyo hoy to direct  next step
        // return kari dese 

    }
     this.password = await bcrypt.hash(this.password,10);
    next();
    // nahitar 10 iteration ma pass ne encrypt kaese 
});
userSchema.methods.isPasswordCorrect = async function (password){
       return await bcrypt.compare(password,this.password);
    //    jyare login karsu tyare password string ma moklse user so string==encrypt password so thts why it used
    // and this return true or false
    // computation high for cryptogrsphy so we should wait so await used 
}

userSchema.methods.generateAccessToken = function(){
   return jwt.sign(
        {
            _id : this._id,
            email :this.email,
            username:this.username,
            fullName:this.fullName

        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generatRefreshToken = function(){
    return jwt.sign(
        {
            _id : this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


export const User = mongoose.model("User", userSchema);