import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Package, Calendar, Clock, MapPin, ChevronRight,
  Filter, Search, AlertCircle, CheckCircle2, XCircle,
  Loader2, RefreshCw, Wallet, CalendarDays, Eye, X
} from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { getMyBookings, getBookingDetail } from '../api/booking';

const statusConfig = {
  pending: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    icon: Clock
  },
  confirmed: {
    label: 'Confirmed',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    icon: CheckCircle2
  },
  completed: {
    label: 'Completed',
    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    icon: CheckCircle2
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    icon: XCircle
  }
};

function MyBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  
  // Modal state
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const loadBookings = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      
      const response = await getMyBookings(params);
      setBookings(response.data?.bookings || []);
      setPagination(response.data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 });
    } catch (error) {
      console.error('Error loading bookings:', error);
      toast.error(error.response?.data?.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadBookings(1);
  }, [loadBookings]);

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // Format date
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const StatusBadge = ({ status }) => {
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${config.color}`}>
        <Icon className="h-4 w-4" />
        {config.label}
      </span>
    );
  };

  const handleViewDetails = async (bookingId) => {
    try {
      setLoadingDetail(true);
      setShowModal(true);
      const res = await getBookingDetail(bookingId);
      setSelectedBooking(res.data?.data || res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load booking details');
      setShowModal(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setTimeout(() => setSelectedBooking(null), 300);
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 pt-20 dark:bg-gray-900">
        <div className="mx-auto max-w-6xl px-4 py-8">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="flex items-center gap-3 text-3xl font-bold text-gray-900 dark:text-white">
                <Package className="h-8 w-8 text-indigo-600" />
                My Bookings
              </h1>
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                Manage and track your bookings
              </p>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-gray-700 focus:border-transparent focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <button
                onClick={() => loadBookings(1)}
                className="rounded-xl border border-gray-200 bg-white p-2.5 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
              >
                <RefreshCw className={`h-5 w-5 text-gray-600 dark:text-gray-400 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Bookings List */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
          ) : bookings.length === 0 ? (
            <div className="rounded-2xl bg-white p-12 text-center shadow-sm dark:bg-gray-800">
              <Package className="mx-auto mb-4 h-16 w-16 text-gray-300 dark:text-gray-600" />
              <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                No bookings found
              </h3>
              <p className="mb-6 text-gray-600 dark:text-gray-400">
                {statusFilter
                  ? `You don't have any ${statusFilter} bookings.`
                  : "You haven't made any bookings yet."}
              </p>
              <button
                onClick={() => navigate('/services')}
                className="rounded-xl bg-indigo-600 px-6 py-3 font-medium text-white transition-colors hover:bg-indigo-700"
              >
                Browse Services
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => {
                const totalItems = booking.Booking_Details?.reduce((sum, item) => sum + item.quantity, 0) || 0;
                
                return (
                  <div
                    key={booking.id}
                    onClick={() => handleViewDetails(booking.id)}
                    className="group cursor-pointer rounded-2xl border border-transparent bg-white p-6 shadow-sm transition-all hover:border-indigo-200 hover:shadow-lg dark:bg-gray-800 dark:hover:border-indigo-800"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-3">
                          <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                            #{booking.id.toString().padStart(6, '0')}
                          </span>
                          <StatusBadge status={booking.status} />
                        </div>

                        <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                          {booking.Properties?.name || 'Property Name'}
                        </h3>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center gap-1.5">
                            <CalendarDays className="h-4 w-4" />
                            {formatDate(booking.check_in_date)} - {formatDate(booking.check_out_date)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Package className="h-4 w-4" />
                            {totalItems} room{totalItems > 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
                          <p className="text-xl font-bold text-gray-900 dark:text-white">
                            {formatPrice(booking.total_price)}
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400 transition-all group-hover:translate-x-1 group-hover:text-indigo-600" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-600 dark:text-gray-400">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page >= pagination.totalPages}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />

      {/* Booking Details Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal}></div>
          <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-800 animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Booking Details</h2>
              <button
                onClick={closeModal}
                className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="max-h-[70vh] overflow-y-auto px-6 py-6">
              {loadingDetail ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                </div>
              ) : selectedBooking ? (
                <div className="space-y-6">
                  {/* Property Info */}
                  <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-700/50">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {selectedBooking.Properties?.name || 'Property'}
                      </h3>
                      <StatusBadge status={selectedBooking.status} />
                    </div>
                    <p className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="h-4 w-4" />
                      {selectedBooking.Properties?.address}
                    </p>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-4 rounded-xl border border-gray-100 p-4 dark:border-gray-700">
                    <div>
                      <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">Check-in</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {formatDate(selectedBooking.check_in_date)}
                      </p>
                    </div>
                    <div>
                      <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">Check-out</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {formatDate(selectedBooking.check_out_date)}
                      </p>
                    </div>
                  </div>

                  {/* Rooms */}
                  <div>
                    <h4 className="mb-3 font-semibold text-gray-900 dark:text-white">Room Details</h4>
                    <div className="space-y-3">
                      {selectedBooking.Booking_Details?.map((room) => (
                        <div key={room.id} className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-700/30">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {room.Room_Types?.name}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {formatPrice(room.price_at_booking)} / night
                            </p>
                          </div>
                          <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                            x{room.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-gray-500">Could not load details.</div>
              )}
            </div>

            {/* Modal Footer */}
            {!loadingDetail && selectedBooking && (
              <div className="border-t border-gray-100 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-800/80">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Amount</span>
                  <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                    {formatPrice(selectedBooking.total_price)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default MyBookings;
