import httpStatus from 'http-status'

import * as propertyService from '../services/propertyService.js'
import catchAsync from '../utils/catchAsync.js'

/**
 * GET /api/properties
 * Get a list of properties
 */
const getAllProperties = catchAsync(async (req, res) => {
  const result = await propertyService.getAllProperties(req.query)

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Properties retrieved successfully',
    data: result,
  })
})

/**
 * GET /api/properties/:id
 * Get property details by ID
 */
const getPropertyById = catchAsync(async (req, res) => {
  const propertyId = Number(req.params.id)
  const property = await propertyService.getPropertyById(propertyId)

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Property details retrieved successfully',
    data: property,
  })
})

/**
 * GET /api/properties/:id/room-types
 * Get room types for a specific property
 */
const getPropertyRoomTypes = catchAsync(async (req, res) => {
  const propertyId = Number(req.params.id)
  const roomTypes = await propertyService.getPropertyRoomTypes(propertyId, req.query)

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Room types retrieved successfully',
    data: roomTypes,
  })
})

export { getAllProperties, getPropertyById, getPropertyRoomTypes }
