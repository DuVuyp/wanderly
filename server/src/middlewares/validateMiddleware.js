import httpStatus from 'http-status'

import ApiError from '../utils/ApiError.js'

const validate = (schema) => (req, res, next) => {
  if (!req.body) req.body = {}
  const { value, error } = schema.validate(req.body, {
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: true,
  })

  if (error) {
    const errorMessage = error.details
      .map((detail) => {
        if (typeof req.t === 'function') {
          return req.t(detail.message, {
            ...detail.context,
            field: detail.context.label,
          })
        }

        return detail.message
      })
      .join(', ')

    return next(new ApiError(httpStatus.BAD_REQUEST, errorMessage))
  }

  req.body = value
  return next()
}

export default validate
