import { v2 as cloudinary } from "cloudinary";
import envconfig from "./envHandler.js";
import fs from "fs";

cloudinary.config({
    cloud_name: "dcuzsftwv",
    api_key: "956473181832776",
    api_secret: "jeGOt-JSIr2YyHLoo9AP44GHQp0",
    // cloud_name: envconfig.cloudinary_cloud_name,
    // api_key: envconfig.cloudinary_api_key,
    // api_secret: envconfig.cloudinary_api_secret,
});

const uploadOnCloudinary = async (filepath) => {
    try {
        if (!filepath) {
            return null;
        }
        const cloudinaryResponse = await cloudinary.uploader.upload(filepath, {
            resource_type: "auto",
        });
        fs.unlinkSync(filepath);
        return cloudinaryResponse;
    } catch (error) {
        console.error("Cloudinary Error:", error);
        fs.unlinkSync(filepath);
        return null;
    }
};

export { uploadOnCloudinary };
