import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ChevronLeft, MapPin, Star, Building2, FileText,
  Calendar, Users, Minus, Plus, Loader2, Hotel
} from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { createBooking } from '../api/booking';
import axiosClient from '../api/axiosClient';

// Category images mapping for placeholders
const categoryImages = {
  'resort': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80',
  'hotel': 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80',
  'villa': 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&q=80',
  'homestay': 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=80',
  'default': 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=80'
};

function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const propertyId = id;

  const [property, setProperty] = useState(null);
  const [roomTypes, setRoomTypes] = useState([]);
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [selectedRooms, setSelectedRooms] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingProperty, setLoadingProperty] = useState(true);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  // Fetch Property
  useEffect(() => {
    const fetchProperty = async () => {
      setLoadingProperty(true);
      try {
        const res = await axiosClient.get(`/properties/${propertyId}`);
        setProperty(res.data);

        const roomRes = await axiosClient.get(`/properties/${propertyId}/room-types`);
        const types = roomRes.data || [];
        setRoomTypes(types);

        const initial = {};
        types.forEach((rt) => {
          initial[rt.id] = 0;
        });
        setSelectedRooms(initial);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load property details');
        navigate('/services');
      } finally {
        setLoadingProperty(false);
      }
    };

    if (propertyId) fetchProperty();
  }, [propertyId, navigate]);

  // Check Availability dynamically
  useEffect(() => {
    if (checkInDate && checkOutDate) {
      const start = new Date(checkInDate);
      const end = new Date(checkOutDate);
      if (end > start) {
        const checkAvailability = async () => {
          setCheckingAvailability(true);
          try {
            const res = await axiosClient.get(`/properties/${propertyId}/room-types`, {
              params: { check_in_date: checkInDate, check_out_date: checkOutDate }
            });
            const types = res.data || [];
            setRoomTypes(types);
            
            // Reset selected rooms to 0 since availability changed
            const initial = {};
            types.forEach((rt) => {
              initial[rt.id] = 0;
            });
            setSelectedRooms(initial);
          } catch (err) {
            toast.error('Failed to check room availability');
          } finally {
            setCheckingAvailability(false);
          }
        };
        checkAvailability();
      }
    } else {
      setRoomTypes((prev) => prev.map((rt) => {
        const { available_quantity, ...rest } = rt;
        return rest;
      }));
      setSelectedRooms((prev) => {
        const initial = {};
        Object.keys(prev).forEach((id) => {
          initial[id] = 0;
        });
        return initial;
      });
    }
  }, [checkInDate, checkOutDate, propertyId]);

  // Calculations
  const nights = useMemo(() => {
    if (!checkInDate || !checkOutDate) return 0;
    const diff = new Date(checkOutDate) - new Date(checkInDate);
    return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
  }, [checkInDate, checkOutDate]);

  const totalPrice = useMemo(() => {
    if (nights <= 0) return 0;
    let total = 0;
    roomTypes.forEach((rt) => {
      const qty = selectedRooms[rt.id] || 0;
      total += Number(rt.base_price) * qty * nights;
    });
    return total;
  }, [roomTypes, selectedRooms, nights]);

  const hasRoomSelected = Object.values(selectedRooms).some((q) => q > 0);

  const handleQuantityChange = (roomTypeId, delta, maxAvailable) => {
    if (maxAvailable === undefined) return;
    setSelectedRooms((prev) => {
      const current = prev[roomTypeId] || 0;
      let newVal = Math.max(0, current + delta);
      if (newVal > maxAvailable) newVal = maxAvailable;
      return { ...prev, [roomTypeId]: newVal };
    });
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!checkInDate || !checkOutDate) {
      toast.error('Please select check-in and check-out dates');
      return;
    }
    if (nights <= 0) {
      toast.error('Check-out date must be after check-in date');
      return;
    }
    if (!hasRoomSelected) {
      toast.error('Please select at least one room');
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
      toast.success('Booking confirmed successfully! 🎉');
      navigate('/my-bookings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  if (loadingProperty) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-16 w-16 animate-spin text-indigo-600" />
          <p className="text-gray-600 dark:text-gray-400">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (!property) return null;

  const coverImage = categoryImages[property.property_type] || categoryImages.default;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Hero Image Section */}
        <div className="group relative h-[40vh] overflow-hidden md:h-[50vh]">
          <img
            src={coverImage}
            alt={property.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="absolute left-4 top-24 rounded-full bg-white/90 p-3 shadow-lg backdrop-blur-sm transition-all hover:bg-white md:left-8 dark:bg-gray-800/90 dark:hover:bg-gray-700"
          >
            <ChevronLeft className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          </button>

          {/* Title Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
            <div className="mx-auto max-w-6xl">
              <span className="mb-3 inline-block rounded-full bg-indigo-600 px-3 py-1 text-sm font-medium text-white capitalize">
                {property.property_type}
              </span>
              <h1 className="mb-2 text-3xl font-black text-white drop-shadow-lg md:text-5xl">
                {property.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-white/90">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-5 w-5" />
                  {property.address}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Left Column - Details */}
            <div className="space-y-8 lg:col-span-2">
              {/* Provider Info */}
              <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
                    <Building2 className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      Wanderly Partner
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">Verified Property Provider</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
                <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
                  <FileText className="h-6 w-6 text-indigo-500" />
                  About This Property
                </h2>
                <p className="whitespace-pre-line leading-relaxed text-gray-600 dark:text-gray-300">
                  Welcome to {property.name}, an exquisite {property.property_type} located at {property.address}. 
                  Experience comfort and luxury with our tailored services and exceptional amenities. 
                  Perfect for your next getaway!
                </p>
              </div>

              {/* Amenities / Map placeholder */}
              <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
                <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
                  <MapPin className="h-6 w-6 text-indigo-500" />
                  Location Preview
                </h2>
                <div className="flex h-64 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-700">
                  <p className="text-gray-500">Map integration not available</p>
                </div>
              </div>
            </div>

            {/* Right Column - Booking */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-2xl border border-gray-100 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-800">
                <h3 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">Reserve Your Stay</h3>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Dates */}
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Check-in
                      </label>
                      <input
                        type="date"
                        min={today}
                        value={checkInDate}
                        onChange={(e) => {
                          setCheckInDate(e.target.value);
                          if (checkOutDate && e.target.value >= checkOutDate) {
                            setCheckOutDate('');
                          }
                        }}
                        className="w-full rounded-xl border-gray-200 bg-gray-50 py-3 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Check-out
                      </label>
                      <input
                        type="date"
                        min={checkInDate || today}
                        value={checkOutDate}
                        onChange={(e) => setCheckOutDate(e.target.value)}
                        className="w-full rounded-xl border-gray-200 bg-gray-50 py-3 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Room Selection */}
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                    <label className="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Select Rooms
                    </label>
                    {!checkInDate || !checkOutDate || nights <= 0 ? (
                      <p className="text-sm text-gray-500 bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                        Please select valid check-in and check-out dates to check room availability.
                      </p>
                    ) : checkingAvailability ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                        <span className="ml-2 text-sm text-gray-500">Checking availability...</span>
                      </div>
                    ) : roomTypes.length === 0 ? (
                      <p className="text-sm text-gray-500">No rooms available.</p>
                    ) : (
                      <div className="space-y-4">
                        {roomTypes.map((rt) => (
                          <div key={rt.id} className="flex items-center justify-between rounded-xl bg-gray-50 p-3 dark:bg-gray-700">
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">{rt.name}</p>
                              <p className="text-sm text-indigo-600 dark:text-indigo-400 font-bold">
                                {formatPrice(rt.base_price)}<span className="text-xs font-normal text-gray-500">/night</span>
                              </p>
                              <p className="text-xs text-gray-500">Up to {rt.max_guests} guests</p>
                              {rt.available_quantity !== undefined && (
                                <p className={`text-xs mt-1 font-medium ${rt.available_quantity > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                                  {rt.available_quantity > 0 ? `${rt.available_quantity} room(s) available` : 'Sold out for these dates'}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(rt.id, -1, rt.available_quantity)}
                                disabled={(selectedRooms[rt.id] || 0) <= 0 || rt.available_quantity === undefined}
                                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow hover:bg-gray-100 dark:bg-gray-600 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="w-6 text-center font-bold text-gray-900 dark:text-white">
                                {selectedRooms[rt.id] || 0}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(rt.id, 1, rt.available_quantity)}
                                disabled={(selectedRooms[rt.id] || 0) >= (rt.available_quantity || 0) || rt.available_quantity === undefined}
                                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow hover:bg-gray-100 dark:bg-gray-600 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Summary */}
                  {nights > 0 && hasRoomSelected && (
                    <div className="rounded-xl bg-indigo-50 p-4 dark:bg-indigo-900/30">
                      <div className="flex items-center justify-between text-sm text-indigo-900 dark:text-indigo-200">
                        <span>Total Nights</span>
                        <span className="font-semibold">{nights}</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between border-t border-indigo-200 pt-2 dark:border-indigo-800">
                        <span className="font-semibold text-gray-900 dark:text-white">Total Price</span>
                        <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                          {formatPrice(totalPrice)}
                        </span>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={
                      loading ||
                      checkingAvailability ||
                      !hasRoomSelected ||
                      nights <= 0 ||
                      roomTypes.some((rt) => (selectedRooms[rt.id] || 0) > (rt.available_quantity ?? 0))
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-4 font-bold text-white shadow-lg shadow-indigo-500/30 transition-all hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <span>Book Now</span>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Booking;
