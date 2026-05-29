import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, Plus, Edit, Trash2, ArrowRight, MapPin, Clock, Hotel, CheckCircle2, AlertTriangle } from 'lucide-react'
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
    <div className="min-h-screen bg-surface-bright text-on-surface flex flex-col relative overflow-hidden">
      {/* Dynamic Background Blobs */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-gradient-end hero-blob opacity-20 pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] bg-gradient-start hero-blob opacity-10 pointer-events-none" />

      <Header />
      
      <main className="flex-grow px-4 py-8 sm:px-6 lg:px-8 lg:py-12 relative z-10">
        <div className="mx-auto max-w-7xl">
          {/* Header section */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-10">
            <div>
              <h1 className="font-display text-4xl font-extrabold tracking-tight text-on-surface sm:text-5xl">
                <span className="text-gradient">Provider Dashboard</span>
              </h1>
              <p className="mt-2 text-sm font-medium text-on-surface-variant">
                Manage your accommodation properties, room types, and physical room inventories.
              </p>
            </div>
            <Link
              to="/provider/properties/new"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-gradient-start to-button-gradient-pink px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary-container/30 hover:scale-[1.03] transition-all duration-300"
            >
              <Plus className="h-5 w-5" />
              Add New Property
            </Link>
          </div>

          {/* Stats Section */}
          <div className="grid gap-6 grid-cols-2 lg:grid-cols-4 mb-12">
            {/* Card 1 */}
            <div className="rounded-3xl glass-card p-5 shadow-lg border border-white/50 bg-white/70 hover:shadow-xl transition-all duration-300 flex flex-col justify-between min-h-36">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant font-display">Total Properties</p>
                <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
                  <Building2 className="h-5 w-5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between mt-4">
                <p className="text-4xl font-extrabold text-primary font-display">{totalProperties}</p>
                <span className="text-[10px] font-bold text-primary/80 bg-primary/5 px-2.5 py-1 rounded-full border border-primary/10">
                  Active Listings
                </span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="rounded-3xl glass-card p-5 shadow-lg border border-white/50 bg-white/70 hover:shadow-xl transition-all duration-300 flex flex-col justify-between min-h-36">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant font-display">Room Categories</p>
                <div className="p-2.5 rounded-2xl bg-secondary/10 text-secondary">
                  <Hotel className="h-5 w-5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between mt-4">
                <p className="text-4xl font-extrabold text-secondary font-display">{totalRoomTypes}</p>
                <span className="text-[10px] font-bold text-secondary/80 bg-secondary/5 px-2.5 py-1 rounded-full border border-secondary/10">
                  Room Types
                </span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="rounded-3xl glass-card p-5 shadow-lg border border-white/50 bg-white/70 hover:shadow-xl transition-all duration-300 flex flex-col justify-between min-h-36">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant font-display">Available Rooms</p>
                <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between mt-4">
                <p className="text-4xl font-extrabold text-emerald-600 font-display">{availableRooms}</p>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                  / {totalRooms} Total
                </span>
              </div>
            </div>

            {/* Card 4 */}
            <div className="rounded-3xl glass-card p-5 shadow-lg border border-white/50 bg-white/70 hover:shadow-xl transition-all duration-300 flex flex-col justify-between min-h-36">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant font-display">In Maintenance</p>
                <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600">
                  <AlertTriangle className="h-5 w-5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between mt-4">
                <p className="text-4xl font-extrabold text-amber-600 font-display">{maintenanceRooms}</p>
                {maintenanceRooms > 0 ? (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100 animate-pulse">
                    Action Required
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-on-surface-variant bg-surface px-2.5 py-1 rounded-full border border-outline-variant">
                    All Healthy
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Properties list */}
          {loading ? (
            <div className="flex justify-center items-center py-24">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-20 glass-card bg-white/50 rounded-[2.5rem] border border-white/40 shadow-lg">
              <Building2 className="mx-auto h-16 w-16 text-on-surface-variant/40 mb-6" />
              <h3 className="text-2xl font-bold tracking-tight text-on-surface">No properties registered yet</h3>
              <p className="mt-2 text-sm text-on-surface-variant max-w-sm mx-auto">
                Start listing your hotel, resort, villa, or homestay to begin receiving guests and managing reservations.
              </p>
              <Link
                to="/provider/properties/new"
                className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-gradient-start to-button-gradient-pink px-6 py-3.5 text-sm font-semibold text-white shadow-md hover:scale-[1.02] transition duration-300"
              >
                Create Your First Listing
              </Link>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {properties.map((property) => (
                <div
                  key={property.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-[2.5rem] bg-white/90 border border-outline-variant shadow-md transition-all duration-300 hover:shadow-xl hover:border-primary/20 hover:-translate-y-1"
                >
                  {/* Visual Top Decorative Gradient Line */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-gradient-start via-gradient-mid to-gradient-end opacity-80 group-hover:opacity-100 transition-opacity" />

                  {/* Top content */}
                  <div className="p-6 pt-8">
                    <div className="flex items-center justify-between mb-4">
                      <span className="inline-flex rounded-full bg-primary/5 border border-primary/10 px-3.5 py-1 text-xs font-bold capitalize text-primary">
                        {property.property_type}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-bold">
                        <MapPin className="h-3.5 w-3.5 text-primary-container" />
                        <span>{Number(property.latitude).toFixed(4)}, {Number(property.longitude).toFixed(4)}</span>
                      </div>
                    </div>

                    <h2 className="text-2xl font-bold tracking-tight text-on-surface group-hover:text-primary transition line-clamp-1">
                      {property.name}
                    </h2>

                    <p className="mt-2 text-sm text-on-surface-variant line-clamp-2 min-h-10 leading-relaxed">
                      {property.address}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 border-t border-outline-variant/60 pt-4 text-xs font-bold text-on-surface-variant">
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
                  <div className="flex border-t border-outline-variant/60 bg-surface-bright/50 px-6 py-4 justify-between items-center">
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
                      className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-outline-variant hover:border-primary/30 hover:bg-primary/5 hover:text-primary px-4 py-2.5 text-xs font-bold transition shadow-sm text-on-surface"
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
