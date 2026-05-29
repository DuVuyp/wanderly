import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle,
  XCircle,
  Loader2,
  User,
  Mail,
  MapPin,
  ClipboardList,
} from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { getProviderBookings, updateBookingStatus } from '../../api/booking';

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

function ManageBookings() {
  const [bookings, setBookings] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [stats, setStats] = useState({ total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0 });

  const fetchBookings = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      const res = await getProviderBookings(params);
      setBookings(res.data?.bookings || []);
      setPagination(res.data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 });
      if (res.data?.stats) {
        setStats(res.data.stats);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBookings(1);
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchBookings]);

  const handleStatusUpdate = async (bookingId, status) => {
    setActionLoading(bookingId);
    try {
      await updateBookingStatus(bookingId, { status });
      toast.success(`Booking ${status} successfully`);
      setConfirmModal(null);
      fetchBookings(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${status} booking`);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const calculateNights = (checkIn, checkOut) => {
    const diff = new Date(checkOut) - new Date(checkIn);
    return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)));
  };

  return (
    <div className="min-h-screen bg-surface-bright text-on-surface">
      <Header />
      <main className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Page Header */}
          <div className="mb-8">
            <div className="mb-4 inline-flex rounded-full border border-secondary/15 bg-white px-4 py-2 text-sm font-medium text-secondary">
              Provider Dashboard
            </div>
            <h1 className="font-display text-3xl font-bold sm:text-4xl">
              <span className="text-gradient">Manage</span> Bookings
            </h1>
            <p className="mt-2 text-on-surface-variant">
              Review and manage incoming reservations for your properties.
            </p>
          </div>

          {/* Stats Row */}
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Total', value: stats.total, color: 'text-on-surface' },
              { label: 'Pending', value: stats.pending, color: 'text-yellow-600' },
              { label: 'Confirmed', value: stats.confirmed, color: 'text-green-600' },
              { label: 'Cancelled', value: stats.cancelled, color: 'text-red-600' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-outline-variant bg-white p-4 text-center shadow-sm"
              >
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-on-surface-variant">{stat.label}</p>
              </div>
            ))}
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

          {/* Bookings Table/List */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : bookings.length === 0 ? (
            <div className="rounded-[2rem] border border-outline-variant bg-white p-12 text-center shadow-sm">
              <ClipboardList className="mx-auto h-12 w-12 text-on-surface-variant/40" />
              <h3 className="mt-4 text-lg font-semibold text-on-surface">No bookings found</h3>
              <p className="mt-2 text-sm text-on-surface-variant">
                {statusFilter
                  ? `No ${statusFilter} bookings at the moment.`
                  : 'No one has booked your properties yet.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="rounded-[1.75rem] border border-outline-variant bg-white p-5 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    {/* Booking Info */}
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-xs font-medium text-on-surface-variant">
                          #{booking.id}
                        </span>
                        <h3 className="text-base font-semibold">
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

                      {/* Guest Info */}
                      {booking.Users && (
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-on-surface-variant">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {booking.Users.full_name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {booking.Users.email}
                          </span>
                        </div>
                      )}

                      {/* Dates & Location */}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-on-surface-variant">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />
                          {formatDate(booking.check_in_date)} → {formatDate(booking.check_out_date)}
                          {' '}({calculateNights(booking.check_in_date, booking.check_out_date)} nights)
                        </span>
                        {booking.Properties?.address && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {booking.Properties.address.length > 50
                              ? booking.Properties.address.slice(0, 50) + '...'
                              : booking.Properties.address}
                          </span>
                        )}
                      </div>

                      {/* Room Details */}
                      {booking.Booking_Details?.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {booking.Booking_Details.map((detail) => (
                            <span
                              key={detail.id}
                              className="rounded-full border border-secondary/15 bg-secondary/5 px-3 py-0.5 text-xs font-medium text-secondary"
                            >
                              {detail.Room_Types?.name || 'Room'} × {detail.quantity}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Price + Actions */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-bold text-gradient">
                          {Number(booking.total_price).toLocaleString('vi-VN')}
                        </p>
                        <p className="text-xs text-on-surface-variant">VND</p>
                      </div>

                      {booking.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmModal({ id: booking.id, action: 'confirmed', name: booking.Users?.full_name })
                            }
                            disabled={actionLoading === booking.id}
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-700 transition hover:bg-green-600 hover:text-white disabled:opacity-50"
                            title="Confirm booking"
                          >
                            <CheckCircle className="h-5 w-5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmModal({ id: booking.id, action: 'cancelled', name: booking.Users?.full_name })
                            }
                            disabled={actionLoading === booking.id}
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-700 transition hover:bg-red-600 hover:text-white disabled:opacity-50"
                            title="Cancel booking"
                          >
                            <XCircle className="h-5 w-5" />
                          </button>
                        </div>
                      )}
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

      {/* Confirm Action Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[2rem] bg-white p-6 shadow-2xl">
            <h3 className="font-display text-lg font-bold">
              {confirmModal.action === 'confirmed' ? 'Confirm Booking?' : 'Cancel Booking?'}
            </h3>
            <p className="mt-2 text-sm text-on-surface-variant">
              {confirmModal.action === 'confirmed'
                ? `Are you sure you want to confirm the booking from ${confirmModal.name || 'this guest'}?`
                : `Are you sure you want to cancel the booking from ${confirmModal.name || 'this guest'}? This action cannot be undone.`}
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                disabled={actionLoading}
                className="flex-1 rounded-full border border-outline-variant px-4 py-2.5 text-sm font-semibold text-on-surface-variant transition hover:bg-surface-container-low"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={() => handleStatusUpdate(confirmModal.id, confirmModal.action)}
                disabled={actionLoading}
                className={[
                  'flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white transition',
                  confirmModal.action === 'confirmed'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700',
                ].join(' ')}
              >
                {actionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : confirmModal.action === 'confirmed' ? (
                  'Confirm'
                ) : (
                  'Cancel Booking'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default ManageBookings;
