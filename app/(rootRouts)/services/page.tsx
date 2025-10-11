'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Card, CardContent, } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { apiClient } from '@/lib/api/client';
import { Service, ServiceFilters } from '@/types';
import { toast } from 'sonner';
import {
  Search, MapPin, Clock, Star, Wrench
} from 'lucide-react';
import { WishlistIcon } from '@/components/ui/WishlistIcon';
import Link from 'next/link';
import Image from 'next/image';
import LocationSearch from '@/components/services/LocationSearch';
import { LocationFilter } from '@/components/location/LocationFilter';
import { formatPrice } from '@/lib/utils';

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
  const t = useTranslations('servicesPage');
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = pathname?.split('/').filter(Boolean)[0] === 'ar' ? 'ar' : 'en';
  const searchParams = useSearchParams();
  const [data, setData] = useState<ServicesPageData | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter states
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [serviceType, setServiceType] = useState(searchParams.get('type') || 'all');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'rating');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [radiusKm, setRadiusKm] = useState(parseInt(searchParams.get('radiusKm') || '20'));
  const [showLocationFilter, setShowLocationFilter] = useState(false);

  // Initialize coordinates from URL parameters
  useEffect(() => {
    const lat = searchParams.get('latitude');
    const lng = searchParams.get('longitude');
    if (lat && lng) {
      setCoordinates({
        lat: parseFloat(lat),
        lng: parseFloat(lng)
      });
    }
  }, [searchParams]);

  useEffect(() => {
    loadServices();
    loadCategories();
  }, [searchParams, coordinates, currentLocale]);

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
        latitude: coordinates?.lat ? Number(coordinates.lat) : undefined,
        longitude: coordinates?.lng ? Number(coordinates.lng) : undefined,
        radiusKm: Number(radiusKm),
      };

      console.log('Services API filters before sending:', {
        latitude: filters.latitude,
        longitude: filters.longitude,
        radiusKm: filters.radiusKm,
        types: {
          latitude: typeof filters.latitude,
          longitude: typeof filters.longitude,
          radiusKm: typeof filters.radiusKm
        }
      });

      // Remove undefined values
      Object.keys(filters).forEach(key =>
        filters[key as keyof ServiceFilters] === undefined && delete filters[key as keyof ServiceFilters]
      );

      let response;

      // Use location-based search if coordinates are available
      if (coordinates) {
        console.log('🌍 Using location-based search with coordinates:', coordinates, 'radius:', radiusKm);
        response = await apiClient.searchServicesNearLocation(
          coordinates.lat,
          coordinates.lng,
          radiusKm, // Use the user-selected radius
          filters
        );
      } else {
        console.log('📍 No coordinates available, using regular search');
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
        toast.error(t('loadServicesFailed'));
      }
    } catch (error) {
      console.error('Failed to load services:', error);
      toast.error(t('loadServicesFailed'));
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
    if (coordinates) {
      params.set('latitude', coordinates.lat.toString());
      params.set('longitude', coordinates.lng.toString());
    }
    if (radiusKm !== 20) params.set('radiusKm', radiusKm.toString());

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
    setCoordinates(null);
    setRadiusKm(20);
    router.push('/services');
  };

  // Location filter handlers
  const handleLocationChange = (newLocation: string | null, coords?: { lat: number; lng: number }) => {
    setLocation(newLocation || '');
    setCoordinates(coords || null);
  };

  const handleRadiusChange = (newRadius: number) => {
    setRadiusKm(newRadius);
  };

  const handleUseCurrentLocation = () => {
    // This will trigger the location permission modal in LocationFilter
  };

  const handleClearLocation = () => {
    setLocation('');
    setCoordinates(null);
    setRadiusKm(20);
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
      <div 
        className="relative bg-cover bg-center bg-no-repeat text-white"
        style={{
          backgroundImage: 'url(/service01.jpg)',
          minHeight: '40vh'
        }}
      >
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40"></div>
        
        <div className="container-responsive py-16 relative z-10">
          <div className="text-center max-w-3xl mx-auto mt-20">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4 text-white">
              {t('heroTitle')}
            </h1>
            <p className="text-xl text-white/90 mb-8">
              {t('heroSubtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm border mx-auto max-w-7xl border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
                className="pl-9 pr-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* Service Type Dropdown */}
          <div className="min-w-[120px]">
            <select
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-wrench-accent"
            >
              <option value="all">{t('allTypes')}</option>
              <option value="mobile">{t('mobileType')}</option>
              <option value="shop">{t('shopType')}</option>
            </select>
          </div>

          {/* Price Range */}
          <div className="flex items-center gap-2 min-w-[200px]">
            <Input
              type="number"
              placeholder={t('min')}
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-20 text-sm py-2"
            />
            <span className="text-gray-500">-</span>
            <Input
              type="number"
              placeholder={t('max')}
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-20 text-sm py-2"
            />
            <Button
              size="sm"
              onClick={applyFilters}
              className="px-3 py-2"
            >
              {t('apply')}
            </Button>
          </div>

          {/* Location Filter Toggle */}
          <Button
            variant={location && coordinates ? "primary" : "outline"}
            size="sm"
            onClick={() => setShowLocationFilter(!showLocationFilter)}
            className="min-w-[120px]"
          >
            <MapPin className="h-4 w-4 mr-1" />
            {location && coordinates ? t('locationChecked') : t('location')}
          </Button>

          {/* Clear Filters */}
          {(searchQuery || location || serviceType !== 'all' || minPrice || maxPrice || radiusKm !== 20) && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="text-gray-600 hover:text-gray-800"
            >
              {t('clear')}
            </Button>
          )}
        </div>

        {/* Location Distance Filter Section */}
        {showLocationFilter && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <LocationFilter
              currentLocation={location}
              currentRadius={radiusKm}
              onLocationChange={handleLocationChange}
              onRadiusChange={handleRadiusChange}
              onUseCurrentLocation={handleUseCurrentLocation}
              onClearLocation={handleClearLocation}
            />
          </div>
        )}
      </div>

      {/* Results */}
      <div className="container-responsive py-8">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">{t('loading')}</p>
            </div>
          </div>
        ) : !data?.services?.length ? (
          <div className="text-center py-20">
            <Wrench className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('noResults')}</h3>
            <p className="text-gray-600 mb-4">{t('tryAdjusting')}</p>
            <Button onClick={clearFilters}>{t('clear')}</Button>
          </div>
        ) : (
          <>
            {/* Services Grid */}
            <div className="flex justify-center flex-wrap gap-4">
              {data.services.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
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

// Service Card Component - Wishlist Style
function ServiceCard({
  service,
  formatDuration
}: {
  service: Service;
  formatDuration: (minutes: number) => string;
}) {
  const pathname = usePathname();
  const currentLocale = pathname?.split('/').filter(Boolean)[0] === 'ar' ? 'ar' : 'en';
  const t = useTranslations('servicesPage');
  const primaryImage = service.images?.[0];

  return (
    <Card className="group hover:shadow-lg transition-shadow p-3 w-[260px] sm:w-[280px]">
      <div className="relative aspect-square overflow-hidden rounded-t-lg">
        <Image
          src={primaryImage || '/placeholder-image.jpg'}
          alt={service.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-200"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />

        {/* Left Side Badges */}
        <div className="absolute top-2 left-2 flex gap-1">
          {/* Category Badge */}
          {service.category?.name && (
            <div className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
              {service.category.name}
            </div>
          )}

          {/* Mobile Service Badge */}
          {service.isMobileService && (
            <div className="bg-wrench-accent text-wrench-text-primary text-xs px-2 py-1 rounded">
              Mobile
            </div>
          )}
        </div>

        {/* Wishlist Heart Icon - Right Side */}
        <div className="absolute top-1 right-1">
          <WishlistIcon
            id={service.id}
            type="service"
            title={service.title}
            price={service.price}
            image={primaryImage || ''}
            category={service.category?.name}
            sellerName={service.seller.shopName}
            size="sm"
          />
        </div>
      </div>

      <CardContent className="pt-2">
        <Link href={`/${currentLocale}/services/${service.id}`}>
          <Button variant="link" className="font-semibold p-0 text-gray-900 mb-2 line-clamp-2">
            {service.title}
          </Button>
        </Link>

        <p className="text-sm text-gray-600 mb-2">
          {t('by')} {service.seller.shopName}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-wrench-orange-600">
            {formatPrice(service.price, service.currency || 'AED', currentLocale)}
          </span>

          <div className="flex space-x-2">
                <Link href={`/${currentLocale}/services/${service.id}`} className="w-full">
              <Button
                size="sm"
                className="w-full"
              >
                    {t('bookNow')}
              </Button>
            </Link>
          </div>
        </div>

        {/* Duration and Location */}
        <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            <span>{formatDuration(service.durationMinutes)}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="h-3 w-3 mr-1" />
            <span className="line-clamp-1">
              {service.seller.city}, {service.seller.area}
            </span>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
          <div className="flex items-center">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${i < Math.floor(service.ratingAverage || 0)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                    }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500 ml-1">({service.ratingCount || 0})</span>
          </div>
          <div className="text-xs text-gray-500">
            {service.isMobileService ? t('mobileBadge') : t('shopBadge')}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
