import express from 'express'

import {
  createBooking,
  getMyBookings,
  getProviderBookings,
  getBookingDetail,
  updateBookingStatus,
} from '../controllers/bookingController.js'
import validate from '../middlewares/validateMiddleware.js'
import auth from '../middlewares/authMiddleware.js'
import USER_ROLES from '../constants/roles.js'
import { createBookingSchema, updateBookingStatusSchema } from '../validations/bookingValidation.js'

const router = express.Router()

// Traveler tạo đơn đặt phòng
router.post('/', auth(USER_ROLES.TRAVELER), validate(createBookingSchema), createBooking)

// Traveler xem lịch sử đặt phòng
router.get('/my-bookings', auth(USER_ROLES.TRAVELER), getMyBookings)

// Provider xem đơn đặt phòng
router.get('/provider-bookings', auth(USER_ROLES.PROVIDER), getProviderBookings)

// Xem chi tiết 1 booking (Traveler xem của mình, Provider xem thuộc property mình)
router.get('/:id', auth(), getBookingDetail)

// Provider duyệt / hủy đơn
router.put(
  '/:id/status',
  auth(USER_ROLES.PROVIDER),
  validate(updateBookingStatusSchema),
  updateBookingStatus
)

export default router
