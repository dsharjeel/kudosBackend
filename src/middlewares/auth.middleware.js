import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiResponseHandler.js";
import jwt from "jsonwebtoken";

const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token =
            req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decodedToken.id).select(
            "fullName email username avatar coverImage"
        );

        if (!user) {
            throw new ApiError(401, "Unauthorized request");
        }

        req.user = user;

        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Unauthorized request");
    }
});

export { verifyJWT };
