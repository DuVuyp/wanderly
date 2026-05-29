import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  CalendarDays,
  Clock,
  ChevronLeft,
  ChevronRight,
  Filter,
  Eye,
  X,
  MapPin,
  CreditCard,
  Loader2,
} from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { getMyBookings, getBookingDetail } from '../api/booking';

const STATUS_STYLES = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-700',
};

const STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

function MyBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchBookings = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      const res = await getMyBookings(params);
      setBookings(res.data?.bookings || []);
      setPagination(res.data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings(1);
  }, [statusFilter]);

  const handleViewDetail = async (bookingId) => {
    setLoadingDetail(true);
    try {
      const res = await getBookingDetail(bookingId);
      setSelectedBooking(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load booking detail');
    } finally {
      setLoadingDetail(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-surface-bright text-on-surface">
      <Header />
      <main className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          {/* Page Header */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold sm:text-4xl">
                <span className="text-gradient">My</span> Bookings
              </h1>
              <p className="mt-2 text-on-surface-variant">
                View and track all your hotel reservations.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/booking')}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-gradient-start to-button-gradient-pink px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:scale-[1.02]"
            >
              <CalendarDays className="h-4 w-4" />
              New Booking
            </button>
          </div>

          {/* Status Filter */}
          <div className="mb-6 flex items-center gap-2 overflow-x-auto rounded-full border border-outline-variant bg-white p-1.5 shadow-sm">
            <Filter className="ml-2 h-4 w-4 shrink-0 text-on-surface-variant" />
            {['', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={[
                  'shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition',
                  statusFilter === status
                    ? 'bg-gradient-to-r from-gradient-start to-button-gradient-pink text-white shadow'
                    : 'text-on-surface-variant hover:bg-primary/10 hover:text-primary',
                ].join(' ')}
              >
                {status === '' ? 'All' : STATUS_LABELS[status]}
              </button>
            ))}
          </div>

          {/* Bookings List */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : bookings.length === 0 ? (
            <div className="rounded-[2rem] border border-outline-variant bg-white p-12 text-center shadow-sm">
              <CalendarDays className="mx-auto h-12 w-12 text-on-surface-variant/40" />
              <h3 className="mt-4 text-lg font-semibold text-on-surface">No bookings yet</h3>
              <p className="mt-2 text-sm text-on-surface-variant">
                Start exploring properties and make your first reservation!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="group rounded-[1.75rem] border border-outline-variant bg-white p-5 shadow-sm transition hover:border-primary/20 hover:shadow-md"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-base font-semibold text-on-surface">
                          {booking.Properties?.name || `Property #${booking.property_id}`}
                        </h3>
                        <span
                          className={[
                            'rounded-full px-3 py-0.5 text-xs font-semibold capitalize',
                            STATUS_STYLES[booking.status] || 'bg-gray-100 text-gray-600',
                          ].join(' ')}
                        >
                          {booking.status}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-on-surface-variant">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />
                          {formatDate(booking.check_in_date)} → {formatDate(booking.check_out_date)}
                        </span>
                        {booking.Properties?.address && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {booking.Properties.address.length > 40
                              ? booking.Properties.address.slice(0, 40) + '...'
                              : booking.Properties.address}
                          </span>
                        )}
                      </div>

                      {booking.Booking_Details?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {booking.Booking_Details.map((detail) => (
                            <span
                              key={detail.id}
                              className="rounded-full border border-primary/15 bg-primary/5 px-3 py-0.5 text-xs font-medium text-primary"
                            >
                              {detail.Room_Types?.name || 'Room'} × {detail.quantity}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-bold text-gradient">
                          {Number(booking.total_price).toLocaleString('vi-VN')}
                        </p>
                        <p className="text-xs text-on-surface-variant">VND</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleViewDetail(booking.id)}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant bg-surface-container-low text-on-surface-variant transition hover:border-primary hover:bg-primary hover:text-white"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => fetchBookings(pagination.page - 1)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant bg-white text-on-surface-variant transition hover:border-primary hover:text-primary disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm font-medium text-on-surface-variant">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                type="button"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchBookings(pagination.page + 1)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant bg-white text-on-surface-variant transition hover:border-primary hover:text-primary disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-[2rem] bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setSelectedBooking(null)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant transition hover:bg-red-50 hover:text-red-600"
            >
              <X className="h-4 w-4" />
            </button>

            <h2 className="font-display text-xl font-bold">Booking Detail</h2>
            <p className="text-sm text-on-surface-variant">Booking #{selectedBooking.id}</p>

            <div className="mt-5 space-y-4">
              <div className="rounded-xl bg-surface-container-low p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Property</p>
                <p className="mt-1 font-semibold">{selectedBooking.Properties?.name}</p>
                <p className="text-sm text-on-surface-variant">{selectedBooking.Properties?.address}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-surface-container-low p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Check-in</p>
                  <p className="mt-1 font-semibold">{formatDate(selectedBooking.check_in_date)}</p>
                </div>
                <div className="rounded-xl bg-surface-container-low p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Check-out</p>
                  <p className="mt-1 font-semibold">{formatDate(selectedBooking.check_out_date)}</p>
                </div>
              </div>

              <div className="rounded-xl bg-surface-container-low p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Status</p>
                <span
                  className={[
                    'mt-1 inline-block rounded-full px-3 py-1 text-xs font-semibold capitalize',
                    STATUS_STYLES[selectedBooking.status] || 'bg-gray-100 text-gray-600',
                  ].join(' ')}
                >
                  {selectedBooking.status}
                </span>
              </div>

              {selectedBooking.Booking_Details?.length > 0 && (
                <div className="rounded-xl bg-surface-container-low p-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Rooms</p>
                  <div className="space-y-2">
                    {selectedBooking.Booking_Details.map((detail) => (
                      <div key={detail.id} className="flex items-center justify-between text-sm">
                        <div>
                          <p className="font-medium">{detail.Room_Types?.name || 'Room'}</p>
                          <p className="text-xs text-on-surface-variant">
                            {detail.quantity} room{detail.quantity > 1 ? 's' : ''} ×{' '}
                            {Number(detail.price_at_booking).toLocaleString('vi-VN')} VND / night
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-xl bg-gradient-to-r from-gradient-start/10 to-button-gradient-pink/10 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">Total Price</span>
                  <span className="text-xl font-bold text-gradient">
                    {Number(selectedBooking.total_price).toLocaleString('vi-VN')} VND
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default MyBookings;
