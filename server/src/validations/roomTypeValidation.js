import Joi from 'joi'

export const createRoomTypeSchema = Joi.object({
  name: Joi.string().required().trim().messages({
    'any.required': 'Room type name is required',
    'string.empty': 'Room type name is required',
  }),
  max_guests: Joi.number().integer().greater(0).required().messages({
    'any.required': 'Max guests is required',
    'number.base': 'Max guests must be a number',
    'number.integer': 'Max guests must be an integer',
    'number.greater': 'Max guests must be greater than 0',
  }),
  base_price: Joi.number().greater(0).required().messages({
    'any.required': 'Base price is required',
    'number.base': 'Base price must be a number',
    'number.greater': 'Base price must be greater than 0',
  }),
  amenities: Joi.string().allow('', null),
})
