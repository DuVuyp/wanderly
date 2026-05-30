import httpStatus from 'http-status'
import jwt from 'jsonwebtoken'

import prisma from '../config/prisma.js'
import ApiError from '../utils/ApiError.js'

const auth = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      // 1. Extract token from header
      const authHeader = req.headers.authorization
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Access token is required')
      }

      const token = authHeader.split(' ')[1]

      // 2. Verify JWT
      const secret = process.env.JWT_SECRET
      if (!secret) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'JWT_SECRET is not configured')
      }

      let payload
      try {
        payload = jwt.verify(token, secret)
      } catch (error) {
        if (error.name === 'TokenExpiredError') {
          throw new ApiError(httpStatus.UNAUTHORIZED, 'Access token has expired')
        }
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid access token')
      }

      // 3. Check token type
      if (payload.type !== 'ACCESS') {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid token type')
      }

      // 4. Find user in DB
      const user = await prisma.users.findUnique({
        where: { id: payload.id },
      })

      if (!user) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'User not found')
      }

      // 5. Check role authorization (if roles specified)
      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        throw new ApiError(
          httpStatus.FORBIDDEN,
          'You do not have permission to access this resource'
        )
      }

      // 6. Attach user to request (without password)
      const safeUser = { ...user }
      delete safeUser.password_hash
      req.user = safeUser

      next()
    } catch (error) {
      next(error)
    }
  }
}

export default auth
