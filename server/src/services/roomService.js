import httpStatus from 'http-status'
import prisma from '../config/prisma.js'
import ApiError from '../utils/ApiError.js'
import { getRoomTypeById } from './roomTypeService.js'

export const getRoomById = async (id) => {
  const room = await prisma.rooms.findFirst({
    where: { id, deleted_at: null },
    include: {
      Room_Types: {
        include: {
          Properties: true,
        },
      },
    },
  })
  if (
    !room ||
    room.Room_Types.deleted_at !== null ||
    room.Room_Types.Properties.deleted_at !== null
  ) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Room not found')
  }
  return room
}

export const createRoom = async (roomTypeId, providerId, roomData) => {
  const roomType = await getRoomTypeById(roomTypeId)
  if (roomType.Properties.provider_id !== providerId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You do not have permission to add rooms to this room type')
  }

  const existingRoom = await prisma.rooms.findFirst({
    where: {
      room_type_id: roomTypeId,
      room_number: roomData.room_number,
      deleted_at: null,
    },
  })

  if (existingRoom) {
    throw new ApiError(httpStatus.CONFLICT, 'Room number already exists in this room type')
  }

  // Create room and increment total_quantity in transaction
  return prisma.$transaction(async (tx) => {
    const newRoom = await tx.rooms.create({
      data: {
        room_type_id: roomTypeId,
        room_number: roomData.room_number,
        status: roomData.status || 'available',
      },
    })

    await tx.room_Types.update({
      where: { id: roomTypeId },
      data: {
        total_quantity: {
          increment: 1,
        },
      },
    })

    return newRoom
  })
}

export const updateRoom = async (roomId, providerId, roomData) => {
  const room = await getRoomById(roomId)
  if (room.Room_Types.Properties.provider_id !== providerId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You do not have permission to update this room')
  }

  if (roomData.room_number && roomData.room_number !== room.room_number) {
    const existingRoom = await prisma.rooms.findFirst({
      where: {
        room_type_id: room.room_type_id,
        room_number: roomData.room_number,
        deleted_at: null,
      },
    })
    if (existingRoom) {
      throw new ApiError(httpStatus.CONFLICT, 'Room number already exists in this room type')
    }
  }

  return prisma.rooms.update({
    where: { id: roomId },
    data: {
      room_number: roomData.room_number,
      status: roomData.status,
    },
  })
}

export const deleteRoom = async (roomId, providerId) => {
  const room = await getRoomById(roomId)
  if (room.Room_Types.Properties.provider_id !== providerId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You do not have permission to delete this room')
  }

  return prisma.$transaction(async (tx) => {
    await tx.rooms.update({
      where: { id: roomId },
      data: { deleted_at: new Date() },
    })

    await tx.room_Types.update({
      where: { id: room.room_type_id },
      data: {
        total_quantity: {
          decrement: 1,
        },
      },
    })

    return { success: true }
  })
}
