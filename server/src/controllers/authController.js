import httpStatus from 'http-status'

import * as tokenService from '../services/tokenService.js'
import { createUser, loginUserWithEmail } from '../services/userService.js'
import catchAsync from '../utils/catchAsync.js'

const registerUser = catchAsync(async (req, res) => {
  const { full_name, password, email, role } = req.body
  const newUser = await createUser({ full_name, password, email, role })

  res.status(httpStatus.CREATED).json({
    success: true,
    message: 'User registered successfully',
    data: newUser,
  })
})

const loginUser = catchAsync(async (req, res) => {
  const { email, password } = req.body
  const user = await loginUserWithEmail(email, password)
  const tokens = await tokenService.generateAuthTokens(user)
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Login successful',
    data: { user, tokens },
  })
})

const getMe = catchAsync(async (req, res) => {
  res.status(httpStatus.OK).json({
    success: true,
    message: 'User profile retrieved successfully',
    data: req.user,
  })
})

const refreshTokens = catchAsync(async (req, res) => {
  const { refreshToken } = req.body
  const tokens = await tokenService.refreshAuthTokens(refreshToken)
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Tokens refreshed successfully',
    data: tokens,
  })
})

const logoutUser = catchAsync(async (req, res) => {
  // Stateless JWT — client-side handles token removal.
  // In production, consider a token blacklist or DB-stored refresh tokens.
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Logged out successfully',
  })
})

export { registerUser, loginUser, getMe, refreshTokens, logoutUser }
