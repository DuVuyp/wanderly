import httpStatus from 'http-status'
import prisma from '../config/prisma.js'
import ApiError from '../utils/ApiError.js'
import { getPropertyById } from './propertyService.js'

export const createRoomType = async (propertyId, providerId, roomTypeData) => {
  const property = await getPropertyById(propertyId)
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
      is_deleted: false,
    },
  })
}

export const getRoomTypesByProperty = async (propertyId) => {
  return prisma.room_Types.findMany({
    where: { property_id: propertyId, is_deleted: { not: true } },
    include: {
      Rooms: {
        where: { is_deleted: { not: true } },
      },
    },
    orderBy: {
      created_at: 'desc',
    },
  })
}

export const getRoomTypeById = async (id) => {
  const roomType = await prisma.room_Types.findFirst({
    where: { id, is_deleted: { not: true } },
    include: {
      Properties: true,
      Rooms: {
        where: { is_deleted: { not: true } },
      },
    },
  })
  if (!roomType || roomType.Properties.is_deleted) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Room type not found')
  }
  return roomType
}
