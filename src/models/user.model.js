import mongoose, { Schema } from "mongoose";
import bycrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullName: { type: String, required: true },
        avatar: { type: String, required: true },
        coverImage: { type: String, required: true },
        watchHistory: [{ type: Schema.Types.ObjectId, ref: "Video" }],
        password: { type: String, required: true },
        refreshToken: { type: String, required: true },
    },
    { timestamps: true }
);

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bycrypt.hash(this.password, 10);
    next();
});

userSchema.methods.isPasswordMatch = async function (password) {
    return await bycrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            id: this._id,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_LIFE,
        }
    );
};

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_LIFE,
        }
    );
};

export const User = mongoose.model("User", userSchema);
