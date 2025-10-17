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
import { useLiveSearch } from '@/hooks/useLiveSearch';
import { AnimatePresence, motion } from 'framer-motion';

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
  const pathname = usePathname();
  const currentLocale = pathname?.split('/').filter(Boolean)[0] === 'ar' ? 'ar' : 'en';
  const searchParams = useSearchParams();
  
  const [data, setData] = useState<ServicesPageData | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showLocationFilter, setShowLocationFilter] = useState(false);

  // Live search hook - auto-updates on filter changes
  const { filters, updateFilter, clearFilters: clearAllFilters, isSearching } = useLiveSearch({
    debounceMs: 500,
    onSearch: loadServices
  });

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, [currentLocale]);

  // Initialize filters from URL on mount
  useEffect(() => {
    const initFromURL = async () => {
      const params = searchParams;
      const initialFilters: Record<string, any> = {};
      
      if (params.get('search')) initialFilters.search = params.get('search');
      if (params.get('category')) initialFilters.category = params.get('category');
      if (params.get('type')) initialFilters.type = params.get('type');
      if (params.get('minPrice')) initialFilters.minPrice = params.get('minPrice');
      if (params.get('maxPrice')) initialFilters.maxPrice = params.get('maxPrice');
      if (params.get('location')) initialFilters.location = params.get('location');
      if (params.get('latitude')) initialFilters.latitude = params.get('latitude');
      if (params.get('longitude')) initialFilters.longitude = params.get('longitude');
      if (params.get('radiusKm')) initialFilters.radiusKm = params.get('radiusKm');
      
      // Set initial filters (won't trigger search due to isInitialMount flag in hook)
      Object.entries(initialFilters).forEach(([key, value]) => {
        updateFilter(key, value);
      });

      // Load initial data
      if (Object.keys(initialFilters).length > 0 || !params.get('search')) {
        await loadServices(initialFilters);
      }
    };
    
    initFromURL();
  }, []);

  async function loadServices(currentFilters: Record<string, any>) {
    try {
      setIsLoading(true);

      const serviceFilters: ServiceFilters = {
        page: 1,
        limit: 12,
        search: currentFilters.search || undefined,
        categoryId: currentFilters.category || undefined,
        isMobileService: currentFilters.type === 'mobile' ? true : currentFilters.type === 'shop' ? false : undefined,
        minPrice: currentFilters.minPrice ? parseFloat(currentFilters.minPrice) : undefined,
        maxPrice: currentFilters.maxPrice ? parseFloat(currentFilters.maxPrice) : undefined,
        city: currentFilters.location || undefined,
        latitude: currentFilters.latitude ? parseFloat(currentFilters.latitude) : undefined,
        longitude: currentFilters.longitude ? parseFloat(currentFilters.longitude) : undefined,
        radiusKm: currentFilters.radiusKm ? parseFloat(currentFilters.radiusKm) : 20,
      };

      // Remove undefined values
      Object.keys(serviceFilters).forEach(key =>
        serviceFilters[key as keyof ServiceFilters] === undefined && delete serviceFilters[key as keyof ServiceFilters]
      );

      let response;

      // Use location-based search if coordinates are available
      if (serviceFilters.latitude && serviceFilters.longitude) {
        response = await apiClient.searchServicesNearLocation(
          serviceFilters.latitude,
          serviceFilters.longitude,
          serviceFilters.radiusKm || 20,
          serviceFilters
        );
      } else {
        response = await apiClient.getServices(serviceFilters);
      }

      if (response.success && response.data) {
        setData(response.data);
      }
    } catch (error) {
      console.error('Failed to load services:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadCategories() {
    try {
      const response = await apiClient.getServiceCategories();
      if (response.success && response.data) {
        setCategories(Array.isArray(response.data) ? response.data : response.data.categories || []);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  }

  // Location handlers - update live
  const handleLocationChange = (newLocation: string | null, coords?: { lat: number; lng: number }) => {
    updateFilter('location', newLocation || '');
    updateFilter('latitude', coords?.lat?.toString() || '');
    updateFilter('longitude', coords?.lng?.toString() || '');
  };

  const handleRadiusChange = (newRadius: number) => {
    updateFilter('radiusKm', newRadius.toString());
  };

  const handleUseCurrentLocation = () => {};

  const handleClearLocation = () => {
    updateFilter('location', '');
    updateFilter('latitude', '');
    updateFilter('longitude', '');
    updateFilter('radiusKm', '20');
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
                value={filters.search || ''}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="pl-9 pr-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* Service Type Dropdown */}
          <div className="min-w-[120px]">
            <select
              value={filters.type || 'all'}
              onChange={(e) => updateFilter('type', e.target.value)}
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
              value={filters.minPrice || ''}
              onChange={(e) => updateFilter('minPrice', e.target.value)}
              className="w-20 text-sm py-2"
            />
            <span className="text-gray-500">-</span>
            <Input
              type="number"
              placeholder={t('max')}
              value={filters.maxPrice || ''}
              onChange={(e) => updateFilter('maxPrice', e.target.value)}
              className="w-20 text-sm py-2"
            />
          </div>

          {/* Location Filter Toggle */}
          <Button
            variant={(filters.location && filters.latitude && filters.longitude) ? "primary" : "outline"}
            size="sm"
            onClick={() => setShowLocationFilter(!showLocationFilter)}
            className="min-w-[120px]"
          >
            <MapPin className="h-4 w-4 mr-1" />
            {(filters.location && filters.latitude && filters.longitude) ? t('locationChecked') : t('location')}
          </Button>

          {/* Clear Filters */}
          {(filters.search || filters.location || filters.type !== 'all' || filters.minPrice || filters.maxPrice || (filters.radiusKm && filters.radiusKm !== '20')) && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
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
              currentLocation={filters.location || ''}
              currentRadius={filters.radiusKm ? parseInt(filters.radiusKm as string, 10) : 20}
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
        {data ? (
          <div className="relative">
            {/* Results with subtle fade while loading */}
            <AnimatePresence mode="wait">
              <motion.div
                key={JSON.stringify({
                  q: filters.search || '',
                  t: filters.type || '',
                  min: filters.minPrice || '',
                  max: filters.maxPrice || '',
                  loc: filters.location || '',
                  r: filters.radiusKm || ''
                })}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className={`transition-opacity duration-200 ${isSearching ? 'opacity-80' : 'opacity-100'}`}
              >
                {!data?.services?.length ? (
                  <div className="text-center py-20">
                    <Wrench className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('noResults')}</h3>
                    <p className="text-gray-600 mb-4">{t('tryAdjusting')}</p>
                    <Button onClick={clearAllFilters}>{t('clear')}</Button>
                  </div>
                ) : (
                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{
                      duration: 0.3,
                      ease: 'easeOut',
                      staggerChildren: 0.08,
                      delayChildren: 0.1
                    }}
                    className="flex justify-center flex-wrap gap-4"
                  >
                    {data.services.map((service, index) => (
                      <motion.div
                        key={service.id}
                        layout
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{
                          duration: 0.4,
                          delay: index * 0.05,
                          ease: [0.25, 0.46, 0.45, 0.94],
                          layout: { duration: 0.3 }
                        }}
                        whileHover={{
                          y: -4,
                          scale: 1.02,
                          transition: { duration: 0.2 }
                        }}
                      >
                        <ServiceCard
                          service={service}
                          formatDuration={formatDuration}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Smooth overlay spinner instead of replacing content */}
            {isSearching && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[1px] z-10 rounded-lg"
              >
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">{t('loading')}</p>
                </div>
              </motion.div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <svg className="w-12 h-12 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-lg font-medium">{t('unableToLoad')}</p>
              <p className="text-sm">{t('pleaseTryLater')}</p>
            </div>
          </div>
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
          <Button variant="link" className="font-semibold p-0 text-gray-900 mb-2 block text-left overflow-hidden">
            <span className="line-clamp-2">
              {service.title}
            </span>
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
