import { aysncHandler } from "../utils/aysncHandler.js";
import { ApiError } from "../utils/apiErrors.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Error generating tokens", error);
    }
};

const registerUser = aysncHandler(async (req, res) => {
    const { fullname, email, username, password } = req.body;
    if (
        [fullname, email, username, password].some(
            (field) => field?.trim() === ""
        )
    ) {
        throw new ApiError(400, "Please fill in all fields");
    }

    const existedUser = await User.findOne({ $or: [{ username }, { email }] });

    if (existedUser) {
        throw new ApiError(409, "User already exists");
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverimage?.[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Please upload an avatar");
    }

    const avatarOnCloudinary = await uploadOnCloudinary(avatarLocalPath);
    const coverImageOnCloudinary =
        await uploadOnCloudinary(coverImageLocalPath);

    if (!avatarOnCloudinary) {
        throw new ApiError(500, "Error uploading avatar");
    }

    if (coverImageLocalPath && !coverImageOnCloudinary) {
        throw new ApiError(500, "Error uploading cover image");
    }

    const createUser = await User.create({
        fullname,
        avatar: avatarOnCloudinary.secure_url,
        coverimage: coverImageOnCloudinary?.secure_url,
        email,
        username: username.toLowerCase(),
        password,
    });

    const createdUser = await User.findById(createUser._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(500, "Error creating user");
    }

    return res
        .status(201)
        .json(new ApiResponse(201, "User created successfully", createdUser));
});

const loginUser = aysncHandler(async (req, res) => {
    // get data from request body
    // validate email or username
    // check if user exists in the database
    // check if password is correct
    // validate user
    // generate access and refresh token
    // send access token in secure cookies

    const { email, username, password } = req.body;

    if (email && username) {
        throw new ApiError(400, "Please provide email or username");
    }

    if (!password) {
        throw new ApiError(400, "Please provide password");
    }

    const user = await User.findOne({ $or: [{ email }, { username }] });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
        user._id
    );

    const logedinUser = await User.findById(user._id).select(
        "-password -refreshToken -__v"
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    message: "User logged in successfully",
                    accessToken: accessToken,
                    refreshToken: refreshToken,
                },
                logedinUser
            )
        );
});

const logoutUser = aysncHandler(async (req, res) => {
    // clear access and refresh token from cookies
    // set refresh token to null in the database
    // send response
    const options = {
        httpOnly: true,
        secure: true,
    };

    User.findByIdAndUpdate(
        req.user._id,
        { $set: { refreshToken: null } },
        { new: true }
    );

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, "User logged out successfully"));
});

const refreshAccessToken = aysncHandler(async (req, res) => {
    const incomingRefreshToken =
        req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(decodedToken?._id);

        if (!user) {
            throw new ApiError(405, "Invalid token");
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Unauthorized request");
        }

        const options = {
            httpOnly: true,
            secure: true,
        };

        const { accessToken, refreshToken } =
            await generateAccessAndRefreshTokens(user._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(200, {
                    message: "Token refreshed successfully",
                    accessToken: accessToken,
                    refreshToken: refreshToken,
                })
            );
    } catch (error) {
        throw new ApiError(500, "Error refreshing token", error);
    }
});

const changeCurrentPassword = aysncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    const isPasswordCorrect = await user.isPasswordCorrect(currentPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid password");
    }

    user.password = newPassword;

    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, "Password changed successfully"));
});

const getCurrentUser = aysncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, "user fetched successfully", req.user));
});

const updateAccountDetails = aysncHandler(async (req, res) => {
    const { fullname, email } = req.body;

    if (!fullname || !email) {
        throw new ApiError(400, "Please provide fullname and email");
    }

    const user = User.findByIdAndUpdate(
        req.user?._id,
        { $set: { fullname: fullname, email: email } },
        { new: true }
    ).select("-password -refreshToken -__v");

    return res
        .status(200)
        .json(
            new ApiResponse(200, "Account details updated successfully", user)
        );
});

const updateUserAvatar = aysncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Please upload an avatar");
    }

    const avatarOnCloudinary = await uploadOnCloudinary(avatarLocalPath);

    if (!avatarOnCloudinary.url) {
        throw new ApiError(500, "Error uploading avatar");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: { avatar: avatarOnCloudinary.secure_url },
        },
        {
            new: true,
        }
    ).select("-password -refreshToken -__v");

    return res
        .status(200)
        .json(new ApiResponse(200, "Avatar updated successfully", user));
});

const updateUserCoverImage = aysncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path;

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Please upload an cover image");
    }

    const coverImageOnCloudinary =
        await uploadOnCloudinary(coverImageLocalPath);

    if (!coverImageOnCloudinary.url) {
        throw new ApiError(500, "Error uploading cover image");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: { coverimage: coverImageOnCloudinary.secure_url },
        },
        {
            new: true,
        }
    ).select("-password -refreshToken -__v");

    return res
        .status(200)
        .json(new ApiResponse(200, "cover image updated successfully", user));
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
};
