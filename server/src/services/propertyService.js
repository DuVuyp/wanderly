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
    },
  })
}

export const getPropertiesByProvider = async (providerId) => {
  return prisma.properties.findMany({
    where: { provider_id: providerId },
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

export const getPropertyById = async (id) => {
  const property = await prisma.properties.findUnique({
    where: { id },
    include: {
      Room_Types: {
        include: {
          Rooms: true,
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

  return prisma.properties.delete({
    where: { id },
  })
}
