// cloudinary v2 SDK import



import { v2 as cloudinary } from "cloudinary";

// fs/promises gives promise-based fs methods (no callbacks)
import fs from "fs/promises";

// path is used to convert relative path → absolute path (important on Windows)
import path from "path";

// load environment variables BEFORE using process.env
import "../config/env.js";

/**
 * Upload file to Cloudinary
 * @param {string} localFilePath - path of file stored by multer
 * @returns {object|null} cloudinary response or null if failed
 */
const uploadOnCloudinary = async (localFilePath) => {
  try {
    // if no file path provided, stop immediately
    if (!localFilePath) return null;

    // convert relative path to absolute path (Windows fix)
    const absolutePath = path.resolve(localFilePath);

    // upload file to cloudinary
    const response = await cloudinary.uploader.upload(absolutePath, {
      resource_type: "auto", // auto-detect image/video/etc
    });

    // delete file from local system after successful upload
    await fs.unlink(absolutePath);

    // return full cloudinary response
    return response;

  } catch (error) {
    // if upload fails, log error for debugging
    console.log("Cloudinary upload error:", error);

    // try deleting local file even if upload failed
    try {
      const absolutePath = path.resolve(localFilePath);
      await fs.unlink(absolutePath);
    } catch {
      // ignore unlink error
    }

    return null;
  }
  
};

// configure cloudinary using env variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

// export function
export { uploadOnCloudinary };

