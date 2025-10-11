'use client';

import { Metadata } from 'next';
import { Suspense, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ProductSearchResult, Category } from '@/types';
import ProductCatalog from '@/components/products/ProductCatalog';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { LocationFilter } from '@/components/location/LocationFilter';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, MapPin } from 'lucide-react';

// Define props type for the page
interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
    city?: string;
    area?: string;
    location?: string;
    latitude?: string;
    longitude?: string;
    radiusKm?: string;
    minPrice?: string;
    maxPrice?: string;
    sortBy?: string;
    page?: string;
    limit?: string;
  }>;
}

// Helper function to fetch products data
async function getProductsData(searchParams: any, locale: 'en' | 'ar' = 'en') {
  try {
    const params = await searchParams;
    console.log('Products page params:', params);
    
    const filters = {
      category: params.category, // Backend expects 'category' parameter
      search: params.search,
      city: params.city,
      area: params.area,
      latitude: params.latitude ? parseFloat(params.latitude) : undefined,
      longitude: params.longitude ? parseFloat(params.longitude) : undefined,
      radiusKm: params.radiusKm ? parseFloat(params.radiusKm) : undefined,
      minPrice: params.minPrice ? parseFloat(params.minPrice) : undefined,
      maxPrice: params.maxPrice ? parseFloat(params.maxPrice) : undefined,
      sortBy: params.sortBy || 'newest',
      page: params.page ? parseInt(params.page) : 1,
      limit: params.limit ? parseInt(params.limit) : 12,
      lang: locale, // Add language parameter
    };

    console.log('Fetching products with filters:', filters);

    // Create query parameters for products API
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });
    
    const [productsResponse, categoriesResponse] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?${queryParams.toString()}`, {
        cache: 'no-store', // Don't cache search results
        headers: {
          'Accept-Language': locale,
        },
      }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories?lang=${locale}`, {
        cache: 'no-store', // Changed to no-store for localized content
        headers: {
          'Accept-Language': locale,
        },
      }),
    ]);

    console.log('Products response status:', productsResponse.status);
    console.log('Categories response status:', categoriesResponse.status);

    const productsData = productsResponse.ok ? await productsResponse.json() : { success: false };
    const categoriesData = categoriesResponse.ok ? await categoriesResponse.json() : { success: false };

    console.log('Products API response:', productsData);
    console.log('Categories API response:', categoriesData);

    const products = productsData.success ? productsData.data : null;
    const categories = categoriesData.success 
      ? (Array.isArray(categoriesData.data) ? categoriesData.data : (categoriesData.data.categories || []))
      : [];

    // Log products to check if inactive ones are being returned
    if (products && products.products) {
      console.log('Products received:', products.products.length);
      const inactiveProducts = products.products.filter((p: any) => !p.isActive);
      if (inactiveProducts.length > 0) {
        console.warn('Found inactive products in response:', inactiveProducts);
      }
    }

    return { products, categories: categories || [] };
  } catch (error) {
    console.error('Error fetching products:', error);
    return { 
      products: null, 
      categories: [] as Category[]
    };
  }
}



export default function ProductsPage({ searchParams }: ProductsPageProps) {
  const t = useTranslations('common.products');
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = pathname?.split('/').filter(Boolean)[0] === 'ar' ? 'ar' : 'en';
  const [products, setProducts] = useState<ProductSearchResult | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [params, setParams] = useState<any>(null);
  
  // Location state (like services page)
  const [location, setLocation] = useState('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [radiusKm, setRadiusKm] = useState(10);
  const [showLocationFilter, setShowLocationFilter] = useState(false);
  
  // Filter state (like services page)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Initialize all state from URL parameters (like services page)
  useEffect(() => {
    const initializeFromParams = async () => {
      const resolvedParams = await searchParams;
      
      // Initialize all filter state from URL
      if (resolvedParams.search) setSearchQuery(resolvedParams.search);
      if (resolvedParams.category) setSelectedCategory(resolvedParams.category);
      if (resolvedParams.minPrice) setMinPrice(resolvedParams.minPrice);
      if (resolvedParams.maxPrice) setMaxPrice(resolvedParams.maxPrice);
      if (resolvedParams.location) setLocation(resolvedParams.location);
      
      const lat = resolvedParams.latitude;
      const lng = resolvedParams.longitude;
      const radius = resolvedParams.radiusKm;
      
      if (lat && lng) {
        setCoordinates({
          lat: parseFloat(lat),
          lng: parseFloat(lng)
        });
      }
      if (radius) {
        setRadiusKm(parseFloat(radius));
      }
    };
    
    initializeFromParams();
  }, [searchParams]);

  useEffect(() => {
    loadData();
  }, [searchParams, coordinates, radiusKm, searchQuery, selectedCategory, minPrice, maxPrice, currentLocale]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const resolvedParams = await searchParams;
      console.log('🔍 Products page - URL params:', resolvedParams);
      setParams(resolvedParams);
      
      // Create modified searchParams with current state (like services page)
      const modifiedSearchParams = {
        ...resolvedParams,
        search: searchQuery || undefined,
        category: selectedCategory || undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        location: location || undefined,
        latitude: coordinates?.lat?.toString(),
        longitude: coordinates?.lng?.toString(),
        radiusKm: radiusKm.toString()
      };
      
      const data = await getProductsData(modifiedSearchParams, currentLocale);
      console.log('📦 Products page - API response:', data);
      setProducts(data.products);
      setCategories(data.categories);
    } catch (error) {
      console.error('Failed to load products data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Location handlers (like services page)
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
    setRadiusKm(10);
  };

  // Apply filters (no page refresh)
  const applyFilters = () => {
    // Just trigger data reload - no router navigation
    loadData();
  };

  // Clear all filters (no page refresh)
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setLocation('');
    setCoordinates(null);
    setRadiusKm(10);
    setShowLocationFilter(false);
    // Trigger data reload after clearing
    setTimeout(() => loadData(), 0);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-wrench-bg-primary">
      {/* Hero Section */}
      <div 
        className="relative bg-cover bg-center bg-no-repeat text-white"
        style={{
          backgroundImage: 'url(/car-service.webp)',
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8">

        {/* Filters Section - Exactly like services page */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            {/* Main Filters Row */}
            <div className="flex flex-wrap items-center gap-3">
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


              {/* Category Dropdown */}
              <div className="min-w-[120px]">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-wrench-accent"
                >
                  <option value="">{t('allCategories')}</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
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

              {/* Location Filter Toggle (like services page) */}
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
              {(searchQuery || location || selectedCategory || minPrice || maxPrice || radiusKm !== 10) && (
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
        </div>

        {/* Products Catalog */}
        <div>
          <Suspense fallback={<LoadingSpinner />}>
            {products ? (
              <ProductCatalog 
                searchResult={products}
                currentFilters={params}
              />
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
          </Suspense>
        </div>
      </div>
    </div>
  );
}