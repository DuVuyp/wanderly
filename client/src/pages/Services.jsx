import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Search, X, MapPin, Star, ChevronRight, ChevronLeft,
  Hotel, Map, Car, UtensilsCrossed, Ticket, Drama, Sparkles,
  SearchX, Building2, Building
} from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { getAllProperties } from '../api/property';

// Service category icons mapping with Lucide components
const categoryIconsMap = {
  'resort': Building,
  'hotel': Hotel,
  'villa': Map,
  'homestay': Ticket,
  'default': Sparkles
};

// Beautiful placeholder images for services
const categoryImages = {
  'resort': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
  'hotel': 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
  'villa': 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80',
  'homestay': 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80',
  'default': 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80'
};

const CATEGORIES = [
  { id: 'resort', name: 'Resort' },
  { id: 'hotel', name: 'Hotel' },
  { id: 'villa', name: 'Villa' },
  { id: 'homestay', name: 'Homestay' }
];

function Services() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // States
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 0 });

  // Filters
  const [searchKeyword, setSearchKeyword] = useState(searchParams.get('keyword') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get('location') || '');

  // Mock locations based on DB info (or we could extract from properties)
  const locations = [
    { id: 'Nha Trang', name: 'Nha Trang' },
    { id: 'Đà Nẵng', name: 'Đà Nẵng' },
    { id: 'Hội An', name: 'Hội An' },
    { id: 'Quy Nhơn', name: 'Quy Nhơn' },
  ];

  // Load properties
  const loadProperties = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 12,
        ...(searchKeyword && { keyword: searchKeyword }),
        ...(selectedCategory && { property_type: selectedCategory }),
        ...(selectedLocation && { location: selectedLocation })
      };

      const response = await getAllProperties(params);
      setProperties(response.data?.properties || []);
      setPagination(response.data?.pagination || { page: 1, limit: 12, total: 0, totalPages: 0 });
    } catch (error) {
      console.error('Error loading properties:', error);
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  }, [searchKeyword, selectedCategory, selectedLocation]);

  useEffect(() => {
    loadProperties(1);
  }, [selectedCategory, selectedLocation, loadProperties]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    loadProperties(1);

    // Update URL params
    const params = new URLSearchParams();
    if (searchKeyword) params.set('keyword', searchKeyword);
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedLocation) params.set('location', selectedLocation);
    setSearchParams(params);
  };

  // Clear filters
  const clearFilters = () => {
    setSearchKeyword('');
    setSelectedCategory('');
    setSelectedLocation('');
    setSearchParams({});
    loadProperties(1);
  };

  // Get category icon component
  const getCategoryIcon = (categoryName, className = "w-4 h-4") => {
    const name = (categoryName || '').toLowerCase();
    for (const [key, IconComponent] of Object.entries(categoryIconsMap)) {
      if (name.includes(key)) {
        return <IconComponent className={className} />;
      }
    }
    return <Sparkles className={className} />;
  };

  // Get category image (fallback)
  const getCategoryImage = (categoryName) => {
    const name = (categoryName || '').toLowerCase();
    for (const [key, url] of Object.entries(categoryImages)) {
      if (name.includes(key)) return url;
    }
    return categoryImages.default;
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
          </div>

          <div className="relative pt-28 pb-16 px-4">
            <div className="mx-auto max-w-6xl text-center">
              <h1 className="mb-4 text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 md:text-6xl">
                Discover Amazing Properties
              </h1>
              <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600 dark:text-gray-300 md:text-xl">
                Explore top-rated hotels, resorts, homestays and more. Your perfect travel experience awaits!
              </p>

              {/* Search Bar */}
              <form onSubmit={handleSearch} className="mx-auto max-w-3xl">
                <div className="flex flex-col gap-3 rounded-2xl bg-white p-3 shadow-2xl shadow-indigo-500/10 dark:bg-gray-800 md:flex-row">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      placeholder="Search for properties..."
                      className="w-full rounded-xl border-0 bg-gray-50 py-4 pl-12 pr-4 text-gray-900 placeholder-gray-400 transition-all focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <button
                    type="submit"
                    className="flex transform items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-4 font-bold text-white shadow-lg shadow-indigo-500/30 transition-all hover:scale-105 hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl hover:shadow-indigo-500/40"
                  >
                    <Search className="w-5 h-5" />
                    Search
                  </button>
                </div>
              </form>

              {/* Quick Category Pills */}
              <div className="mt-8 flex flex-wrap justify-center gap-2">
                {CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(isSelected ? '' : cat.id)}
                      className={`flex transform items-center gap-2 rounded-full px-5 py-2.5 font-medium transition-all hover:scale-105 ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                          : 'bg-white/80 text-gray-700 shadow-md hover:bg-white dark:bg-gray-800/80 dark:text-gray-300 dark:hover:bg-gray-700'
                      }`}
                    >
                      {getCategoryIcon(cat.name, "w-4 h-4")}
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="mx-auto max-w-7xl px-4 pb-16">
          {/* Filter Bar */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white/60 p-4 shadow-lg backdrop-blur-lg dark:bg-gray-800/60">
            <div className="flex items-center gap-4">
              <span className="font-medium text-gray-600 dark:text-gray-300">
                {loading ? 'Loading...' : `${pagination.total} properties found`}
              </span>

              {/* Location Filter */}
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="cursor-pointer appearance-none rounded-xl border-0 bg-gray-100 py-2 pl-9 pr-4 text-gray-700 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-300"
                >
                  <option value="">All Locations</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {(searchKeyword || selectedCategory || selectedLocation) && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-indigo-600 transition-colors hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/30"
              >
                <X className="w-4 h-4" />
                Clear Filters
              </button>
            )}
          </div>

          {/* Properties Grid */}
          {loading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse overflow-hidden rounded-2xl bg-white shadow-lg dark:bg-gray-800">
                  <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
                  <div className="space-y-3 p-5">
                    <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
                    <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700"></div>
                    <div className="h-3 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30">
                <SearchX className="h-10 w-10 text-indigo-500" />
              </div>
              <h3 className="mb-2 text-2xl font-bold text-gray-700 dark:text-gray-300">No properties found</h3>
              <p className="mb-6 text-gray-500 dark:text-gray-400">Try adjusting your filters or search terms</p>
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-medium text-white transition-colors hover:bg-indigo-700"
              >
                <X className="w-4 h-4" />
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {properties.map((property) => {
                const categoryName = property.property_type || 'default';
                const propertyName = property.name || 'Unnamed Property';
                const addressParts = property.address ? property.address.split(',') : [];
                const locationName = addressParts.length > 1 ? addressParts.slice(-2, -1)[0]?.trim() : 'Vietnam';
                
                return (
                  <div
                    key={property.id}
                    onClick={() => navigate(`/services/${property.id}`)}
                    className="group cursor-pointer overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl dark:bg-gray-800"
                  >
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={getCategoryImage(categoryName)}
                        alt={propertyName}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                      {/* Category Badge */}
                      <div className="absolute left-3 top-3">
                        <span className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold capitalize text-gray-700 backdrop-blur-sm dark:bg-gray-900/90 dark:text-gray-300">
                          {getCategoryIcon(categoryName, "w-3.5 h-3.5")}
                          {categoryName}
                        </span>
                      </div>

                      {/* Rating Badge (Mocked or from DB) */}
                      <div className="absolute right-3 top-3">
                        <span className="flex items-center gap-1 rounded-lg bg-amber-400 px-2.5 py-1 text-xs font-bold text-gray-900">
                          <Star className="h-3.5 w-3.5 fill-current" />
                          4.5
                        </span>
                      </div>

                      {/* Location on image */}
                      <div className="absolute bottom-3 left-3 right-3">
                        <p className="flex items-center gap-1.5 text-sm font-medium text-white drop-shadow-lg">
                          <MapPin className="h-4 w-4" />
                          {locationName}
                        </p>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="mb-2 line-clamp-1 text-lg font-bold text-gray-900 transition-colors group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                        {propertyName}
                      </h3>

                      <p className="mb-3 min-h-[40px] line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                        {property.address}
                      </p>

                      {/* Provider */}
                      <div className="flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
                            <Building2 className="h-4 w-4" />
                          </div>
                          <span className="max-w-[120px] truncate text-sm text-gray-600 dark:text-gray-400">
                            Wanderly Partner
                          </span>
                        </div>

                        <button className="group/btn flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700">
                          View
                          <ChevronRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              <button
                onClick={() => loadProperties(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="flex items-center gap-1 rounded-xl bg-white px-4 py-2 text-gray-700 shadow-md transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>

              <div className="flex items-center gap-1">
                {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.page >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = pagination.page - 2 + i;
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => loadProperties(pageNum)}
                      className={`h-10 w-10 rounded-xl font-medium transition-all ${
                        pagination.page === pageNum
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                          : 'bg-white text-gray-700 shadow-md hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => loadProperties(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="flex items-center gap-1 rounded-xl bg-white px-4 py-2 text-gray-700 shadow-md transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />

      {/* Custom Animations */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </>
  );
}

export default Services;
