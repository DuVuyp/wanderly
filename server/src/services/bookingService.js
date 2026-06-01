import httpStatus from 'http-status'
import { Prisma } from '@prisma/client'

import prisma from '../config/prisma.js'
import USER_ROLES from '../constants/roles.js'
import ApiError from '../utils/ApiError.js'

/**
 * Tính số đêm giữa 2 ngày
 */
const calculateNights = (checkIn, checkOut) => {
  const msPerDay = 24 * 60 * 60 * 1000
  const start = new Date(checkIn)
  const end = new Date(checkOut)
  return Math.round((end - start) / msPerDay)
}

/**
 * Tạo đơn đặt phòng — Dùng Prisma $transaction
 *
 * Luồng:
 * 1. Kiểm tra property tồn tại
 * 2. Kiểm tra từng room_type thuộc property
 * 3. Kiểm tra phòng khả dụng (trừ đi số đang bị booking overlap)
 * 4. Tính total_price = Σ(base_price × quantity × số đêm)
 * 5. Tạo Booking + Booking_Details trong 1 transaction
 */
const createBooking = async (userId, bookingData) => {
  const { property_id, check_in_date, check_out_date, rooms } = bookingData

  // Tính số đêm
  const nights = calculateNights(check_in_date, check_out_date)
  if (nights <= 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Check-out date must be after check-in date')
  }

  // Thực hiện tất cả các bước bên trong 1 transaction để tránh Race Condition (kẹt phòng)
  const maxRetries = 3
  for (let attempt = 0; attempt < maxRetries; attempt += 1) {
    try {
      const booking = await prisma.$transaction(
        async (tx) => {
          // 1. Kiểm tra property tồn tại
          const property = await tx.properties.findUnique({
            where: { id: property_id },
            include: { Room_Types: true },
          })

          if (!property) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Property not found')
          }

          // 2. Kiểm tra từng room_type và tính giá
          let totalPrice = 0
          const bookingDetails = []

          for (const room of rooms) {
            const roomType = property.Room_Types.find((rt) => rt.id === room.room_type_id)

            if (!roomType) {
              throw new ApiError(
                httpStatus.BAD_REQUEST,
                `Room type with ID ${room.room_type_id} does not belong to this property`
              )
            }

            // 3. Kiểm tra phòng khả dụng
            const totalRooms = await tx.rooms.count({
              where: {
                room_type_id: room.room_type_id,
                status: 'available',
              },
            })

            const overlappingBookings = await tx.booking_Details.aggregate({
              _sum: { quantity: true },
              where: {
                room_type_id: room.room_type_id,
                Bookings: {
                  status: { in: ['pending', 'confirmed'] },
                  check_in_date: { lt: new Date(check_out_date) },
                  check_out_date: { gt: new Date(check_in_date) },
                },
              },
            })

            const bookedQuantity = overlappingBookings._sum.quantity || 0
            const availableQuantity = totalRooms - bookedQuantity

            if (room.quantity > availableQuantity) {
              throw new ApiError(
                httpStatus.BAD_REQUEST,
                `Not enough rooms available for "${roomType.name}". Requested: ${room.quantity}, Available: ${Math.max(0, availableQuantity)}`
              )
            }

            // Tính giá cho room type này
            const priceForThisType = Number(roomType.base_price) * room.quantity * nights
            totalPrice += priceForThisType

            bookingDetails.push({
              room_type_id: room.room_type_id,
              quantity: room.quantity,
              price_at_booking: Number(roomType.base_price),
            })
          }

          // 4. Tạo Booking + Booking_Details
          const newBooking = await tx.bookings.create({
            data: {
              user_id: userId,
              property_id,
              check_in_date: new Date(check_in_date),
              check_out_date: new Date(check_out_date),
              total_price: totalPrice,
              status: 'pending',
              Booking_Details: {
                create: bookingDetails,
              },
            },
            include: {
              Booking_Details: {
                include: {
                  Room_Types: {
                    select: { id: true, name: true, base_price: true, max_guests: true },
                  },
                },
              },
              Properties: {
                select: { id: true, name: true, address: true, property_type: true },
              },
            },
          })

          return newBooking
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
      )

      return booking
    } catch (error) {
      if (error?.code === 'P2034' && attempt < maxRetries - 1) {
        continue
      }

      throw error
    }
  }
}

/**
 * Lấy danh sách booking của Traveler (phân trang)
 */
const getMyBookings = async (userId, query = {}) => {
  const page = Number(query.page) > 0 ? Number(query.page) : 1
  const limit = Number(query.limit) > 0 ? Number(query.limit) : 10
  const skip = (page - 1) * limit

  const where = { user_id: userId }

  // Lọc theo status nếu có
  if (query.status) {
    where.status = query.status
  }

  const [bookings, total] = await Promise.all([
    prisma.bookings.findMany({
      where,
      include: {
        Properties: {
          select: { id: true, name: true, address: true, property_type: true },
        },
        Booking_Details: {
          include: {
            Room_Types: {
              select: { id: true, name: true, base_price: true, max_guests: true },
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
      take: limit,
      skip,
    }),
    prisma.bookings.count({ where }),
  ])

  return {
    bookings,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

/**
 * Lấy danh sách booking liên quan đến property của Provider (phân trang)
 */
const getProviderBookings = async (providerId, query = {}) => {
  const page = Number(query.page) > 0 ? Number(query.page) : 1
  const limit = Number(query.limit) > 0 ? Number(query.limit) : 10
  const skip = (page - 1) * limit

  const where = {
    Properties: { provider_id: providerId },
  }

  if (query.status) {
    where.status = query.status
  }

  const [bookings, total] = await Promise.all([
    prisma.bookings.findMany({
      where,
      include: {
        Users: {
          select: { id: true, full_name: true, email: true },
        },
        Properties: {
          select: { id: true, name: true, address: true, property_type: true },
        },
        Booking_Details: {
          include: {
            Room_Types: {
              select: { id: true, name: true, base_price: true, max_guests: true },
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
      take: limit,
      skip,
    }),
    prisma.bookings.count({ where }),
  ])

  // Calculate stats for all bookings of this provider (ignoring current status filter)
  const statsGroup = await prisma.bookings.groupBy({
    by: ['status'],
    where: { Properties: { provider_id: providerId } },
    _count: { id: true },
  })

  const stats = {
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
  }

  statsGroup.forEach((group) => {
    stats[group.status] = group._count.id
    stats.total += group._count.id
  })

  return {
    bookings,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    stats,
  }
}

/**
 * Xem chi tiết 1 booking
 * - Traveler chỉ xem booking của mình
 * - Provider chỉ xem booking thuộc property của mình
 */
const getBookingById = async (bookingId, user) => {
  const booking = await prisma.bookings.findUnique({
    where: { id: bookingId },
    include: {
      Users: {
        select: { id: true, full_name: true, email: true },
      },
      Properties: {
        select: {
          id: true,
          name: true,
          address: true,
          property_type: true,
          provider_id: true,
          check_in_time: true,
          check_out_time: true,
        },
      },
      Booking_Details: {
        include: {
          Room_Types: {
            select: { id: true, name: true, base_price: true, max_guests: true, amenities: true },
          },
        },
      },
    },
  })

  if (!booking) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Booking not found')
  }

  // Kiểm tra quyền truy cập
  const isOwner = booking.user_id === user.id
  const isProvider = user.role === USER_ROLES.PROVIDER && booking.Properties.provider_id === user.id
  const isAdmin = user.role === USER_ROLES.ADMIN

  if (!isOwner && !isProvider && !isAdmin) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You do not have permission to view this booking')
  }

  return booking
}

/**
 * Provider cập nhật trạng thái booking (confirm / cancel)
 */
const updateBookingStatus = async (bookingId, status, userId) => {
  // Tìm booking
  const booking = await prisma.bookings.findUnique({
    where: { id: bookingId },
    include: {
      Properties: { select: { provider_id: true } },
    },
  })

  if (!booking) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Booking not found')
  }

  // Kiểm tra booking thuộc property của provider
  if (booking.Properties.provider_id !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You can only manage bookings for your own properties')
  }

  // Kiểm tra trạng thái hợp lệ
  if (booking.status === 'completed') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot update a completed booking')
  }

  if (booking.status === 'cancelled') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot update a cancelled booking')
  }

  // Cập nhật trạng thái
  const updatedBooking = await prisma.bookings.update({
    where: { id: bookingId },
    data: { status },
    include: {
      Users: {
        select: { id: true, full_name: true, email: true },
      },
      Properties: {
        select: { id: true, name: true, address: true, property_type: true },
      },
      Booking_Details: {
        include: {
          Room_Types: {
            select: { id: true, name: true, base_price: true, max_guests: true },
          },
        },
      },
    },
  })

  return updatedBooking
}

export { createBooking, getMyBookings, getProviderBookings, getBookingById, updateBookingStatus }
