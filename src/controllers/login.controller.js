import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse, ApiError } from "../utils/ApiResponseHandler.js";
import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";

const generateAccessRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Error generating access and refresh token");
    }
};

const loginUser = asyncHandler(async (req, res) => {
    // Login user logic here
    // 1. Get user data from req.body
    // 2. validate data if not empty
    // 3. check if user email or username already exists in database
    // 4. check if password is correct
    // 5. generate access and refresh token
    // 6. return the response

    const { email, username, password } = req.body;

    if (!(email || username) || !password) {
        throw new ApiError(400, "Please provide username or email");
    }

    const user = await User.findOne({
        $or: [{ email: email }, { username: username }],
    });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const checkPassword = await user.isPasswordCorrect(password);

    if (!checkPassword) {
        throw new ApiError(400, "Invalid user credentials");
    }

    const { accessToken, refreshToken } = await generateAccessRefreshToken(
        user._id
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("access", accessToken, options)
        .cookie("refresh", refreshToken, options)
        .json(
            new ApiResponse(200, "User logged in successfully", {
                accessToken,
                refreshToken,
            })
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    // Logout user logic here
    // 1. clear the refresh token from the database
    // 2. clear the access and refresh token from the cookies
    // 3. return the response

    const user = req.user._id;

    console.log(user);

    await User.findByIdAndUpdate(
        user,
        {
            $unset: { refreshToken: 1 },
        },
        { new: true }
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .clearCookie("access", options)
        .clearCookie("refresh", options)
        .json(new ApiResponse(200, "User logged out successfully"));
});

export { loginUser, logoutUser };
