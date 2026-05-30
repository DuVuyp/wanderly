import { Readable } from 'node:stream'

import cloudinary from '../config/cloudinary.js'

/**
 * Upload image buffer to Cloudinary
 * @param {Buffer} fileBuffer
 * @param {string} folder
 * @returns {Promise<string>} Uploaded image URL
 */
export const uploadImageToCloudinary = (fileBuffer, folder = 'wanderly') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          reject(error)
        } else {
          resolve(result.secure_url)
        }
      }
    )

    // Create a readable stream from the buffer and pipe it to Cloudinary
    const readable = new Readable()
    readable._read = () => {} // No-op, required for Readable
    readable.push(fileBuffer)
    readable.push(null)

    readable.pipe(uploadStream)
  })
}
