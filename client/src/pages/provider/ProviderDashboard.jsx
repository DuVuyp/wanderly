import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, Plus, Edit, Trash2, ArrowRight, MapPin, Clock, Hotel } from 'lucide-react'
import { toast } from 'sonner'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import { getProperties, deleteProperty } from '../../api/properties'

function ProviderDashboard() {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchProperties = async () => {
    try {
      setLoading(true)
      const res = await getProperties()
      if (res.success) {
        setProperties(res.data || [])
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch properties')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProperties()
  }, [])

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This will delete all its room types and rooms.`)) {
      return
    }

    try {
      const res = await deleteProperty(id)
      if (res.success) {
        toast.success('Property deleted successfully')
        fetchProperties()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete property')
    }
  }

  // Calculate stats
  const totalProperties = properties.length
  let totalRoomTypes = 0
  let totalRooms = 0
  let availableRooms = 0
  let maintenanceRooms = 0

  properties.forEach(p => {
    totalRoomTypes += p.Room_Types?.length || 0
    p.Room_Types?.forEach(rt => {
      totalRooms += rt.Rooms?.length || 0
      rt.Rooms?.forEach(r => {
        if (r.status === 'available') availableRooms++
        if (r.status === 'maintenance') maintenanceRooms++
      })
    })
  })

  const formatTime = (dateStr) => {
    if (!dateStr) return '--:--'
    try {
      const date = new Date(dateStr)
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
    } catch {
      return '--:--'
    }
  }

  return (
    <div className="min-h-screen bg-surface-bright text-on-surface flex flex-col">
      <Header />
      <main className="flex-grow px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="mx-auto max-w-7xl">
          {/* Header section */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight text-on-surface sm:text-4xl">
                Provider Dashboard
              </h1>
              <p className="mt-1 text-sm text-on-surface-variant">
                Manage your properties, room types, and room availability.
              </p>
            </div>
            <Link
              to="/provider/properties/new"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-gradient-start to-button-gradient-pink px-5 py-3 text-sm font-semibold text-white shadow-md shadow-primary-container/40 hover:scale-[1.02] transition"
            >
              <Plus className="h-4 w-4" />
              Add New Property
            </Link>
          </div>

          {/* Stats Section */}
          <div className="grid gap-5 grid-cols-2 lg:grid-cols-4 mb-10">
            <div className="rounded-3xl bg-white p-5 shadow-sm border border-outline-variant">
              <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Total Properties</p>
              <div className="flex items-baseline justify-between mt-2">
                <p className="text-3xl font-bold text-primary">{totalProperties}</p>
                <Building2 className="h-6 w-6 text-primary/40" />
              </div>
            </div>
            <div className="rounded-3xl bg-white p-5 shadow-sm border border-outline-variant">
              <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Room Types</p>
              <div className="flex items-baseline justify-between mt-2">
                <p className="text-3xl font-bold text-secondary">{totalRoomTypes}</p>
                <Hotel className="h-6 w-6 text-secondary/40" />
              </div>
            </div>
            <div className="rounded-3xl bg-white p-5 shadow-sm border border-outline-variant">
              <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Available Rooms</p>
              <div className="flex items-baseline justify-between mt-2">
                <p className="text-3xl font-bold text-emerald-600">{availableRooms}</p>
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  / {totalRooms} total
                </span>
              </div>
            </div>
            <div className="rounded-3xl bg-white p-5 shadow-sm border border-outline-variant">
              <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Maintenance</p>
              <div className="flex items-baseline justify-between mt-2">
                <p className="text-3xl font-bold text-amber-600">{maintenanceRooms}</p>
                {maintenanceRooms > 0 && (
                  <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full animate-pulse">
                    Action required
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Properties list */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-outline-variant">
              <Building2 className="mx-auto h-12 w-12 text-on-surface-variant/40 mb-4" />
              <h3 className="text-lg font-semibold">No properties registered yet</h3>
              <p className="mt-2 text-sm text-on-surface-variant max-w-sm mx-auto">
                Start listing your hotel, resort, villa, or homestay to begin receiving guests.
              </p>
              <Link
                to="/provider/properties/new"
                className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 transition"
              >
                Create Your First Listing
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {properties.map((property) => (
                <div
                  key={property.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] bg-white border border-outline-variant shadow-sm transition hover:shadow-md hover:border-primary/20"
                >
                  {/* Top content */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="inline-flex rounded-full bg-primary/5 border border-primary/10 px-3 py-1 text-xs font-semibold capitalize text-primary">
                        {property.property_type}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-medium">
                        <MapPin className="h-3.5 w-3.5 text-on-surface-variant/70" />
                        <span>{property.latitude.toString().slice(0, 7)}, {property.longitude.toString().slice(0, 7)}</span>
                      </div>
                    </div>

                    <h2 className="text-xl font-bold tracking-tight text-on-surface group-hover:text-primary transition line-clamp-1">
                      {property.name}
                    </h2>

                    <p className="mt-2 text-sm text-on-surface-variant line-clamp-2 min-h-10">
                      {property.address}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-outline-variant pt-4 text-xs font-semibold text-on-surface-variant">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-secondary" />
                        <span>Check-in: {formatTime(property.check_in_time)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-secondary" />
                        <span>Check-out: {formatTime(property.check_out_time)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="flex border-t border-outline-variant bg-surface-bright px-6 py-4 justify-between items-center">
                    <div className="flex gap-2">
                      <Link
                        to={`/provider/properties/edit/${property.id}`}
                        className="rounded-xl border border-outline-variant bg-white p-2 text-on-surface hover:text-primary hover:border-primary/30 transition shadow-sm"
                        title="Edit property details"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(property.id, property.name)}
                        className="rounded-xl border border-outline-variant bg-white p-2 text-red-600 hover:bg-red-50 hover:border-red-200 transition shadow-sm"
                        title="Delete property"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <Link
                      to={`/provider/properties/${property.id}`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-outline-variant hover:border-primary/30 hover:bg-primary/5 hover:text-primary px-4 py-2 text-xs font-bold transition shadow-sm text-on-surface"
                    >
                      Manage Rooms
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default ProviderDashboard
