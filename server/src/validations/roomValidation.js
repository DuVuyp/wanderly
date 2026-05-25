import Joi from 'joi'

export const createRoomSchema = Joi.object({
  room_number: Joi.string().required().trim().messages({
    'any.required': 'Room number is required',
    'string.empty': 'Room number is required',
  }),
  status: Joi.string()
    .valid('available', 'occupied', 'maintenance')
    .default('available')
    .messages({
      'any.only': 'Room status must be one of: available, occupied, maintenance',
    }),
})

export const updateRoomSchema = Joi.object({
  room_number: Joi.string().trim(),
  status: Joi.string()
    .valid('available', 'occupied', 'maintenance')
    .messages({
      'any.only': 'Room status must be one of: available, occupied, maintenance',
    }),
})
