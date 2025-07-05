import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import fs from "fs";
import jwt from "jsonwebtoken"
import { console } from "inspector";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generatRefreshToken()

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false })

        return { refreshToken, accessToken }

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating AccessAndRefreshTokens ")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    // Debug uploaded files
    console.log("Request files:", req.files);

    const { fullName, email, username, password } = req.body;
    console.log("Request body:", req.body);

    // Validate fields
    if ([fullName, email, username, password].some(field => !field || field.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    // Check for existing user
    const existedUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existedUser) {
        throw new ApiError(409, "User already exists");
    }

    // Handle avatar
    if (!req.files?.avatar) {
        throw new ApiError(400, "Avatar file is required");
    }
    // console.log(req.fiels);

    const avatarLocalPath = req.files.avatar[0].path;
    console.log("Avatar path:", avatarLocalPath, "Exists:", fs.existsSync(avatarLocalPath));

    // Handle cover image (optional)
    let coverImageLocalPath;
    if (req.files?.coverImage) {
        coverImageLocalPath = req.files.coverImage[0]?.path;
    }

    // Upload to Cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar) {
        throw new ApiError(400, "Failed to upload avatar to Cloudinary");
    }

    let coverImage;
    if (coverImageLocalPath) {
        coverImage = await uploadOnCloudinary(coverImageLocalPath);
    }

    // Create user
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    });

    // Return response without sensitive data
    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    if (!createdUser) {
        throw new ApiError(500, "Failed to create user");
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    );
});

const loginUser = asyncHandler(async (req, res) => {
    //  req body se data le aao 
    // username or email  use karine
    // find the user
    // to check password karo
    // acess and request banne token user ne mokalvanu
    // send cookies 

    const { email, username, password } = req.body;

    if (!username && !email) {
        throw new ApiError(400, "Username or Password Is Required")
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    // database na User mathi ka to username ka to email find karsu


    if (!user) {
        throw new ApiError(404, "User Does Not Exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    // AA method user.model.js ma banavi hati

    if (!isPasswordValid) {
        throw new ApiError(401, "PassWord is Not Valid")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

    const loogedInUser = await User.findById(user._id).select("-password -refreshToken  ");

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loogedInUser, accessToken, refreshToken
                },
                "user Logged In Successfully"
            )
        )

})

const logOutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            },

        },
        {
            new: true,
        }
    )
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User Logged Out "))


})


const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized Request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken?._id)
        if (!user) {
            throw new ApiError(401, "Invalid RefreshToken")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, " RefreshToken is Expired or Used    ")

        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200, { accessToken, refreshToken: newRefreshToken },
                    "Access Token Refreshed Successfully"
                )
            )


    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Refresh Token")
    }

})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid Old Password")

    }

    user.password = newPassword
    user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed Successfully"))

})


const getCurrentUser = asyncHandler(async (req, res) => {
    res
        .status(200)
        .json(200, req.user, "Current User Fetch Succesfully")
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body

    if (!fullName || !email) {
        throw new ApiError(400, "All fields are required ")
    }

    const user = User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email: email
            }
        },
        { new: true }
    ).select("-password")

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Account Details Updated SuccesFully"))
})

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        return new ApiError(400, "Avatar File is Missing")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar.url) {
        return new ApiError(400, "Url Not Found Error While uploading avatar")
    }

    const user  = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {
            new: true
        }
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200,user,"Avatar Updated Succesfully"))
})

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath) {
        return new ApiError(400, "Cover File is Missing")
    }
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if (!coverImage.url) {
        return new ApiError(400, "Url Not Found Error While uploading cover Image")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        {
            new: true
        }
    ).select("-password")

        return res
    .status(200)
    .json(new ApiResponse(200,user,"CoverImage Updated Succesfully"))
})

export {
    registerUser,
    loginUser,
    logOutUser,
    refreshAccessToken,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage
};