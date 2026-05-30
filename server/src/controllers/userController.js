import httpStatus from 'http-status'

import * as userService from '../services/userService.js'
import ApiError from '../utils/ApiError.js'
import catchAsync from '../utils/catchAsync.js'


export const getUsersAdmin = catchAsync(async (req, res) => {
  const { page, limit, role, search } = req.query
  const result = await userService.getUsersAdmin({ page, limit, role, search })

  res.status(200).json({
    success: true,
    message: 'Users retrieved successfully',
    data: result
  })
})

export const getUserById = catchAsync(async (req, res) => {
  const { id } = req.params
  const result = await userService.getUserById(id)

  res.status(200).json({
    success: true,
    message: 'User retrieved successfully',
    data: result
  })
})

export const updateUserRole = catchAsync(async (req, res) => {
  const { id } = req.params
  const { role } = req.body
  
  if (!role) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Role is required')
  }

  const result = await userService.updateUserRole(id, role)

  res.status(200).json({
    success: true,
    message: 'User role updated successfully',
    data: result
  })
})

export const deleteUser = catchAsync(async (req, res) => {
  const { id } = req.params
  await userService.deleteUser(id)

  res.status(200).json({
    success: true,
    message: 'User deleted successfully',
    data: null
  })
})
