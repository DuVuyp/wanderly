import httpStatus from 'http-status'
import prisma from '../config/prisma.js'
import ApiError from '../utils/ApiError.js'

const parseTimeToDate = (timeStr) => {
  if (!timeStr) return undefined
  return new Date(`1970-01-01T${timeStr}:00.000Z`)
}

export const createProperty = async (providerId, propertyData) => {
  return prisma.properties.create({
    data: {
      provider_id: providerId,
      name: propertyData.name,
      property_type: propertyData.property_type,
      address: propertyData.address,
      latitude: propertyData.latitude,
      longitude: propertyData.longitude,
      check_in_time: parseTimeToDate(propertyData.check_in_time),
      check_out_time: parseTimeToDate(propertyData.check_out_time),
      is_deleted: false,
    },
  })
}

export const getPropertiesByProvider = async (providerId) => {
  return prisma.properties.findMany({
    where: { provider_id: providerId, is_deleted: { not: true } },
    include: {
      Room_Types: {
        where: { is_deleted: { not: true } },
        include: {
          Rooms: {
            where: { is_deleted: { not: true } },
          },
        },
      },
    },
    orderBy: {
      created_at: 'desc',
    },
  })
}

/**
 * Get all properties (paginated)
 * @param {Object} query
 * @returns {Promise<Object>}
 */
export const getAllProperties = async (query = {}) => {
  const page = Number(query.page) > 0 ? Number(query.page) : 1
  const limit = Number(query.limit) > 0 ? Number(query.limit) : 10
  const skip = (page - 1) * limit

  const where = { is_deleted: { not: true } }
  
  if (query.keyword) {
    where.name = { contains: query.keyword }
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
          where: { is_deleted: { not: true } },
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
  const property = await prisma.properties.findFirst({
    where: { id: propertyId, is_deleted: { not: true } },
    include: {
      Users: {
        select: {
          id: true,
          full_name: true,
          email: true,
        },
      },
      Room_Types: {
        where: { is_deleted: { not: true } },
        include: {
          Rooms: {
            where: { is_deleted: { not: true } },
          },
        },
      },
    },
  })

  if (!property) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Property not found')
  }

  return property
}

export const updateProperty = async (id, providerId, propertyData) => {
  const property = await getPropertyById(id)
  if (property.provider_id !== providerId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You do not have permission to update this property')
  }

  const updateData = {
    name: propertyData.name,
    property_type: propertyData.property_type,
    address: propertyData.address,
    latitude: propertyData.latitude,
    longitude: propertyData.longitude,
  }

  if (propertyData.check_in_time) {
    updateData.check_in_time = parseTimeToDate(propertyData.check_in_time)
  }
  if (propertyData.check_out_time) {
    updateData.check_out_time = parseTimeToDate(propertyData.check_out_time)
  }

  return prisma.properties.update({
    where: { id },
    data: updateData,
  })
}

export const deleteProperty = async (id, providerId) => {
  const property = await getPropertyById(id)
  if (property.provider_id !== providerId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You do not have permission to delete this property')
  }

  return prisma.$transaction(async (tx) => {
    // 1. Soft delete physical rooms nested in this property's room types
    const roomTypes = await tx.room_Types.findMany({
      where: { property_id: id, is_deleted: { not: true } },
    })
    const roomTypeIds = roomTypes.map((rt) => rt.id)
    if (roomTypeIds.length > 0) {
      await tx.rooms.updateMany({
        where: { room_type_id: { in: roomTypeIds }, is_deleted: { not: true } },
        data: { is_deleted: true },
      })
    }

    // 2. Soft delete room types
    await tx.room_Types.updateMany({
      where: { property_id: id, is_deleted: { not: true } },
      data: { is_deleted: true },
    })

    // 3. Soft delete property itself
    return tx.properties.update({
      where: { id },
      data: { is_deleted: true },
    })
  })
}

/**
 * Get room types for a property
 * @param {number} propertyId
 * @param {Object} query
 * @returns {Promise<Array>}
 */
export const getPropertyRoomTypes = async (propertyId, query = {}) => {
  // First check if property exists
  const property = await prisma.properties.findFirst({
    where: { id: propertyId, is_deleted: { not: true } },
  })

  if (!property) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Property not found')
  }

  const roomTypes = await prisma.room_Types.findMany({
    where: { property_id: propertyId, is_deleted: { not: true } },
    orderBy: { base_price: 'asc' },
  })

  const { check_in_date, check_out_date } = query
  if (check_in_date && check_out_date) {
    const start = new Date(check_in_date)
    const end = new Date(check_out_date)

    // Calculate available rooms for each room type
    for (const rt of roomTypes) {
      const totalRooms = await prisma.rooms.count({
        where: { room_type_id: rt.id, status: 'available', is_deleted: { not: true } },
      })

      const overlappingBookings = await prisma.booking_Details.aggregate({
        _sum: { quantity: true },
        where: {
          room_type_id: rt.id,
          is_deleted: { not: true },
          Bookings: {
            status: { in: ['pending', 'confirmed'] },
            is_deleted: { not: true },
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
