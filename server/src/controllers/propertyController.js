import httpStatus from 'http-status'
import catchAsync from '../utils/catchAsync.js'
import * as propertyService from '../services/propertyService.js'
import prisma from '../config/prisma.js'
import USER_ROLES from '../constants/roles.js'

const createProperty = catchAsync(async (req, res) => {
  const property = await propertyService.createProperty(req.user.id, req.body)
  res.status(httpStatus.CREATED).json({
    success: true,
    message: 'Property created successfully',
    data: property,
  })
})

const getProperties = catchAsync(async (req, res) => {
  let properties
  if (req.user.role === USER_ROLES.PROVIDER) {
    properties = await propertyService.getPropertiesByProvider(req.user.id)
  } else {
    properties = await prisma.properties.findMany({
      include: {
        Room_Types: {
          include: {
            Rooms: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    })
  }

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Properties retrieved successfully',
    data: properties,
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

export { createProperty, getProperties, getProperty, updateProperty, deleteProperty }
