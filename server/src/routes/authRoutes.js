import express from 'express'

import { registerUser, loginUser } from '../controllers/authController.js'
import validate from '../middlewares/validateMiddleware.js'
import { createUserSchema, loginSchema } from '../validations/userValidation.js'

const router = express.Router()
router.post('/register', validate(createUserSchema), registerUser)
router.post('/login', validate(loginSchema), loginUser)

export default router
