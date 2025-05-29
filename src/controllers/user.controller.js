import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
    //  get user detail from fronted also add validation ->not empty 
    // check if user already exists:username,email
    // check for images &avatar
    // upload them to cloudinary,avatar
    //  create user object - create entry in db
    // remove pass and refresh token field from response
    // check for user creation
    // return res

    const { fullName, email, username, password } = req.body;
    console.log("Full name: ", fullName);

    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are reqiuired");
    }

    const existedUser = User.findOne({
        $or: [{ username }, { email }]
    })
    // if username or email is existing user or not
    if (existedUser) {
        throw new ApiError(409, "User with email or Username already existed");
    }
    // req.body express aape em req.files?.avatar multer aape  to files nu access male
    const avatarLocalpath = req.files?.avatar[0]?.path;
    const coverImageLocalpath = req.fies?.coverImage[0]?.path;

    if (!avatarLocalpath) {
        throw new ApiError(400, "Avatar file is required");
    }
    const avatar = await uploadOnCloudinary(avatarLocalpath); //jya sudhi upload no thay tya sudhi wait karo
    const coverImage  =await uploadOnCloudinary(coverImageLocalpath);

    if(!avatar){
        throw new ApiError(400,"Avatar File is Required");
    }

    const user = await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage?.url||"",
        email,
        password,
        username:username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        // we write here what we don't want 
        "-password -refreshToken"
    );
    if(!createdUser){
        throw new ApiError(500,"Something went wrong while register the user")
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User Registered SucessFully");
    )

})

export { registerUser };