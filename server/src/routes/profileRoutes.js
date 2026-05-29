import express from 'express'

import * as profileController from '../controllers/profileController.js'
import auth from '../middlewares/authMiddleware.js'
import validate from '../middlewares/validateMiddleware.js'
import * as profileValidation from '../validations/profileValidation.js'

const router = express.Router()

// GET /api/profile
router.get('/', auth(), profileController.getProfile)

// PUT /api/profile
router.put('/', auth(), validate(profileValidation.updateProfile), profileController.updateProfile)

// PUT /api/profile/change-password
router.put(
  '/change-password',
  auth(),
  validate(profileValidation.changePassword),
  profileController.changePassword
)

export default router
