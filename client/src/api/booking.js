import axiosClient from './axiosClient';

/**
 * Tạo đơn đặt phòng mới
 * @param {Object} data - { property_id, check_in_date, check_out_date, rooms: [{ room_type_id, quantity }] }
 */
export const createBooking = (data) => {
  return axiosClient.post('/bookings', data);
};

/**
 * Lấy danh sách booking của Traveler (phân trang + lọc)
 * @param {Object} params - { page, limit, status }
 */
export const getMyBookings = (params = {}) => {
  return axiosClient.get('/bookings/my-bookings', { params });
};

/**
 * Lấy danh sách booking cho Provider (phân trang + lọc)
 * @param {Object} params - { page, limit, status }
 */
export const getProviderBookings = (params = {}) => {
  return axiosClient.get('/bookings/provider-bookings', { params });
};

/**
 * Xem chi tiết 1 booking
 * @param {number} id - Booking ID
 */
export const getBookingDetail = (id) => {
  return axiosClient.get(`/bookings/${id}`);
};

/**
 * Provider cập nhật trạng thái booking
 * @param {number} id - Booking ID
 * @param {Object} data - { status: 'confirmed' | 'cancelled' }
 */
export const updateBookingStatus = (id, data) => {
  return axiosClient.put(`/bookings/${id}/status`, data);
};
