import Joi from 'joi'

export const createPropertySchema = Joi.object({
  name: Joi.string().required().trim().messages({
    'any.required': 'Property name is required',
    'string.empty': 'Property name is required',
  }),
  property_type: Joi.string()
    .valid('hotel', 'homestay', 'resort', 'villa')
    .required()
    .messages({
      'any.required': 'Property type is required',
      'any.only': 'Property type must be one of: hotel, homestay, resort, villa',
    }),
  address: Joi.string().required().trim().messages({
    'any.required': 'Address is required',
    'string.empty': 'Address is required',
  }),
  latitude: Joi.number().min(-90).max(90).required().messages({
    'any.required': 'Latitude is required',
    'number.base': 'Latitude must be a number',
    'number.min': 'Latitude must be between -90 and 90',
    'number.max': 'Latitude must be between -90 and 90',
  }),
  longitude: Joi.number().min(-180).max(180).required().messages({
    'any.required': 'Longitude is required',
    'number.base': 'Longitude must be a number',
    'number.min': 'Longitude must be between -180 and 180',
    'number.max': 'Longitude must be between -180 and 180',
  }),
  check_in_time: Joi.string()
    .pattern(/^(?:[01]\d|2[0-3]):[0-5]\d$/)
    .required()
    .messages({
      'any.required': 'Check-in time is required',
      'string.pattern.base': 'Check-in time must be in HH:MM format (24h)',
    }),
  check_out_time: Joi.string()
    .pattern(/^(?:[01]\d|2[0-3]):[0-5]\d$/)
    .required()
    .messages({
      'any.required': 'Check-out time is required',
      'string.pattern.base': 'Check-out time must be in HH:MM format (24h)',
    }),
})

export const updatePropertySchema = Joi.object({
  name: Joi.string().trim(),
  property_type: Joi.string().valid('hotel', 'homestay', 'resort', 'villa'),
  address: Joi.string().trim(),
  latitude: Joi.number().min(-90).max(90),
  longitude: Joi.number().min(-180).max(180),
  check_in_time: Joi.string().pattern(/^(?:[01]\d|2[0-3]):[0-5]\d$/),
  check_out_time: Joi.string().pattern(/^(?:[01]\d|2[0-3]):[0-5]\d$/),
})
