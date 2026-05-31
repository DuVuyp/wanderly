import Joi from 'joi'

import USER_ROLES from '../constants/roles.js'

export const createUserSchema = Joi.object({
  full_name: Joi.string().min(2).max(100).required().trim().messages({
    'any.required': 'Full name is required',
    'string.empty': 'Full name is required',
    'string.min': 'Full name must be at least 2 characters',
    'string.max': 'Full name must be at most 100 characters',
  }),
  email: Joi.string().email().required().lowercase().trim().messages({
    'any.required': 'Email is required',
    'string.email': 'Email must be a valid email address',
    'string.empty': 'Email is required',
  }),
  password: Joi.string()
    .required()
    .custom((value, helpers) => {
      const trimmed = value.trim()

      if (/\s/.test(trimmed)) {
        return helpers.error('password.spaces')
      }

      if (trimmed.length < 8) {
        return helpers.error('password.min')
      }

      if (
        !/[a-z]/.test(trimmed) ||
        !/[A-Z]/.test(trimmed) ||
        !/\d/.test(trimmed) ||
        !/[^A-Za-z\d]/.test(trimmed)
      ) {
        return helpers.error('password.weak')
      }

      return trimmed
    })
    .messages({
      'any.required': 'Password is required',
      'string.empty': 'Password is required',
      'password.spaces': 'Password must not contain spaces',
      'password.min': 'Password must be at least 8 characters',
      'password.weak': 'Password must include uppercase, lowercase, number, and special character',
    }),
  role: Joi.string()
    .valid(USER_ROLES.TRAVELER, USER_ROLES.PROVIDER)
    .default(USER_ROLES.TRAVELER)
    .messages({
      'any.only': 'Role is invalid (must be traveler or provider)',
    }),
})

export const loginSchema = Joi.object({
  email: Joi.string().email().required().lowercase().trim().messages({
    'string.empty': 'Email is required',
    'any.required': 'Email is required',
    'string.email': 'Email must be a valid email address',
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Password is required',
    'any.required': 'Password is required',
  }),
})

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    'any.required': 'Refresh token is required',
    'string.empty': 'Refresh token is required',
  }),
})

export const updateUserRoleSchema = Joi.object({
  role: Joi.string()
    .valid(...Object.values(USER_ROLES))
    .required()
    .messages({
      'any.required': 'Role is required',
      'any.only': 'Role must be either traveler, provider, or admin',
    }),
})
