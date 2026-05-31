import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Building2, MapPin, Clock, Plus, Trash2, ShieldAlert, CheckCircle2, AlertTriangle, Sparkles, Hotel, Save } from 'lucide-react'
import { toast } from 'sonner'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import { getPropertyById } from '../../api/properties'
import { createRoomType } from '../../api/roomTypes'
import { createRoom, updateRoom, deleteRoom } from '../../api/rooms'

function PropertyDetail() {
  const { id } = useParams()
  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)

  // Modals/Forms State
  const [showRoomTypeForm, setShowRoomTypeForm] = useState(false)
  const [newRoomType, setNewRoomType] = useState({
    name: '',
    max_guests: 2,
    base_price: '',
    amenities: '',
  })
  const [roomTypeErrors, setRoomTypeErrors] = useState({})

  const [activeRoomTypeForm, setActiveRoomTypeForm] = useState(null) // roomTypeId for which "Add Room" is open
  const [newRoomNumber, setNewRoomNumber] = useState('')
  const [roomError, setRoomError] = useState('')

  const fetchPropertyDetails = async () => {
    try {
      setLoading(true)
      const res = await getPropertyById(id)
      if (res.success) {
        setProperty(res.data)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch property details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPropertyDetails()
  }, [id])

  const handleCreateRoomType = async (e) => {
    e.preventDefault()
    // Validation
    const errors = {}
    if (!newRoomType.name.trim()) {
      errors.name = 'Name is required'
    } else if (newRoomType.name.trim().length > 50) {
      errors.name = 'Room type name cannot exceed 50 characters'
    }
    if (!newRoomType.base_price || Number(newRoomType.base_price) <= 0) errors.base_price = 'Base price must be greater than 0'
    if (!newRoomType.max_guests || Number(newRoomType.max_guests) <= 0 || Number(newRoomType.max_guests) > 20) {
      errors.max_guests = 'Max guests must be between 1 and 20'
    }

    if (Object.keys(errors).length > 0) {
      setRoomTypeErrors(errors)
      return
    }

    try {
      const res = await createRoomType(property.id, {
        name: newRoomType.name,
        max_guests: Number(newRoomType.max_guests),
        base_price: Number(newRoomType.base_price),
        amenities: newRoomType.amenities,
      })

      if (res.success) {
        toast.success('Room type created successfully')
        setShowRoomTypeForm(false)
        setNewRoomType({ name: '', max_guests: 2, base_price: '', amenities: '' })
        setRoomTypeErrors({})
        fetchPropertyDetails()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create room type')
    }
  }

  const handleCreateRoom = async (roomTypeId) => {
    const trimmedNumber = newRoomNumber.trim()
    if (!trimmedNumber) {
      setRoomError('Room number is required')
      return
    }
    if (!/^\d{1,3}$/.test(trimmedNumber)) {
      setRoomError('Room number must be digits only and maximum 3 characters (e.g. 101 to 999)')
      return
    }

    try {
      const res = await createRoom(roomTypeId, {
        room_number: trimmedNumber,
        status: 'available',
      })

      if (res.success) {
        toast.success('Room added successfully')
        setNewRoomNumber('')
        setActiveRoomTypeForm(null)
        setRoomError('')
        fetchPropertyDetails()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add room')
      setRoomError(error.response?.data?.message || 'Failed to add room')
    }
  }

  const handleToggleRoomStatus = async (room) => {
    const nextStatus = room.status === 'available' ? 'maintenance' : 'available'
    try {
      const res = await updateRoom(room.id, {
        status: nextStatus,
      })
      if (res.success) {
        toast.success(`Room status updated to ${nextStatus}`)
        fetchPropertyDetails()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update room status')
    }
  }

  const handleDeleteRoom = async (roomId, roomNumber) => {
    if (!window.confirm(`Are you sure you want to delete room "${roomNumber}"?`)) {
      return
    }

    try {
      const res = await deleteRoom(roomId)
      if (res.success) {
        toast.success('Room deleted successfully')
        fetchPropertyDetails()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete room')
    }
  }

  const formatTime = (dateStr) => {
    if (!dateStr) return '--:--'
    try {
      const date = new Date(dateStr)
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
    } catch {
      return '--:--'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-bright flex flex-col relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-gradient-end hero-blob opacity-20 pointer-events-none" />
        <Header />
        <main className="flex-grow flex justify-center items-center py-20 relative z-10">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-surface-bright flex flex-col relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-gradient-end hero-blob opacity-20 pointer-events-none" />
        <Header />
        <main className="flex-grow flex justify-center items-center py-20 relative z-10">
          <div className="text-center glass-card p-10 rounded-[2rem] border border-white/50 bg-white/70">
            <h2 className="text-2xl font-bold font-display text-on-surface">Property Not Found</h2>
            <p className="mt-2 text-sm text-on-surface-variant">The property you are looking for does not exist or has been deleted.</p>
            <Link to="/provider" className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-xs font-semibold text-white transition hover:scale-105">
              Go Back to Dashboard
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-bright text-on-surface flex flex-col relative overflow-hidden">
      {/* Decorative Background Blobs */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-gradient-end hero-blob opacity-20 pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-gradient-start hero-blob opacity-10 pointer-events-none" />

      <Header />
      
      <main className="flex-grow px-4 py-8 sm:px-6 lg:px-8 lg:py-12 relative z-10">
        <div className="mx-auto max-w-7xl">
          {/* Back button */}
          <Link
            to="/provider"
            className="inline-flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-primary transition mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          {/* Grid Layout */}
          <div className="grid gap-8 lg:grid-cols-[1fr_2.2fr] items-start">
            {/* Left Column: Property Info */}
            <div className="rounded-[2.5rem] glass-card p-6 sm:p-8 shadow-lg border border-white/50 bg-white/80 relative overflow-hidden h-fit">
              {/* Soft decorative top accent bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-gradient-start via-gradient-mid to-gradient-end opacity-80" />

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-5 shadow-inner">
                <Building2 className="h-5.5 w-5.5" />
              </div>
              <span className="inline-flex rounded-full bg-primary/5 border border-primary/10 px-3.5 py-1 text-xs font-bold capitalize text-primary mb-4">
                {property.property_type}
              </span>
              <h1 className="text-2xl font-extrabold tracking-tight text-on-surface mb-3 font-display">{property.name}</h1>
              <p className="text-sm text-on-surface-variant mb-6 leading-relaxed flex items-start gap-1.5">
                <MapPin className="h-4 w-4 text-primary-container shrink-0 mt-0.5" />
                <span>{property.address}</span>
              </p>

              <div className="space-y-4 border-t border-outline-variant/60 pt-6 text-sm font-semibold text-on-surface-variant">
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant font-medium">Check-in:</span>
                  <span className="text-on-surface flex items-center gap-1">
                    <Clock className="h-4 w-4 text-secondary" />
                    {formatTime(property.check_in_time)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant font-medium">Check-out:</span>
                  <span className="text-on-surface flex items-center gap-1">
                    <Clock className="h-4 w-4 text-secondary" />
                    {formatTime(property.check_out_time)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant font-medium">Latitude:</span>
                  <span className="text-on-surface">{Number(property.latitude).toFixed(6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant font-medium">Longitude:</span>
                  <span className="text-on-surface">{Number(property.longitude).toFixed(6)}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Room Inventory */}
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-extrabold tracking-tight text-on-surface font-display">Room Inventory</h2>
                  <p className="text-xs font-medium text-on-surface-variant mt-1">Configure room categories and manage individual room status.</p>
                </div>
                <button
                  onClick={() => setShowRoomTypeForm(!showRoomTypeForm)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-gradient-start to-button-gradient-pink px-5 py-3 text-xs font-bold text-white shadow-md shadow-primary-container/30 transition hover:scale-[1.03] duration-300"
                >
                  <Plus className="h-4 w-4" />
                  Add Room Type
                </button>
              </div>

              {/* Add Room Type Form */}
              {showRoomTypeForm && (
                <form
                  onSubmit={handleCreateRoomType}
                  className="rounded-[2rem] glass-card p-6 sm:p-8 shadow-xl border border-white/50 bg-white/95 space-y-5 animate-fade-in relative overflow-hidden"
                >
                  {/* Decorative line */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gradient-start to-button-gradient-coral opacity-80" />

                  <h3 className="font-bold text-base font-display text-on-surface flex items-center gap-2">
                    <Hotel className="h-4.5 w-4.5 text-primary" />
                    New Room Type
                  </h3>
                  
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-on-surface mb-2 font-display">Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Deluxe Double Room"
                        value={newRoomType.name}
                        onChange={(e) => setNewRoomType({ ...newRoomType, name: e.target.value })}
                        maxLength={50}
                        className="w-full rounded-xl border border-outline-variant bg-white/50 px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
                      />
                      {roomTypeErrors.name && <p className="mt-1 text-xs text-red-500 font-bold">{roomTypeErrors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-on-surface mb-2 font-display">Max Guests</label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={newRoomType.max_guests}
                        onChange={(e) => setNewRoomType({ ...newRoomType, max_guests: Number(e.target.value) })}
                        className="w-full rounded-xl border border-outline-variant bg-white/50 px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
                      />
                      {roomTypeErrors.max_guests && <p className="mt-1 text-xs text-red-500 font-bold">{roomTypeErrors.max_guests}</p>}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold text-on-surface mb-2 font-display">Base Price (VND)</label>
                      <input
                        type="number"
                        min="1000"
                        step="1000"
                        placeholder="e.g. 500000"
                        value={newRoomType.base_price}
                        onChange={(e) => setNewRoomType({ ...newRoomType, base_price: e.target.value })}
                        className="w-full rounded-xl border border-outline-variant bg-white/50 px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
                      />
                      {roomTypeErrors.base_price && <p className="mt-1 text-xs text-red-500 font-bold">{roomTypeErrors.base_price}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-on-surface mb-2 font-display">Amenities</label>
                      <input
                        type="text"
                        placeholder="Wifi, AC, Bath, Mini-bar"
                        value={newRoomType.amenities}
                        onChange={(e) => setNewRoomType({ ...newRoomType, amenities: e.target.value })}
                        className="w-full rounded-xl border border-outline-variant bg-white/50 px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/60">
                    <button
                      type="button"
                      onClick={() => setShowRoomTypeForm(false)}
                      className="rounded-xl border border-outline-variant bg-white px-5 py-2.5 text-xs font-semibold hover:bg-surface-bright/50 transition duration-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-primary text-white px-5 py-2.5 text-xs font-bold hover:bg-primary/95 transition duration-300 shadow-md shadow-primary/20"
                    >
                      <Save className="h-3.5 w-3.5" />
                      Save Room Type
                    </button>
                  </div>
                </form>
              )}

              {/* Room Types Listing */}
              {property.Room_Types?.length === 0 ? (
                <div className="text-center py-20 glass-card bg-white/50 rounded-[2.5rem] border border-white/40 shadow-lg">
                  <Hotel className="mx-auto h-12 w-12 text-on-surface-variant/40 mb-4" />
                  <p className="text-lg font-bold text-on-surface">No room types defined</p>
                  <p className="text-sm text-on-surface-variant mt-1">Create your first room category (e.g. Single, Twin, Deluxe Suite).</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {property.Room_Types?.map((rt) => (
                    <div
                      key={rt.id}
                      className="rounded-[2.5rem] bg-white border border-outline-variant/70 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden relative"
                    >
                      {/* Accent sidebar or tag */}
                      <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-gradient-to-b from-primary via-gradient-mid to-gradient-end opacity-85" />

                      {/* Room Type Details Header */}
                      <div className="bg-surface-bright/40 pl-8 pr-6 py-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-outline-variant/60">
                        <div>
                          <h3 className="text-xl font-bold tracking-tight text-on-surface font-display">{rt.name}</h3>
                          <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5 mt-2 text-xs text-on-surface-variant font-bold">
                            <span className="bg-surface-dim/40 px-2.5 py-1 rounded-lg border border-outline-variant/40">Max guests: {rt.max_guests}</span>
                            <span className="text-primary font-extrabold bg-primary/5 px-2.5 py-1 rounded-lg border border-primary/10">{Number(rt.base_price).toLocaleString('vi-VN')} VND / night</span>
                            {rt.amenities && (
                              <span className="flex items-center gap-1.5 text-secondary bg-secondary/5 px-2.5 py-1 rounded-lg border border-secondary/10">
                                <Sparkles className="h-3.5 w-3.5 shrink-0" />
                                {rt.amenities}
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            if (activeRoomTypeForm === rt.id) {
                              setActiveRoomTypeForm(null)
                              setRoomError('')
                            } else {
                              setActiveRoomTypeForm(rt.id)
                              setRoomError('')
                            }
                          }}
                          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-outline-variant bg-white px-4 py-2.5 text-xs font-bold text-on-surface hover:border-primary/30 transition shadow-sm"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Add Room
                        </button>
                      </div>

                      {/* Add Room Number Form */}
                      {activeRoomTypeForm === rt.id && (
                        <div className="pl-8 pr-6 py-4 bg-primary/5 border-b border-outline-variant/60 flex flex-col gap-2.5 sm:flex-row sm:items-center">
                          <div className="flex-grow">
                            <input
                              type="text"
                              placeholder="Room Number (e.g. 101, 102)"
                              value={newRoomNumber}
                              onChange={(e) => {
                                setNewRoomNumber(e.target.value)
                                setRoomError('')
                              }}
                              maxLength={3}
                              className="w-full sm:max-w-xs rounded-xl border border-outline-variant bg-white px-3.5 py-2.5 text-xs focus:border-primary focus:outline-none"
                            />
                            {roomError && <p className="mt-1 text-[10px] text-red-500 font-bold">{roomError}</p>}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                handleCreateRoom(rt.id)
                              }}
                              className="rounded-xl bg-primary text-white px-5 py-2.5 text-xs font-bold hover:bg-primary/95 transition"
                            >
                              Add
                            </button>
                            <button
                              onClick={() => {
                                setActiveRoomTypeForm(null)
                                setNewRoomNumber('')
                                setRoomError('')
                              }}
                              className="rounded-xl bg-white border border-outline-variant px-5 py-2.5 text-xs font-bold transition"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Physical Rooms List */}
                      <div className="pl-8 pr-6 py-6">
                        {rt.Rooms?.length === 0 ? (
                          <p className="text-xs text-on-surface-variant font-medium italic">No physical rooms registered for this type.</p>
                        ) : (
                          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
                            {rt.Rooms?.map((room) => (
                              <div
                                key={room.id}
                                className="flex items-center justify-between rounded-2xl border border-outline-variant/80 bg-surface-bright/20 p-3 hover:border-primary/30 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 group"
                              >
                                <div className="pl-1">
                                  <p className="text-sm font-bold text-on-surface font-display">{room.room_number}</p>
                                  {/* Status indicator */}
                                  <button
                                    onClick={() => handleToggleRoomStatus(room)}
                                    className={[
                                      'mt-1.5 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] font-bold transition hover:scale-[1.03]',
                                      room.status === 'available'
                                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-100'
                                        : room.status === 'maintenance'
                                        ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-100 animate-pulse'
                                        : 'bg-blue-50 text-blue-700 border border-blue-100',
                                    ].join(' ')}
                                    title="Click to toggle status"
                                  >
                                    {room.status === 'available' && <CheckCircle2 className="h-2.5 w-2.5" />}
                                    {room.status === 'maintenance' && <AlertTriangle className="h-2.5 w-2.5 animate-bounce" />}
                                    {room.status === 'occupied' && <ShieldAlert className="h-2.5 w-2.5" />}
                                    <span className="capitalize">{room.status}</span>
                                  </button>
                                </div>

                                <button
                                  onClick={() => handleDeleteRoom(room.id, room.room_number)}
                                  className="opacity-0 group-hover:opacity-100 rounded-lg p-1.5 text-on-surface-variant hover:text-red-600 hover:bg-red-50 transition"
                                  title="Delete room"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default PropertyDetail
