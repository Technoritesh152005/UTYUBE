import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return "File Path Required";

    // upload hone ke bad woh apna url return karta hai joh ki public hota hao
    const response = await cloudinary.uploader.upload(
      localFilePath,
      {
        resource_type: "auto",
      },
      console.log(response.url),
    );
    return response;
  } catch (err) {
    // agar file system meh hai pr cloudinary par upload nhi huwa toh unlink it from system also
    fs.unlink(localFilePath);
  }
};

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

// first we will store files in local storage then pass the path and store in cloudinary then we will unlink it in file system
export { uploadOnCloudinary };
