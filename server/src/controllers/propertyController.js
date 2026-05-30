import httpStatus from 'http-status'
import jwt from 'jsonwebtoken'
import prisma from '../config/prisma.js'
import USER_ROLES from '../constants/roles.js'
import catchAsync from '../utils/catchAsync.js'
import * as propertyService from '../services/propertyService.js'

const createProperty = catchAsync(async (req, res) => {
  const property = await propertyService.createProperty(req.user.id, req.body)
  res.status(httpStatus.CREATED).json({
    success: true,
    message: 'Property created successfully',
    data: property,
  })
})

const getProperties = catchAsync(async (req, res) => {
  // Try to authenticate optionally to see if it's a provider calling their dashboard
  let isProvider = false
  let providerId = null
  
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1]
      const secret = process.env.JWT_SECRET
      const payload = jwt.verify(token, secret)
      if (payload && payload.type === 'ACCESS') {
        const user = await prisma.users.findUnique({ where: { id: payload.id } })
        if (user && user.role === USER_ROLES.PROVIDER) {
          isProvider = true
          providerId = user.id
        }
      }
    } catch (err) {
      // ignore token verification errors, treat as guest/traveler search
    }
  }

  // If they are a provider and didn't specify typical search query parameters,
  // return their managed properties list (array format expected by provider dashboard)
  if (isProvider && !req.query.keyword && !req.query.property_type && !req.query.location && !req.query.page) {
    const properties = await propertyService.getPropertiesByProvider(providerId)
    return res.status(httpStatus.OK).json({
      success: true,
      message: 'Provider properties retrieved successfully',
      data: properties,
    })
  }

  // Otherwise, retrieve all properties (paginated, traveler search view)
  const result = await propertyService.getAllProperties(req.query)
  return res.status(httpStatus.OK).json({
    success: true,
    message: 'Properties retrieved successfully',
    data: result,
  })
})

const getProperty = catchAsync(async (req, res) => {
  const property = await propertyService.getPropertyById(Number(req.params.id))
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Property retrieved successfully',
    data: property,
  })
})

const updateProperty = catchAsync(async (req, res) => {
  const property = await propertyService.updateProperty(Number(req.params.id), req.user.id, req.body)
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Property updated successfully',
    data: property,
  })
})

const deleteProperty = catchAsync(async (req, res) => {
  await propertyService.deleteProperty(Number(req.params.id), req.user.id)
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Property deleted successfully',
  })
})

const getPropertyRoomTypes = catchAsync(async (req, res) => {
  const propertyId = Number(req.params.id)
  const roomTypes = await propertyService.getPropertyRoomTypes(propertyId, req.query)

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Room types retrieved successfully',
    data: roomTypes,
  })
})

// Aliases for compatibility
const getAllProperties = getProperties
const getPropertyById = getProperty

export {
  createProperty,
  getProperties,
  getProperty,
  updateProperty,
  deleteProperty,
  getPropertyRoomTypes,
  getAllProperties,
  getPropertyById,
}
