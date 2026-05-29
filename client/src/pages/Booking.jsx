import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  CalendarDays,
  Hotel,
  Users,
  CreditCard,
  Minus,
  Plus,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { createBooking } from '../api/booking';
import axiosClient from '../api/axiosClient';

function Booking() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const propertyIdParam = searchParams.get('propertyId');

  const [propertyId, setPropertyId] = useState(propertyIdParam || '');
  const [property, setProperty] = useState(null);
  const [roomTypes, setRoomTypes] = useState([]);
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [selectedRooms, setSelectedRooms] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingProperty, setLoadingProperty] = useState(false);
  const [error, setError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(null);

  // Set ngày tối thiểu là hôm nay
  const today = new Date().toISOString().split('T')[0];

  // Tải thông tin property khi có propertyId
  useEffect(() => {
    const fetchProperty = async () => {
      if (!propertyId) {
        setProperty(null);
        setRoomTypes([]);
        return;
      }

      setLoadingProperty(true);
      setError('');

      try {
        const res = await axiosClient.get(`/properties/${propertyId}`);
        setProperty(res.data);

        // Tải room types
        const roomRes = await axiosClient.get(`/properties/${propertyId}/room-types`);
        const types = roomRes.data || [];
        setRoomTypes(types);

        // Reset selection
        const initial = {};
        types.forEach((rt) => {
          initial[rt.id] = 0;
        });
        setSelectedRooms(initial);
      } catch (err) {
        const message = err.response?.data?.message || 'Failed to load property details';
        setError(message);
        setProperty(null);
        setRoomTypes([]);
      } finally {
        setLoadingProperty(false);
      }
    };

    const numId = Number(propertyId);
    if (numId > 0) {
      fetchProperty();
    }
  }, [propertyId]);

  // Tính số đêm
  const nights = useMemo(() => {
    if (!checkInDate || !checkOutDate) return 0;
    const diff = new Date(checkOutDate) - new Date(checkInDate);
    return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
  }, [checkInDate, checkOutDate]);

  // Tính tổng tiền realtime
  const totalPrice = useMemo(() => {
    if (nights <= 0) return 0;
    let total = 0;
    roomTypes.forEach((rt) => {
      const qty = selectedRooms[rt.id] || 0;
      total += Number(rt.base_price) * qty * nights;
    });
    return total;
  }, [roomTypes, selectedRooms, nights]);

  // Kiểm tra có chọn phòng nào không
  const hasRoomSelected = Object.values(selectedRooms).some((q) => q > 0);

  const handleQuantityChange = (roomTypeId, delta) => {
    setSelectedRooms((prev) => {
      const current = prev[roomTypeId] || 0;
      const newVal = Math.max(0, current + delta);
      return { ...prev, [roomTypeId]: newVal };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!propertyId) {
      setError('Please enter a Property ID');
      return;
    }

    if (!checkInDate || !checkOutDate) {
      setError('Please select check-in and check-out dates');
      return;
    }

    if (nights <= 0) {
      setError('Check-out date must be after check-in date');
      return;
    }

    if (!hasRoomSelected) {
      setError('Please select at least one room');
      return;
    }

    const rooms = Object.entries(selectedRooms)
      .filter(([, qty]) => qty > 0)
      .map(([roomTypeId, quantity]) => ({
        room_type_id: Number(roomTypeId),
        quantity,
      }));

    setLoading(true);
    try {
      const res = await createBooking({
        property_id: Number(propertyId),
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        rooms,
      });
      setBookingSuccess(res.data);
      toast.success('Booking created successfully!');
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create booking';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Màn hình thành công
  if (bookingSuccess) {
    return (
      <div className="min-h-screen bg-surface-bright text-on-surface">
        <Header />
        <main className="px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl">
            <div className="rounded-[2rem] border border-outline-variant bg-white p-8 text-center shadow-sm">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <h1 className="font-display text-3xl font-bold text-on-surface">Booking Confirmed!</h1>
              <p className="mt-3 text-on-surface-variant">
                Your booking has been submitted and is pending confirmation from the provider.
              </p>

              <div className="mt-8 rounded-2xl bg-surface-container-low p-6 text-left">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-on-surface-variant">
                  Booking Summary
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Property</span>
                    <span className="font-medium">{bookingSuccess.Properties?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Check-in</span>
                    <span className="font-medium">{new Date(bookingSuccess.check_in_date).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Check-out</span>
                    <span className="font-medium">{new Date(bookingSuccess.check_out_date).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Status</span>
                    <span className="rounded-full bg-yellow-100 px-3 py-0.5 text-xs font-semibold text-yellow-700">
                      {bookingSuccess.status}
                    </span>
                  </div>
                  <div className="border-t border-outline-variant pt-3">
                    <div className="flex justify-between text-base font-bold">
                      <span>Total</span>
                      <span className="text-primary">
                        {Number(bookingSuccess.total_price).toLocaleString('vi-VN')} VND
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  onClick={() => navigate('/my-bookings')}
                  className="rounded-full bg-gradient-to-r from-gradient-start to-button-gradient-pink px-8 py-3 text-sm font-semibold text-white shadow-md transition hover:scale-[1.02]"
                >
                  View My Bookings
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBookingSuccess(null);
                    setSelectedRooms({});
                    setCheckInDate('');
                    setCheckOutDate('');
                  }}
                  className="rounded-full border border-primary/20 bg-white px-8 py-3 text-sm font-semibold text-primary transition hover:bg-primary/5"
                >
                  Book Another
                </button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-bright text-on-surface">
      <Header />
      <main className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Page Header */}
          <div className="mb-8">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-on-surface-variant transition hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <h1 className="font-display text-3xl font-bold sm:text-4xl">
              <span className="text-gradient">Book</span> Your Stay
            </h1>
            <p className="mt-2 text-on-surface-variant">
              Select your dates and rooms to make a reservation.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
              {/* Left Column — Form */}
              <div className="space-y-6">
                {/* Property ID Input */}
                <div className="rounded-[1.75rem] border border-outline-variant bg-white p-6 shadow-sm">
                  <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                    <Hotel className="h-5 w-5 text-primary" />
                    Select Property
                  </h2>
                  <div>
                    <label htmlFor="propertyId" className="mb-1 block text-sm font-medium text-on-surface-variant">
                      Property ID
                    </label>
                    <input
                      id="propertyId"
                      type="number"
                      min="1"
                      value={propertyId}
                      onChange={(e) => setPropertyId(e.target.value)}
                      placeholder="Enter Property ID (e.g. 1)"
                      className="w-full rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3 text-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    {loadingProperty && (
                      <p className="mt-2 flex items-center gap-1 text-xs text-on-surface-variant">
                        <Loader2 className="h-3 w-3 animate-spin" /> Loading property...
                      </p>
                    )}
                    {property && (
                      <div className="mt-3 rounded-xl bg-green-50 p-3">
                        <p className="text-sm font-semibold text-green-800">{property.name}</p>
                        <p className="text-xs text-green-700">{property.address}</p>
                        <span className="mt-1 inline-block rounded-full bg-green-200 px-2 py-0.5 text-xs font-medium capitalize text-green-800">
                          {property.property_type}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Date Selection */}
                <div className="rounded-[1.75rem] border border-outline-variant bg-white p-6 shadow-sm">
                  <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                    <CalendarDays className="h-5 w-5 text-secondary" />
                    Select Dates
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="checkIn" className="mb-1 block text-sm font-medium text-on-surface-variant">
                        Check-in Date
                      </label>
                      <input
                        id="checkIn"
                        type="date"
                        min={today}
                        value={checkInDate}
                        onChange={(e) => {
                          setCheckInDate(e.target.value);
                          if (checkOutDate && e.target.value >= checkOutDate) {
                            setCheckOutDate('');
                          }
                        }}
                        className="w-full rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3 text-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div>
                      <label htmlFor="checkOut" className="mb-1 block text-sm font-medium text-on-surface-variant">
                        Check-out Date
                      </label>
                      <input
                        id="checkOut"
                        type="date"
                        min={checkInDate || today}
                        value={checkOutDate}
                        onChange={(e) => setCheckOutDate(e.target.value)}
                        className="w-full rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3 text-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                  {nights > 0 && (
                    <p className="mt-3 text-sm font-medium text-primary">
                      {nights} night{nights > 1 ? 's' : ''}
                    </p>
                  )}
                </div>

                {/* Room Types */}
                {roomTypes.length > 0 && (
                  <div className="rounded-[1.75rem] border border-outline-variant bg-white p-6 shadow-sm">
                    <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                      <Users className="h-5 w-5 text-tertiary" />
                      Select Rooms
                    </h2>
                    <div className="space-y-4">
                      {roomTypes.map((rt) => (
                        <div
                          key={rt.id}
                          className={[
                            'flex items-center justify-between rounded-2xl border p-4 transition',
                            (selectedRooms[rt.id] || 0) > 0
                              ? 'border-primary/30 bg-primary/5'
                              : 'border-outline-variant bg-surface-container-low',
                          ].join(' ')}
                        >
                          <div className="flex-1">
                            <h3 className="text-sm font-semibold text-on-surface">{rt.name}</h3>
                            <div className="mt-1 flex flex-wrap gap-3 text-xs text-on-surface-variant">
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                Max {rt.max_guests} guest{rt.max_guests > 1 ? 's' : ''}
                              </span>
                              <span className="font-semibold text-primary">
                                {Number(rt.base_price).toLocaleString('vi-VN')} VND / night
                              </span>
                            </div>
                            {rt.amenities && (
                              <p className="mt-1 text-xs text-on-surface-variant">
                                {typeof rt.amenities === 'string'
                                  ? (() => {
                                      try { return JSON.parse(rt.amenities).join(', '); }
                                      catch { return rt.amenities; }
                                    })()
                                  : Array.isArray(rt.amenities)
                                    ? rt.amenities.join(', ')
                                    : ''
                                }
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(rt.id, -1)}
                              disabled={(selectedRooms[rt.id] || 0) === 0}
                              className="flex h-9 w-9 items-center justify-center rounded-full border border-outline-variant bg-white text-on-surface-variant transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-8 text-center text-sm font-bold">
                              {selectedRooms[rt.id] || 0}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(rt.id, 1)}
                              className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary transition hover:bg-primary hover:text-white"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column — Price Summary (Sticky) */}
              <div className="lg:sticky lg:top-28 lg:self-start">
                <div className="rounded-[1.75rem] border border-outline-variant bg-white p-6 shadow-sm">
                  <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                    <CreditCard className="h-5 w-5 text-primary" />
                    Booking Summary
                  </h2>

                  {property && (
                    <div className="mb-4 rounded-xl bg-surface-container-low p-3">
                      <p className="text-sm font-semibold">{property.name}</p>
                      <p className="text-xs text-on-surface-variant">{property.address}</p>
                    </div>
                  )}

                  <div className="space-y-3 text-sm">
                    {checkInDate && checkOutDate && nights > 0 && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-on-surface-variant">Dates</span>
                          <span className="font-medium">
                            {new Date(checkInDate).toLocaleDateString('vi-VN')} →{' '}
                            {new Date(checkOutDate).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-on-surface-variant">Duration</span>
                          <span className="font-medium">{nights} night{nights > 1 ? 's' : ''}</span>
                        </div>
                      </>
                    )}

                    {roomTypes
                      .filter((rt) => (selectedRooms[rt.id] || 0) > 0)
                      .map((rt) => (
                        <div key={rt.id} className="flex justify-between">
                          <span className="text-on-surface-variant">
                            {rt.name} × {selectedRooms[rt.id]}
                          </span>
                          <span className="font-medium">
                            {(Number(rt.base_price) * (selectedRooms[rt.id] || 0) * nights).toLocaleString('vi-VN')} VND
                          </span>
                        </div>
                      ))}

                    <div className="border-t border-outline-variant pt-3">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span className="text-gradient">
                          {totalPrice.toLocaleString('vi-VN')} VND
                        </span>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !hasRoomSelected || nights <= 0 || !property}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-gradient-start to-button-gradient-pink px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary-container/30 transition hover:scale-[1.02] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Confirm Booking
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Booking;
