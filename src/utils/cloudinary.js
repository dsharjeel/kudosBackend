import { v2 as cloudinary } from "cloudinary";
import { response } from "express";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (filepath) => {
    try {
        if (!filepath) return null;

        response = await cloudinary.uploader.upload(filepath, {
            resource_type: "auto",
        });
        console.log("File uploaded successfully on Cloudinary", response.url);
        return response;
    } catch (error) {
        console.error("Error uploading file on Cloudinary", error);
        fs.unlinkSync(filepath);
        return null;
    }
};

export { uploadOnCloudinary };