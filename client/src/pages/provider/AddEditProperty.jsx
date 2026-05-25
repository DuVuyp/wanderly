import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, Building2, MapPin, Clock, Save } from 'lucide-react'
import { toast } from 'sonner'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import { createProperty, getPropertyById, updateProperty } from '../../api/properties'

function AddEditProperty() {
  const { id } = useParams()
  const isEditMode = Boolean(id)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEditMode)

  const [formData, setFormData] = useState({
    name: '',
    property_type: 'hotel',
    address: '',
    latitude: '',
    longitude: '',
    check_in_time: '14:00',
    check_out_time: '12:00',
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isEditMode) {
      const fetchProperty = async () => {
        try {
          const res = await getPropertyById(id)
          if (res.success && res.data) {
            const prop = res.data
            // Format check-in/out dates from database to HH:MM format
            const formatToTimeInput = (dateStr) => {
              if (!dateStr) return '12:00'
              const date = new Date(dateStr)
              const hours = String(date.getUTCHours()).padStart(2, '0')
              const minutes = String(date.getUTCMinutes()).padStart(2, '0')
              return `${hours}:${minutes}`
            }

            setFormData({
              name: prop.name,
              property_type: prop.property_type,
              address: prop.address,
              latitude: Number(prop.latitude),
              longitude: Number(prop.longitude),
              check_in_time: formatToTimeInput(prop.check_in_time),
              check_out_time: formatToTimeInput(prop.check_out_time),
            })
          }
        } catch (error) {
          toast.error(error.response?.data?.message || 'Failed to fetch property details')
          navigate('/provider')
        } finally {
          setFetching(false)
        }
      }
      fetchProperty()
    }
  }, [id, isEditMode, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear validation error when editing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Property name is required'
    if (!formData.address.trim()) newErrors.address = 'Address is required'

    const lat = Number(formData.latitude)
    if (formData.latitude === '' || isNaN(lat)) {
      newErrors.latitude = 'Latitude must be a valid number'
    } else if (lat < -90 || lat > 90) {
      newErrors.latitude = 'Latitude must be between -90 and 90'
    }

    const lng = Number(formData.longitude)
    if (formData.longitude === '' || isNaN(lng)) {
      newErrors.longitude = 'Longitude must be a valid number'
    } else if (lng < -180 || lng > 180) {
      newErrors.longitude = 'Longitude must be between -180 and 180'
    }

    if (!formData.check_in_time) newErrors.check_in_time = 'Check-in time is required'
    if (!formData.check_out_time) newErrors.check_out_time = 'Check-out time is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      setLoading(true)
      const payload = {
        ...formData,
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
      }

      let res
      if (isEditMode) {
        res = await updateProperty(id, payload)
      } else {
        res = await createProperty(payload)
      }

      if (res.success) {
        toast.success(isEditMode ? 'Property updated successfully' : 'Property created successfully')
        navigate('/provider')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
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

  return (
    <div className="min-h-screen bg-surface-bright text-on-surface flex flex-col">
      <Header />
      <main className="flex-grow px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="mx-auto max-w-2xl">
          {/* Back Link */}
          <Link
            to="/provider"
            className="inline-flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-primary transition mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          {/* Form Card */}
          <div className="rounded-[2rem] bg-white p-8 shadow-sm border border-outline-variant">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold tracking-tight text-on-surface">
                  {isEditMode ? 'Edit Property' : 'Add New Property'}
                </h1>
                <p className="text-xs text-on-surface-variant">
                  {isEditMode ? 'Update your accommodation details.' : 'Register a new accommodation in Wanderly.'}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-2">Property Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Majestic Hotel & Resort"
                  className={[
                    'w-full rounded-2xl border px-4 py-3 text-sm transition focus:outline-none focus:ring-2 focus:ring-primary/20',
                    errors.name ? 'border-red-500 focus:border-red-500' : 'border-outline-variant focus:border-primary',
                  ].join(' ')}
                />
                {errors.name && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.name}</p>}
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-2">Property Type</label>
                <select
                  name="property_type"
                  value={formData.property_type}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-outline-variant px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                >
                  <option value="hotel">Hotel</option>
                  <option value="homestay">Homestay</option>
                  <option value="resort">Resort</option>
                  <option value="villa">Villa</option>
                </select>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-2">Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Full street address, city, country"
                  className={[
                    'w-full rounded-2xl border px-4 py-3 text-sm transition focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none',
                    errors.address ? 'border-red-500 focus:border-red-500' : 'border-outline-variant focus:border-primary',
                  ].join(' ')}
                ></textarea>
                {errors.address && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.address}</p>}
              </div>

              {/* Coordinates */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="flex items-center gap-1 text-sm font-semibold text-on-surface mb-2">
                    <MapPin className="h-4 w-4 text-on-surface-variant" />
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    placeholder="-90 to 90"
                    className={[
                      'w-full rounded-2xl border px-4 py-3 text-sm transition focus:outline-none focus:ring-2 focus:ring-primary/20',
                      errors.latitude ? 'border-red-500 focus:border-red-500' : 'border-outline-variant focus:border-primary',
                    ].join(' ')}
                  />
                  {errors.latitude && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.latitude}</p>}
                </div>

                <div>
                  <label className="flex items-center gap-1 text-sm font-semibold text-on-surface mb-2">
                    <MapPin className="h-4 w-4 text-on-surface-variant" />
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    placeholder="-180 to 180"
                    className={[
                      'w-full rounded-2xl border px-4 py-3 text-sm transition focus:outline-none focus:ring-2 focus:ring-primary/20',
                      errors.longitude ? 'border-red-500 focus:border-red-500' : 'border-outline-variant focus:border-primary',
                    ].join(' ')}
                  />
                  {errors.longitude && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.longitude}</p>}
                </div>
              </div>

              {/* Times */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="flex items-center gap-1 text-sm font-semibold text-on-surface mb-2">
                    <Clock className="h-4 w-4 text-on-surface-variant" />
                    Check-in Time
                  </label>
                  <input
                    type="time"
                    name="check_in_time"
                    value={formData.check_in_time}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-outline-variant px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  {errors.check_in_time && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.check_in_time}</p>}
                </div>

                <div>
                  <label className="flex items-center gap-1 text-sm font-semibold text-on-surface mb-2">
                    <Clock className="h-4 w-4 text-on-surface-variant" />
                    Check-out Time
                  </label>
                  <input
                    type="time"
                    name="check_out_time"
                    value={formData.check_out_time}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-outline-variant px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  {errors.check_out_time && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.check_out_time}</p>}
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-4 border-t border-outline-variant pt-6 mt-8">
                <Link
                  to="/provider"
                  className="flex-1 text-center rounded-2xl border border-outline-variant px-5 py-3 text-sm font-semibold hover:bg-surface-bright transition"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-gradient-start to-button-gradient-pink px-5 py-3 text-sm font-semibold text-white shadow-md shadow-primary-container/40 hover:scale-[1.01] transition disabled:opacity-55"
                >
                  <Save className="h-4 w-4" />
                  {loading ? 'Saving...' : 'Save Property'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default AddEditProperty
