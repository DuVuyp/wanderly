import httpStatus from 'http-status'

import * as uploadService from '../services/uploadService.js'
import ApiError from '../utils/ApiError.js'
import catchAsync from '../utils/catchAsync.js'

const uploadImage = catchAsync(async (req, res) => {
  if (!req.file) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Please upload an image file')
  }

  const imageUrl = await uploadService.uploadImageToCloudinary(req.file.buffer)

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Image uploaded successfully',
    data: {
      url: imageUrl,
    },
  })
})

export { uploadImage }
