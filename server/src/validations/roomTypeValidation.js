import Joi from 'joi'

export const createRoomTypeSchema = Joi.object({
  name: Joi.string().max(50).required().trim().messages({
    'any.required': 'Room type name is required',
    'string.empty': 'Room type name is required',
    'string.max': 'Room type name cannot exceed 50 characters',
  }),
  max_guests: Joi.number().integer().greater(0).max(20).required().messages({
    'any.required': 'Max guests is required',
    'number.base': 'Max guests must be a number',
    'number.integer': 'Max guests must be an integer',
    'number.greater': 'Max guests must be greater than 0',
    'number.max': 'Max guests cannot exceed 20 people',
  }),
  base_price: Joi.number().greater(0).required().messages({
    'any.required': 'Base price is required',
    'number.base': 'Base price must be a number',
    'number.greater': 'Base price must be greater than 0',
  }),
  amenities: Joi.string().allow('', null),
})
