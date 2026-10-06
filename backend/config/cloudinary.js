const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload buffer to Cloudinary
 * @param {Buffer} fileBuffer
 * @param {String} folder
 * @param {Object|String} optionsOrResourceType
 */
const uploadToCloudinary = (fileBuffer, folder = "job_portal", optionsOrResourceType = "auto") => {
  return new Promise((resolve, reject) => {
    const extraOptions =
      typeof optionsOrResourceType === "object"
        ? optionsOrResourceType
        : { resource_type: optionsOrResourceType };

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: "auto",
        ...extraOptions,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
};
