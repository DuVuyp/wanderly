import httpStatus from 'http-status'
import { createUser, loginUserWithEmail } from '../services/userService.js'
import catchAsync from '../utils/catchAsync.js'
import * as tokenService from '../services/tokenService.js'

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

export { registerUser, loginUser }
