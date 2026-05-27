import express from 'express'
import multer from 'multer'
import httpStatus from 'http-status'
import * as uploadController from '../controllers/uploadController.js'
import auth from '../middlewares/authMiddleware.js'
import ApiError from '../utils/ApiError.js'

const router = express.Router()

// Configure multer with memory storage and size/type validation
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new ApiError(httpStatus.BAD_REQUEST, 'Not an image! Please upload only images.'), false)
    }
  },
})

// POST /api/upload
// Requires authentication, expects form-data with key 'image'
router.post('/', auth(), upload.single('image'), uploadController.uploadImage)

export default router
