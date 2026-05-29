import Joi from 'joi'

export const createBookingSchema = Joi.object({
  property_id: Joi.number().integer().positive().required().messages({
    'any.required': 'Property ID is required',
    'number.base': 'Property ID must be a number',
    'number.positive': 'Property ID must be a positive number',
  }),
  check_in_date: Joi.date().iso().required().messages({
    'any.required': 'Check-in date is required',
    'date.base': 'Check-in date must be a valid date',
    'date.format': 'Check-in date must be in ISO format (YYYY-MM-DD)',
  }),
  check_out_date: Joi.date().iso().greater(Joi.ref('check_in_date')).required().messages({
    'any.required': 'Check-out date is required',
    'date.base': 'Check-out date must be a valid date',
    'date.greater': 'Check-out date must be after check-in date',
  }),
  rooms: Joi.array()
    .items(
      Joi.object({
        room_type_id: Joi.number().integer().positive().required().messages({
          'any.required': 'Room type ID is required',
          'number.base': 'Room type ID must be a number',
          'number.positive': 'Room type ID must be a positive number',
        }),
        quantity: Joi.number().integer().min(1).required().messages({
          'any.required': 'Quantity is required',
          'number.base': 'Quantity must be a number',
          'number.min': 'Quantity must be at least 1',
        }),
      })
    )
    .min(1)
    .required()
    .messages({
      'any.required': 'At least one room selection is required',
      'array.min': 'At least one room selection is required',
    }),
})

export const updateBookingStatusSchema = Joi.object({
  status: Joi.string().valid('confirmed', 'cancelled').required().messages({
    'any.required': 'Status is required',
    'any.only': 'Status must be either confirmed or cancelled',
  }),
})
