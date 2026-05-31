import httpStatus from 'http-status'
import catchAsync from '../utils/catchAsync.js'
import * as roomTypeService from '../services/roomTypeService.js'

const createRoomType = catchAsync(async (req, res) => {
  const roomType = await roomTypeService.createRoomType(
    Number(req.params.propertyId),
    req.user.id,
    req.body
  )
  res.status(httpStatus.CREATED).json({
    success: true,
    message: 'Room type created successfully',
    data: roomType,
  })
})

const getRoomTypes = catchAsync(async (req, res) => {
  const roomTypes = await roomTypeService.getRoomTypesByProperty(Number(req.params.propertyId))
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Room types retrieved successfully',
    data: roomTypes,
  })
})

export { createRoomType, getRoomTypes }
