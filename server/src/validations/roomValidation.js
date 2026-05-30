import Joi from 'joi'

export const createRoomSchema = Joi.object({
  room_number: Joi.string().pattern(/^\d{1,3}$/).required().trim().messages({
    'any.required': 'Room number is required',
    'string.empty': 'Room number is required',
    'string.pattern.base': 'Room number must be digits only and maximum 3 characters (e.g. 101 to 999)',
  }),
  status: Joi.string()
    .valid('available', 'occupied', 'maintenance')
    .default('available')
    .messages({
      'any.only': 'Room status must be one of: available, occupied, maintenance',
    }),
})

export const updateRoomSchema = Joi.object({
  room_number: Joi.string().pattern(/^\d{1,3}$/).trim().messages({
    'string.pattern.base': 'Room number must be digits only and maximum 3 characters (e.g. 101 to 999)',
  }),
  status: Joi.string()
    .valid('available', 'occupied', 'maintenance')
    .messages({
      'any.only': 'Room status must be one of: available, occupied, maintenance',
    }),
})
