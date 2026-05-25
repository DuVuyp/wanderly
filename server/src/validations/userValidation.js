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
      if (value.length < 8) {
        return helpers.error('password.min')
      }

      if (
        !/[a-z]/.test(value) ||
        !/[A-Z]/.test(value) ||
        !/\d/.test(value) ||
        !/[^A-Za-z\d]/.test(value)
      ) {
        return helpers.error('password.weak')
      }

      return value
    })
    .messages({
      'any.required': 'Password is required',
      'string.empty': 'Password is required',
      'password.min': 'Password must be at least 8 characters',
      'password.weak': 'Password must include uppercase, lowercase, number, and special character',
    }),
  role: Joi.string()
    .valid(...Object.values(USER_ROLES))
    .default(USER_ROLES.TRAVELER)
    .messages({
      'any.only': 'Role is invalid',
    }),
})

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
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
