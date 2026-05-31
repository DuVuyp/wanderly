import express from 'express'

import {
  registerUser,
  loginUser,
  getMe,
  refreshTokens,
  logoutUser,
} from '../controllers/authController.js'
import auth from '../middlewares/authMiddleware.js'
import validate from '../middlewares/validateMiddleware.js'
import { authLimiter } from '../middlewares/rateLimitMiddleware.js'
import { createUserSchema, loginSchema, refreshTokenSchema } from '../validations/userValidation.js'

const router = express.Router()
router.post('/register', authLimiter, validate(createUserSchema), registerUser)
router.post('/login', authLimiter, validate(loginSchema), loginUser)
router.get('/me', auth(), getMe)
router.post('/refresh-token', validate(refreshTokenSchema), refreshTokens)
router.post('/logout', auth(), logoutUser)

export default router
