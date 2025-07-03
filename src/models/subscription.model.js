import mongoose,{ Schema } from "mongoose";

const subscriptionSchema = new Schema({
    subscriber:{
        type:Schema.Types.ObjectId,//one who is Subscribing 
        ref:"User"
    },
    channel:{
         type:Schema.Types.ObjectId,
        ref:"User"
    }
},{
    Timestamp:true
})


 export const Subscription = mongoose.model("Subscription",subscriptionSchema)