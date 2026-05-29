import httpStatus from 'http-status'
import catchAsync from '../utils/catchAsync.js'
import * as bookingService from '../services/bookingService.js'

/**
 * POST /api/bookings
 * Tạo đơn đặt phòng mới (Traveler)
 */
const createBooking = catchAsync(async (req, res) => {
  const booking = await bookingService.createBooking(req.user.id, req.body)

  res.status(httpStatus.CREATED).json({
    success: true,
    message: 'Booking created successfully',
    data: booking,
  })
})

/**
 * GET /api/bookings/my-bookings
 * Traveler xem lịch sử đặt phòng
 */
const getMyBookings = catchAsync(async (req, res) => {
  const result = await bookingService.getMyBookings(req.user.id, req.query)

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Bookings retrieved successfully',
    data: result,
  })
})

/**
 * GET /api/bookings/provider-bookings
 * Provider xem đơn đặt phòng gửi tới property của mình
 */
const getProviderBookings = catchAsync(async (req, res) => {
  const result = await bookingService.getProviderBookings(req.user.id, req.query)

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Provider bookings retrieved successfully',
    data: result,
  })
})

/**
 * GET /api/bookings/:id
 * Xem chi tiết 1 booking
 */
const getBookingDetail = catchAsync(async (req, res) => {
  const bookingId = Number(req.params.id)
  const booking = await bookingService.getBookingById(bookingId, req.user)

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Booking detail retrieved successfully',
    data: booking,
  })
})

/**
 * PUT /api/bookings/:id/status
 * Provider duyệt hoặc hủy đơn đặt phòng
 */
const updateBookingStatus = catchAsync(async (req, res) => {
  const bookingId = Number(req.params.id)
  const { status } = req.body
  const booking = await bookingService.updateBookingStatus(bookingId, status, req.user.id)

  res.status(httpStatus.OK).json({
    success: true,
    message: `Booking ${status} successfully`,
    data: booking,
  })
})

export { createBooking, getMyBookings, getProviderBookings, getBookingDetail, updateBookingStatus }
