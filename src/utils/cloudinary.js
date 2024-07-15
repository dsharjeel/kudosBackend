import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config({ path: "./.env" });

cloudinary.config({
    cloud_name: String(process.env.CLOUDINARY_CLOUD_NAME),
    api_key: String(process.env.CLOUDINARY_API_KEY),
    api_secret: String(process.env.CLOUDINARY_API_SECRET),
});

const uploadonCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });
        fs.unlinkSync(localFilePath);
        return response.secure_url;
    } catch (error) {
        fs.unlinkSync(localFilePath);
        return null;
    }
};

export default uploadonCloudinary;
