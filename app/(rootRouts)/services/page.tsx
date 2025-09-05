'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiClient } from '@/lib/api/client';
import { Service, ServiceFilters } from '@/types';
import { toast } from 'sonner';
import { 
  Search, MapPin, Clock, Star, Wrench, 
  Grid, List,
} from 'lucide-react';
import { WishlistIcon } from '@/components/ui/WishlistIcon';
import Link from 'next/link';
import Image from 'next/image';
import LocationSearch from '@/components/services/LocationSearch';

interface ServicesPageData {
  services: Service[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default function ServicesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<ServicesPageData | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [serviceType, setServiceType] = useState(searchParams.get('type') || 'all');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'rating');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [coordinates, setCoordinates] = useState<{lat: number; lng: number} | null>(null);

  useEffect(() => {
    loadServices();
    loadCategories();
  }, [searchParams, coordinates]);

  const loadServices = async () => {
    try {
      setIsLoading(true);

      const filters: ServiceFilters = {
        page: parseInt(searchParams.get('page') || '1'),
        limit: 12,
        search: searchParams.get('search') || undefined,
        categoryId: searchParams.get('category') || undefined,
        isMobileService: searchParams.get('type') === 'mobile' ? true : searchParams.get('type') === 'shop' ? false : undefined,
        minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined,
        maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
        city: searchParams.get('location') || undefined,
      };

      // Remove undefined values
      Object.keys(filters).forEach(key => 
        filters[key as keyof ServiceFilters] === undefined && delete filters[key as keyof ServiceFilters]
      );

      let response;
      
      // Use location-based search if coordinates are available
      if (coordinates) {
        response = await apiClient.searchServicesNearLocation(
          coordinates.lat,
          coordinates.lng,
          10, // 10km radius
          filters
        );
      } else {
        response = await apiClient.getServices(filters);
      }
      
      if (response.success && response.data) {
        console.log('Services API response:', response.data);
        
        // Log services to check if inactive ones are being returned
        if (response.data.services) {
          console.log('Services received:', response.data.services.length);
          const inactiveServices = response.data.services.filter((s: any) => !s.isActive);
          if (inactiveServices.length > 0) {
            console.warn('Found inactive services in response:', inactiveServices);
          }
        }
        
        setData(response.data);
      } else {
        toast.error('Failed to load services');
      }
    } catch (error) {
      console.error('Failed to load services:', error);
      toast.error('Failed to load services');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await apiClient.getServiceCategories();
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (selectedCategory && selectedCategory !== 'all') params.set('category', selectedCategory);
    if (serviceType && serviceType !== 'all') params.set('type', serviceType);
    if (sortBy !== 'rating') params.set('sortBy', sortBy);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (location.trim()) params.set('location', location.trim());
    
    router.push(`/services?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setServiceType('all');
    setSortBy('rating');
    setMinPrice('');
    setMaxPrice('');
    setLocation('');
    router.push('/services');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className="min-h-screen bg-wrench-bg-primary">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-wrench-accent to-wrench-accent-light text-black">
        <div className="container-responsive py-16">
          <div className="text-center max-w-3xl mx-auto mt-20">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              Professional Auto Services
            </h1>
            <p className="text-xl text-gray-900 mb-8">
              Find trusted mechanics and book automotive services near you
            </p>
            
            {/* Quick Search */}
            <div className="bg-white rounded-lg p-6 shadow-xl">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search services (e.g., oil change, brake repair)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-12"
                  />
                </div>
                <div className="flex-1">
                  <LocationSearch
                    value={location}
                    onChange={(newLocation, coords) => {
                      setLocation(newLocation);
                      setCoordinates(coords || null);
                    }}
                    placeholder="Enter city or area"
                    className="h-12"
                  />
                </div>
                <Button 
                  onClick={applyFilters}
                  className="h-12 px-8"
                  leftIcon={<Search className="h-5 w-5" />}
                >
                  Search
                </Button>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Link href="/services/categories">
                  <Button variant="outline" size="sm">
                    Browse by Category
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Controls */}
      <div className="bg-white border-b border-gray-200 ">
        <div className="container-responsive py-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4 items-center">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={serviceType} onValueChange={setServiceType}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Service Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="mobile">Mobile Service</SelectItem>
                  <SelectItem value="shop">Shop Service</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2 items-center">
                <Input
                  placeholder="Min Price"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  type="number"
                  className="w-24"
                />
                <span>-</span>
                <Input
                  placeholder="Max Price"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  type="number"
                  className="w-24"
                />
              </div>

              <Button variant="outline" onClick={clearFilters}>
                Clear All
              </Button>
            </div>

            <div className="flex gap-2 items-center">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Best Rated</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                </SelectContent>
              </Select>

              <div className="border rounded-lg p-1 flex">
                <Button
                  variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container-responsive py-8">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading services...</p>
            </div>
          </div>
        ) : !data?.services?.length ? (
          <div className="text-center py-20">
            <Wrench className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No services found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search criteria or location</p>
            <Button onClick={clearFilters}>Clear Filters</Button>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {data.pagination.total} Services Found
              </h2>
              <p className="text-gray-600">
                Page {data.pagination.page} of {data.pagination.pages}
              </p>
            </div>

            {/* Services Grid/List */}
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8'
              : 'space-y-6 mb-8'
            }>
              {data.services.map((service) => (
                <ServiceCard 
                  key={service.id} 
                  service={service} 
                  viewMode={viewMode}
                  formatPrice={formatPrice}
                  formatDuration={formatDuration}
                />
              ))}
            </div>

            {/* Pagination */}
            {data.pagination.pages > 1 && (
              <div className="flex justify-center gap-2">
                {[...Array(data.pagination.pages)].map((_, i) => (
                  <Button
                    key={i + 1}
                    variant={data.pagination.page === i + 1 ? 'primary' : 'outline'}
                    onClick={() => {
                      const params = new URLSearchParams(searchParams);
                      params.set('page', (i + 1).toString());
                      router.push(`/services?${params.toString()}`);
                    }}
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Service Card Component
function ServiceCard({ 
  service, 
  viewMode, 
  formatPrice, 
  formatDuration 
}: { 
  service: Service; 
  viewMode: 'grid' | 'list';
  formatPrice: (price: number) => string;
  formatDuration: (minutes: number) => string;
}) {
  const primaryImage = service.images?.[0];

  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex gap-6">
            {/* Image */}
            <div className="w-48 h-32 flex-shrink-0 relative">
              {primaryImage ? (
                <Image
                  src={primaryImage}
                  alt={service.title}
                  width={192}
                  height={128}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                  <Wrench className="h-8 w-8 text-gray-400" />
                </div>
              )}
              
              {/* Wishlist Icon */}
              <WishlistIcon
                id={service.id}
                type="service"
                title={service.title}
                price={service.price}
                image={primaryImage || ''}
                category={service.category?.name}
                sellerName={service.seller.shopName}
                size="sm"
                className="absolute top-2 right-2"
              />
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-semibold text-gray-900">{service.title}</h3>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">{formatPrice(service.price)}</div>
                  <div className="text-sm text-gray-500">{formatDuration(service.durationMinutes)}</div>
                </div>
              </div>

              <p className="text-gray-600 mb-4 line-clamp-2">{service.description}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">{service.ratingAverage || 'New'}</span>
                  </div>
                  
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{service.seller.city}, {service.seller.area}</span>
                  </div>

                  {service.isMobileService && (
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                      Mobile Service
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <Link href={`/services/${service.id}`}>
                    <Button size="sm">View Details</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="aspect-video relative">
        {primaryImage ? (
          <Image
            src={primaryImage}
            alt={service.title}
            fill
            className="object-cover rounded-t-lg"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 rounded-t-lg flex items-center justify-center">
            <Wrench className="h-12 w-12 text-gray-400" />
          </div>
        )}
        
        {/* Wishlist Icon */}
        <WishlistIcon
          id={service.id}
          type="service"
          title={service.title}
          price={service.price}
          image={primaryImage || ''}
          category={service.category?.name}
          sellerName={service.seller.shopName}
        />
        
        {service.isMobileService && (
          <div className="absolute top-3 left-3">
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
              Mobile Service
            </span>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-gray-900 line-clamp-1">{service.title}</h3>
          <div className="text-right">
            <div className="text-lg font-bold text-blue-600">{formatPrice(service.price)}</div>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{service.description}</p>

        <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
          <Clock className="h-4 w-4" />
          <span>{formatDuration(service.durationMinutes)}</span>
          
          <MapPin className="h-4 w-4 ml-2" />
          <span className="line-clamp-1">{service.seller.city}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium">{service.ratingAverage || 'New'}</span>
          </div>

          <Link href={`/services/${service.id}`}>
            <Button size="sm">Book Now</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
