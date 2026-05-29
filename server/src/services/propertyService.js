import httpStatus from 'http-status'
import prisma from '../config/prisma.js'

import ApiError from '../utils/ApiError.js'

/**
 * Get all properties (paginated)
 * @param {Object} query
 * @returns {Promise<Object>}
 */
export const getAllProperties = async (query = {}) => {
  const page = Number(query.page) > 0 ? Number(query.page) : 1
  const limit = Number(query.limit) > 0 ? Number(query.limit) : 10
  const skip = (page - 1) * limit

  const where = {}
  
  if (query.keyword) {
    where.name = { contains: query.keyword } // Adjust based on DB dialect if necessary (e.g. mode: 'insensitive' for postgres, but Prisma SQLite doesn't support it)
  }
  
  if (query.property_type) {
    where.property_type = query.property_type
  }
  
  if (query.location) {
    where.address = { contains: query.location }
  }

  const [properties, total] = await Promise.all([
    prisma.properties.findMany({
      where,
      include: {
        Room_Types: {
          select: { id: true, name: true, base_price: true, max_guests: true },
        },
      },
      orderBy: { created_at: 'desc' },
      take: limit,
      skip,
    }),
    prisma.properties.count({ where }),
  ])

  return {
    properties,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

/**
 * Get property by ID
 * @param {number} propertyId
 * @returns {Promise<Object>}
 */
export const getPropertyById = async (propertyId) => {
  const property = await prisma.properties.findUnique({
    where: { id: propertyId },
    include: {
      Users: {
        select: {
          id: true,
          full_name: true,
          email: true,
        },
      },
    },
  })

  if (!property) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Property not found')
  }

  return property
}

/**
 * Get room types for a property
 * @param {number} propertyId
 * @param {Object} query
 * @returns {Promise<Array>}
 */
export const getPropertyRoomTypes = async (propertyId, query = {}) => {
  // First check if property exists
  const property = await prisma.properties.findUnique({
    where: { id: propertyId },
  })

  if (!property) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Property not found')
  }

  const roomTypes = await prisma.room_Types.findMany({
    where: { property_id: propertyId },
    orderBy: { base_price: 'asc' },
  })

  const { check_in_date, check_out_date } = query
  if (check_in_date && check_out_date) {
    const start = new Date(check_in_date)
    const end = new Date(check_out_date)

    // Calculate available rooms for each room type
    for (const rt of roomTypes) {
      const totalRooms = await prisma.rooms.count({
        where: { room_type_id: rt.id, status: 'available' },
      })

      const overlappingBookings = await prisma.booking_Details.aggregate({
        _sum: { quantity: true },
        where: {
          room_type_id: rt.id,
          Bookings: {
            status: { in: ['pending', 'confirmed'] },
            check_in_date: { lt: end },
            check_out_date: { gt: start },
          },
        },
      })

      const bookedQuantity = overlappingBookings._sum.quantity || 0
      rt.available_quantity = Math.max(0, totalRooms - bookedQuantity)
    }
  }

  return roomTypes
}
