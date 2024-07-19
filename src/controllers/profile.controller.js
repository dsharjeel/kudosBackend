import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError, ApiResponse } from "../utils/ApiResponseHandler.js";
import { User } from "../models/user.model.js";
import { uploadonCloudinary } from "../utils/cloudinary.js";

const getUserProfile = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(true, "User profile", req.user));
});

const updateProfile = asyncHandler(async (req, res) => {
    const { fullName, email, username } = req.body;

    if (!fullName || !email || !username) {
        throw new ApiError(400, "Please provide all required fields");
    }

    User.findByIdAndUpdate(
        req.user?.id,
        {
            $set: { fullName, email, username },
        },
        { new: true }
    ).select("fullName email username");

    return res
        .status(200)
        .json(new ApiResponse(true, "Profile updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
    const localFilePath = req.file?.path;

    if (!localFilePath) {
        throw new ApiError(400, "Please provide an image file");
    }

    const avatar = await uploadonCloudinary(localFilePath);

    if (!avatar.secure_url) {
        throw new ApiError(500, "Failed to upload image");
    }

    await User.findByIdAndUpdate(
        req.user?.id,
        { $set: { avatar: avatar.secure_url } },
        { new: true }
    );

    return res
        .status(200)
        .json(new ApiResponse(true, "Avatar updated successfully"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const localFilePath = req.file?.path;

    if (!localFilePath) {
        throw new ApiError(400, "Please provide an image file");
    }

    const coverImage = await uploadonCloudinary(localFilePath);

    if (!coverImage.secure_url) {
        throw new ApiError(500, "Failed to upload image");
    }

    const user = await User.findByIdAndUpdate(
        req.user?.id,
        { $set: { coverImage: coverImage.secure_url } },
        { new: true }
    );

    return res
        .status(200)
        .json(new ApiResponse(true, "Avatar updated successfully"));
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user?.id);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await user.isPasswordCorrect(currentPassword);

    if (!isPasswordValid) {
        throw new ApiError(400, "Invalid current password");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(true, "Password changed successfully"));
});

export { getUserProfile, updateProfile, changeCurrentPassword, updateUserAvatar };
