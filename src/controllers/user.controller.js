import { aysncHandler } from "../utils/aysncHandler.js";
import { ApiError } from "../utils/apiErrors.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";

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
    };

    return res
        .status(201)
        .json(new ApiResponse(201, "User created successfully", createdUser));
});

export { registerUser };
