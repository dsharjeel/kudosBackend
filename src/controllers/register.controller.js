import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse, ApiError } from "../utils/ApiResponseHandler.js";
import { User } from "../models/user.model.js";
import uploadonCloudinary from "../utils/cloudinary.js";

const registerUser = asyncHandler(async (req, res) => {
    // Register user logic here
    // 1. Get user data from req.body
    // 2. validate data if not empty
    // 3. check if user email or username already exists in database
    // 4. check from image, check for avatar
    // 5. upload images to cloudinary
    // 6. Create a new user object - create user entry in the database
    // 7. remove password and other sensitive data from response
    // 8. check and return the new user
    // 9. return the response

    const { username, email, fullName, password } = req.body;

    if (!username || !email || !fullName || !password) {
        throw new ApiError(400, "Please fill in all fields");
    }

    const existingUser = await User.findOne({
        $or: [{ username: username }, { email: email }],
    });

    if (existingUser) {
        throw new ApiError(409, "User with email or username already exists");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    let coverImageLocalPath;

    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Please upload avatar image");
    }

    const avatar = await uploadonCloudinary(avatarLocalPath);
    const coverImage = await uploadonCloudinary(coverImageLocalPath);

    if (!avatar || (coverImageLocalPath && !coverImage)) {
        throw new ApiError(500, "Error uploading images on cloudinary");
    }

    const newUser = await User.create({
        fullName,
        avatar: avatar,
        coverImage: coverImage || null,
        email,
        username,
        password,
    });

    const createdUser = await User.findById(newUser._id).select(
        "fullName email username avatar coverImage"
    );

    if (!createdUser) {
        throw new ApiError(500, "Error registering user in database");
    }

    return res
        .status(201)
        .json(
            new ApiResponse(201, "User registered successfully", createdUser)
        );
});

export { registerUser };
