import Joi from 'joi'

const updateProfile = Joi.object({
  full_name: Joi.string().min(2).max(255),
  phone_number: Joi.string().max(20).allow('', null),
  avatar: Joi.string().uri({ scheme: ['http', 'https'] }).allow('', null),
})

const changePassword = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string()
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
      'any.required': 'New password is required',
      'string.empty': 'New password is required',
      'password.min': 'Password must be at least 8 characters',
      'password.weak': 'Password must include uppercase, lowercase, number, and special character',
    }),
})

export { updateProfile, changePassword }
