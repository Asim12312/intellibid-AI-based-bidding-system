import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';
import { ApiError } from '../utils/ApiError.js';

export async function uploadImageBuffer(buffer, folder = 'intellibid') {
  if (!isCloudinaryConfigured()) {
    throw ApiError.badRequest(
      'Cloudinary is not configured. Provide imageUrl in request body or configure CLOUDINARY_* env vars.'
    );
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) reject(ApiError.badRequest(error.message));
        else resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
}
