import httpStatus from 'http-status'
import catchAsync from '../utils/catchAsync.js'
import * as roomService from '../services/roomService.js'

const createRoom = catchAsync(async (req, res) => {
  const room = await roomService.createRoom(
    Number(req.params.roomTypeId),
    req.user.id,
    req.body
  )
  res.status(httpStatus.CREATED).json({
    success: true,
    message: 'Room created successfully',
    data: room,
  })
})

const updateRoom = catchAsync(async (req, res) => {
  const room = await roomService.updateRoom(
    Number(req.params.roomId),
    req.user.id,
    req.body
  )
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Room updated successfully',
    data: room,
  })
})

const deleteRoom = catchAsync(async (req, res) => {
  await roomService.deleteRoom(
    Number(req.params.roomId),
    req.user.id
  )
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Room deleted successfully',
  })
})

export { createRoom, updateRoom, deleteRoom }
