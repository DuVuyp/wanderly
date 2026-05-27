import httpStatus from 'http-status'

import * as profileService from '../services/profileService.js'
import catchAsync from '../utils/catchAsync.js'

const updateProfile = catchAsync(async (req, res) => {
  const user = await profileService.updateProfile(req.user.id, req.body)
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Profile updated successfully',
    data: user,
  })
})

const changePassword = catchAsync(async (req, res) => {
  await profileService.changePassword(req.user.id, req.body.oldPassword, req.body.newPassword)
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Password changed successfully',
  })
})

const getProfile = catchAsync(async (req, res) => {
  const user = await profileService.getProfile(req.user.id)
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Profile retrieved successfully',
    data: user,
  })
})

export { getProfile, updateProfile, changePassword }
