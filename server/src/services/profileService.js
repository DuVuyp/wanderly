import bcrypt from 'bcryptjs'
import httpStatus from 'http-status'

import prisma from '../config/prisma.js'
import ApiError from '../utils/ApiError.js'

/**
 * Get user profile
 * @param {number} userId
 * @returns {Promise<Object>}
 */
export const getProfile = async (userId) => {
  const user = await prisma.users.findUnique({
    where: { id: userId },
  })

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found')
  }

  const safeUser = { ...user }
  delete safeUser.password_hash
  delete safeUser.verify_token
  delete safeUser.reset_pass_token
  delete safeUser.token_expiry
  return safeUser
}

/**
 * Update user profile
 * @param {number} userId
 * @param {Object} updateBody
 * @returns {Promise<Object>}
 */
export const updateProfile = async (userId, updateBody) => {
  if (updateBody.phone_number) {
    const existingUser = await prisma.users.findFirst({
      where: { phone_number: updateBody.phone_number, id: { not: userId } }
    });
    if (existingUser) {
      throw new ApiError(httpStatus.CONFLICT, 'Phone number already in use');
    }
  }

  const user = await prisma.users.update({
    where: { id: userId },
    data: updateBody,
  })

  const safeUser = { ...user }
  delete safeUser.password_hash
  delete safeUser.verify_token
  delete safeUser.reset_pass_token
  delete safeUser.token_expiry
  return safeUser
}

/**
 * Change user password
 * @param {number} userId
 * @param {string} oldPassword
 * @param {string} newPassword
 * @returns {Promise<void>}
 */
export const changePassword = async (userId, oldPassword, newPassword) => {
  const user = await prisma.users.findUnique({ where: { id: userId } })
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found')
  }

  const isPasswordMatch = await bcrypt.compare(oldPassword, user.password_hash)
  if (!isPasswordMatch) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Incorrect old password')
  }

  if (oldPassword === newPassword) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'New password cannot be the same as the old password')
  }

  const newPasswordHash = await bcrypt.hash(newPassword, 10)

  await prisma.users.update({
    where: { id: userId },
    data: { password_hash: newPasswordHash },
  })
}
