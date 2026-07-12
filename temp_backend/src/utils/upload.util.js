import cloudinary from "../config/cloudinary.config.js";
import config from "../config/env.config.js";

export const uploadToCloudinary = async (fileBuffer, folder = config.cloudinary.folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    stream.end(fileBuffer);
  });
};

export const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return null;
  return cloudinary.uploader.destroy(publicId);
};
