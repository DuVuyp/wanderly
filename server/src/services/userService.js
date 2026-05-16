import bcrypt from 'bcryptjs'
import httpStatus from 'http-status'

import ApiError from '../utils/ApiError.js'
import prisma from '../config/prisma.js'

const sanitizeUser = (user) => {
  if (!user) return user
  const { password_hash, verify_token, reset_pass_token, token_expiry, ...safeUser } = user
  return safeUser
}

const parseOrderBy = (sortBy) => {
  if (!sortBy) return undefined

  const orderBy = sortBy
    .split(',')
    .map((item) => {
      const [field, direction] = item.split(':')
      if (!field) return null
      return {
        [field]: direction === 'desc' ? 'desc' : 'asc',
      }
    })
    .filter(Boolean)

  return orderBy.length > 0 ? orderBy : undefined
}

const getUsers = async (filter = {}, options = {}) => {
  const page = Number(options.page) > 0 ? Number(options.page) : 1
  const limit = Number(options.limit) > 0 ? Number(options.limit) : undefined
  const skip = limit ? (page - 1) * limit : undefined
  const orderBy = parseOrderBy(options.sortBy)

  const users = await prisma.users.findMany({
    where: filter,
    take: limit,
    skip,
    orderBy,
  })

  return users.map(sanitizeUser)
}
// getUserById(userId)
const createUser = async (userData) => {
  const userExists = await prisma.users.findUnique({
    where: { email: userData.email },
  })

  if (userExists) {
    throw new ApiError(httpStatus.CONFLICT, 'Email already exists')
  }

  const plainPassword = userData.password
  if (!plainPassword) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Password is required')
  }

  const hashedPassword = await bcrypt.hash(plainPassword, 10)

  const newUser = await prisma.users.create({
    data: {
      full_name: userData.full_name,
      email: userData.email,
      password_hash: hashedPassword,
      role: userData.role || 'traveler',
      is_verified: userData.is_verified ?? false,
      verify_token: userData.verify_token || null,
      reset_pass_token: userData.reset_pass_token || null,
      token_expiry: userData.token_expiry || null,
    },
  })

  return sanitizeUser(newUser)
}

const loginUserWithEmail = async (email, password) => {
  const user = await prisma.users.findUnique({ where: { email } })

  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid email or password')
  }

  const passwordMatched = await bcrypt.compare(password, user.password_hash)
  if (!passwordMatched) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid email or password')
  }

  return sanitizeUser(user)
}
export { getUsers, createUser, loginUserWithEmail }
