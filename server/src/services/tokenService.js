import httpStatus from 'http-status'
import jwt from 'jsonwebtoken'
import moment from 'moment'

import prisma from '../config/prisma.js'
import ApiError from '../utils/ApiError.js'

const getIntEnv = (key, fallback) => {
  const parsed = Number(process.env[key])
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

const requireUserId = (user) => {
  const rawId = user?.id ?? user?._id
  const userId = Number(rawId)

  if (!Number.isInteger(userId) || userId <= 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid user id for token generation')
  }

  return userId
}

const generateToken = (id, expires, type, secret = process.env.JWT_SECRET) => {
  if (!secret) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'JWT_SECRET is not configured')
  }

  const payload = {
    id,
    iat: moment().unix(),
    exp: expires.unix(),
    type,
  }

  return jwt.sign(payload, secret)
}

export const generateAuthTokens = async (user) => {
  const userId = requireUserId(user)
  const accessTokenExpires = moment().add(getIntEnv('JWT_ACCESS_EXPIRATION_MINUTES', 15), 'minutes')
  const accessToken = generateToken(userId, accessTokenExpires, 'ACCESS')

  const refreshTokenExpires = moment().add(getIntEnv('JWT_REFRESH_EXPIRATION_DAYS', 30), 'days')
  const refreshToken = generateToken(userId, refreshTokenExpires, 'REFRESH')

  return {
    access: { token: accessToken, expires: accessTokenExpires.toDate() },
    refresh: { token: refreshToken, expires: refreshTokenExpires.toDate() },
  }
}

export const verifyToken = (token, expectedType) => {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'JWT_SECRET is not configured')
  }

  try {
    const payload = jwt.verify(token, secret)

    if (expectedType && payload.type !== expectedType) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid token type')
    }

    return payload
  } catch (error) {
    if (error instanceof ApiError) throw error
    if (error.name === 'TokenExpiredError') {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Token has expired')
    }
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid token')
  }
}

export const refreshAuthTokens = async (refreshToken) => {
  const payload = verifyToken(refreshToken, 'REFRESH')

  const user = await prisma.users.findUnique({
    where: { id: payload.id },
  })

  if (!user || user.is_deleted) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'User not found or deactivated')
  }

  return generateAuthTokens(user)
}

export const generateResetPasswordToken = async (user) => {
  const userId = requireUserId(user)
  const expires = moment().add(10, 'minutes')
  const resetToken = generateToken(userId, expires, 'RESET_PASSWORD')

  await prisma.users.update({
    where: { id: userId },
    data: {
      reset_pass_token: resetToken,
      token_expiry: expires.toDate(),
    },
  })

  return resetToken
}
