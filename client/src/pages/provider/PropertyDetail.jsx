import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Building2, MapPin, Clock, Plus, Trash2, ShieldAlert, CheckCircle2, AlertTriangle, Sparkles, Hotel } from 'lucide-react'
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
    if (!newRoomType.name.trim()) errors.name = 'Name is required'
    if (!newRoomType.base_price || Number(newRoomType.base_price) <= 0) errors.base_price = 'Base price must be greater than 0'
    if (!newRoomType.max_guests || Number(newRoomType.max_guests) <= 0) errors.max_guests = 'Max guests must be greater than 0'

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
    if (!newRoomNumber.trim()) {
      setRoomError('Room number is required')
      return
    }

    try {
      const res = await createRoom(roomTypeId, {
        room_number: newRoomNumber.trim(),
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
      <div className="min-h-screen bg-surface-bright flex flex-col">
        <Header />
        <main className="flex-grow flex justify-center items-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-surface-bright flex flex-col">
        <Header />
        <main className="flex-grow flex justify-center items-center py-20">
          <div className="text-center">
            <h2 className="text-xl font-bold">Property not found</h2>
            <Link to="/provider" className="mt-4 inline-block text-primary font-semibold">
              Go back
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-bright text-on-surface flex flex-col">
      <Header />
      <main className="flex-grow px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="mx-auto max-w-7xl">
          {/* Back button */}
          <Link
            to="/provider"
            className="inline-flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-primary transition mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          {/* Grid Layout */}
          <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
            {/* Left Column: Property Info */}
            <div className="rounded-[2rem] bg-white p-6 shadow-sm border border-outline-variant h-fit">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
                <Building2 className="h-5 w-5" />
              </div>
              <span className="inline-flex rounded-full bg-primary/5 border border-primary/10 px-3 py-1 text-xs font-semibold capitalize text-primary mb-3">
                {property.property_type}
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-on-surface mb-2">{property.name}</h1>
              <p className="text-sm text-on-surface-variant mb-6">{property.address}</p>

              <div className="space-y-4 border-t border-outline-variant pt-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Check-in hours:</span>
                  <span className="font-semibold">{formatTime(property.check_in_time)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Check-out hours:</span>
                  <span className="font-semibold">{formatTime(property.check_out_time)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Latitude:</span>
                  <span className="font-semibold">{Number(property.latitude).toFixed(6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Longitude:</span>
                  <span className="font-semibold">{Number(property.longitude).toFixed(6)}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Room Inventory */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-on-surface">Room Inventory</h2>
                  <p className="text-xs text-on-surface-variant">Create room types and manage individual rooms.</p>
                </div>
                <button
                  onClick={() => setShowRoomTypeForm(!showRoomTypeForm)}
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-gradient-start to-button-gradient-pink px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-primary-container/40 transition hover:scale-[1.02]"
                >
                  <Plus className="h-4 w-4" />
                  Add Room Type
                </button>
              </div>

              {/* Add Room Type Form */}
              {showRoomTypeForm && (
                <form
                  onSubmit={handleCreateRoomType}
                  className="rounded-3xl bg-white p-6 shadow-sm border border-outline-variant space-y-4 animate-fade-in"
                >
                  <h3 className="font-semibold text-sm">New Room Type</h3>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-on-surface mb-1">Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Deluxe Double Room"
                        value={newRoomType.name}
                        onChange={(e) => setNewRoomType({ ...newRoomType, name: e.target.value })}
                        className="w-full rounded-xl border border-outline-variant px-3 py-2 text-sm focus:border-primary focus:outline-none"
                      />
                      {roomTypeErrors.name && <p className="mt-1 text-xs text-red-500">{roomTypeErrors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-on-surface mb-1">Max Guests</label>
                      <input
                        type="number"
                        min="1"
                        value={newRoomType.max_guests}
                        onChange={(e) => setNewRoomType({ ...newRoomType, max_guests: Number(e.target.value) })}
                        className="w-full rounded-xl border border-outline-variant px-3 py-2 text-sm focus:border-primary focus:outline-none"
                      />
                      {roomTypeErrors.max_guests && <p className="mt-1 text-xs text-red-500">{roomTypeErrors.max_guests}</p>}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-on-surface mb-1">Base Price ($)</label>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        placeholder="e.g. 120"
                        value={newRoomType.base_price}
                        onChange={(e) => setNewRoomType({ ...newRoomType, base_price: e.target.value })}
                        className="w-full rounded-xl border border-outline-variant px-3 py-2 text-sm focus:border-primary focus:outline-none"
                      />
                      {roomTypeErrors.base_price && <p className="mt-1 text-xs text-red-500">{roomTypeErrors.base_price}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-on-surface mb-1">Amenities</label>
                      <input
                        type="text"
                        placeholder="Wifi, AC, Bath, Mini-bar"
                        value={newRoomType.amenities}
                        onChange={(e) => setNewRoomType({ ...newRoomType, amenities: e.target.value })}
                        className="w-full rounded-xl border border-outline-variant px-3 py-2 text-sm focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-outline-variant">
                    <button
                      type="button"
                      onClick={() => setShowRoomTypeForm(false)}
                      className="rounded-xl border border-outline-variant px-4 py-2 text-xs font-semibold hover:bg-surface-bright transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-xl bg-primary text-white px-4 py-2 text-xs font-semibold hover:bg-primary/90 transition"
                    >
                      Save Room Type
                    </button>
                  </div>
                </form>
              )}

              {/* Room Types Listing */}
              {property.Room_Types?.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-[2rem] border border-outline-variant">
                  <Hotel className="mx-auto h-10 w-10 text-on-surface-variant/40 mb-3" />
                  <p className="text-sm font-semibold">No room types defined</p>
                  <p className="text-xs text-on-surface-variant mt-1">Add a room type (like Single or Deluxe) first.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {property.Room_Types?.map((rt) => (
                    <div
                      key={rt.id}
                      className="rounded-[1.75rem] bg-white border border-outline-variant shadow-sm overflow-hidden"
                    >
                      {/* Room Type Details Header */}
                      <div className="bg-surface-bright px-6 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-outline-variant">
                        <div>
                          <h3 className="text-lg font-bold tracking-tight text-on-surface">{rt.name}</h3>
                          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-on-surface-variant font-semibold">
                            <span>Max guests: {rt.max_guests}</span>
                            <span className="text-outline-variant">•</span>
                            <span className="text-primary font-bold">${Number(rt.base_price).toFixed(2)}/night</span>
                            {rt.amenities && (
                              <>
                                <span className="text-outline-variant">•</span>
                                <span className="flex items-center gap-1 text-secondary">
                                  <Sparkles className="h-3 w-3" />
                                  {rt.amenities}
                                </span>
                              </>
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
                          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-outline-variant bg-white px-4 py-2 text-xs font-bold text-on-surface hover:border-primary/30 transition shadow-sm"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Add Room
                        </button>
                      </div>

                      {/* Add Room Number Form */}
                      {activeRoomTypeForm === rt.id && (
                        <div className="p-4 bg-primary/5 border-b border-outline-variant flex flex-col gap-2 sm:flex-row sm:items-center">
                          <div className="flex-grow">
                            <input
                              type="text"
                              placeholder="Room Number (e.g. 101, 102)"
                              value={newRoomNumber}
                              onChange={(e) => {
                                setNewRoomNumber(e.target.value)
                                setRoomError('')
                              }}
                              className="w-full sm:max-w-xs rounded-xl border border-outline-variant bg-white px-3 py-2 text-xs focus:border-primary focus:outline-none"
                            />
                            {roomError && <p className="mt-1 text-[10px] text-red-500 font-medium">{roomError}</p>}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                handleCreateRoom(rt.id)
                              }}
                              className="rounded-xl bg-primary text-white px-4 py-2 text-xs font-bold hover:bg-primary/95 transition"
                            >
                              Add
                            </button>
                            <button
                              onClick={() => {
                                setActiveRoomTypeForm(null)
                                setNewRoomNumber('')
                                setRoomError('')
                              }}
                              className="rounded-xl bg-white border border-outline-variant px-4 py-2 text-xs font-semibold transition"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Physical Rooms List */}
                      <div className="p-6">
                        {rt.Rooms?.length === 0 ? (
                          <p className="text-xs text-on-surface-variant italic">No physical rooms registered for this type.</p>
                        ) : (
                          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
                            {rt.Rooms?.map((room) => (
                              <div
                                key={room.id}
                                className="flex items-center justify-between rounded-2xl border border-outline-variant p-3 hover:border-primary/20 transition group"
                              >
                                <div>
                                  <p className="text-sm font-bold text-on-surface">{room.room_number}</p>
                                  {/* Status indicator */}
                                  <button
                                    onClick={() => handleToggleRoomStatus(room)}
                                    className={[
                                      'mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold transition hover:scale-[1.03]',
                                      room.status === 'available'
                                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-100'
                                        : room.status === 'maintenance'
                                        ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-100 animate-pulse'
                                        : 'bg-blue-50 text-blue-700 border border-blue-100',
                                    ].join(' ')}
                                    title="Click to toggle status"
                                  >
                                    {room.status === 'available' && <CheckCircle2 className="h-2.5 w-2.5" />}
                                    {room.status === 'maintenance' && <AlertTriangle className="h-2.5 w-2.5" />}
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
