import httpStatus from 'http-status'
import prisma from '../config/prisma.js'
import ApiError from '../utils/ApiError.js'
import { getPropertyById } from './propertyService.js'

export const createRoomType = async (propertyId, providerId, roomTypeData) => {
  const property = await getPropertyById(propertyId) // checks deleted_at: null
  if (property.provider_id !== providerId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You do not have permission to add room types to this property')
  }

  return prisma.room_Types.create({
    data: {
      property_id: propertyId,
      name: roomTypeData.name,
      max_guests: roomTypeData.max_guests,
      base_price: roomTypeData.base_price,
      total_quantity: 0,
      amenities: roomTypeData.amenities || '',
    },
  })
}

export const getRoomTypesByProperty = async (propertyId) => {
  return prisma.room_Types.findMany({
    where: { property_id: propertyId, deleted_at: null },
    include: {
      Rooms: {
        where: { deleted_at: null },
      },
    },
    orderBy: {
      created_at: 'desc',
    },
  })
}

export const getRoomTypeById = async (id) => {
  const roomType = await prisma.room_Types.findFirst({
    where: { id, deleted_at: null },
    include: {
      Properties: true,
      Rooms: {
        where: { deleted_at: null },
      },
    },
  })
  if (!roomType || roomType.Properties.deleted_at !== null) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Room type not found')
  }
  return roomType
}
