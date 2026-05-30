import bcrypt from 'bcryptjs'
import httpStatus from 'http-status'

import prisma from '../config/prisma.js'
import ApiError from '../utils/ApiError.js'

const sanitizeUser = (user) => {
  if (!user) return user
  const safeUser = { ...user }
  delete safeUser.password_hash
  delete safeUser.verify_token
  delete safeUser.reset_pass_token
  delete safeUser.token_expiry
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
    where: { ...filter, is_deleted: { not: true } },
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

  if (!user || user.is_deleted) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid email or password')
  }

  const passwordMatched = await bcrypt.compare(password, user.password_hash)
  if (!passwordMatched) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid email or password')
  }

  return sanitizeUser(user)
}

const getUsersAdmin = async ({ page = 1, limit = 10, role, search }) => {
  const skip = (page - 1) * limit
  const where = { is_deleted: { not: true } }
  
  if (role) {
    where.role = role
  }

  if (search) {
    where.OR = [
      { email: { contains: search } },
      { full_name: { contains: search } }
    ]
  }

  const users = await prisma.users.findMany({
    where,
    skip: Number(skip),
    take: Number(limit),
    orderBy: { created_at: 'desc' },
  })

  const total = await prisma.users.count({ where })

  return {
    users: users.map(sanitizeUser),
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit)
    }
  }
}

const getUserById = async (id) => {
  const user = await prisma.users.findUnique({
    where: { id: Number(id) }
  })

  if (!user || user.is_deleted) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found')
  }

  return sanitizeUser(user)
}

const updateUserRole = async (id, newRole) => {
  const user = await prisma.users.findUnique({
    where: { id: Number(id) }
  })

  if (!user || user.is_deleted) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found')
  }

  const updatedUser = await prisma.users.update({
    where: { id: Number(id) },
    data: { role: newRole }
  })

  return sanitizeUser(updatedUser)
}

const deleteUser = async (id) => {
  const user = await prisma.users.findUnique({
    where: { id: Number(id) }
  })

  if (!user || user.is_deleted) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found')
  }

  await prisma.users.update({
    where: { id: Number(id) },
    data: { is_deleted: true }
  })
}

export { getUsers, createUser, loginUserWithEmail, getUsersAdmin, getUserById, updateUserRole, deleteUser }
