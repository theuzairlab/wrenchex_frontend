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
import { Search, MapPin, X } from 'lucide-react';
import { useLiveSearch } from '@/hooks/useLiveSearch';
import { apiClient } from '@/lib/api/client';
import { AnimatePresence, motion } from 'framer-motion';

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
  const pathname = usePathname();
  const currentLocale = pathname?.split('/').filter(Boolean)[0] === 'ar' ? 'ar' : 'en';
  
  const [products, setProducts] = useState<ProductSearchResult | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showLocationFilter, setShowLocationFilter] = useState(false);

  // Live search hook - auto-updates on filter changes
  const { filters, updateFilter, clearFilters: clearAllFilters, isSearching } = useLiveSearch({
    debounceMs: 500,
    onSearch: loadProducts
  });

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, [currentLocale]);

  // Initialize filters from URL on mount
  useEffect(() => {
    const initFromURL = async () => {
      const params = await searchParams;
      const initialFilters: Record<string, any> = {};
      
      if (params.search) initialFilters.search = params.search;
      if (params.category) initialFilters.category = params.category;
      if (params.minPrice) initialFilters.minPrice = params.minPrice;
      if (params.maxPrice) initialFilters.maxPrice = params.maxPrice;
      if (params.latitude) initialFilters.latitude = params.latitude;
      if (params.longitude) initialFilters.longitude = params.longitude;
      if (params.radiusKm) initialFilters.radiusKm = params.radiusKm;
      if (params.location) initialFilters.location = params.location;
      
      // Set initial filters (won't trigger search due to isInitialMount flag in hook)
      Object.entries(initialFilters).forEach(([key, value]) => {
        updateFilter(key, value);
      });

      // Load initial data
      if (Object.keys(initialFilters).length > 0 || !params.search) {
        await loadProducts(initialFilters);
      }
    };
    
    initFromURL();
  }, []);

  async function loadCategories() {
    try {
      const response = await apiClient.getCategories();
      if (response.success && response.data) {
        const list: Category[] = Array.isArray(response.data)
          ? (response.data as Category[])
          : ((response.data as any).categories as Category[]) || [];
        setCategories(list || []);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  }

  async function loadProducts(currentFilters: Record<string, any>) {
    try {
      // Avoid redundant calls when nothing changed (hook already guards, this is extra safety)
      setIsLoading(true);
      const response = await apiClient.getProducts({
        ...currentFilters,
        page: 1,
        limit: 12
      });
      
      if (response.success && response.data) {
        setProducts(response.data);
      }
    } catch (error) {
      // do not spam console; API client already logs
    } finally {
      setIsLoading(false);
    }
  }

  // Location handlers update drafts only; apply via Apply button
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
    updateFilter('radiusKm', '10');
  };

  // Apply filters (no page refresh)
  const applyFilters = () => {
    // No-op: live search updates automatically
  };

  // Clear all filters (no page refresh)
  const clearFilters = () => {
    // Use live search clear
    clearAllFilters();
  };

  // Keep the filter UI visible while loading; show spinner only in catalog area

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
                  value={filters.search || ''}
                  onChange={(e) => updateFilter('search', e.target.value)}
                    className="pl-9 pr-3 py-2 text-sm"
                  />
                </div>
              </div>


              {/* Category Dropdown */}
              <div className="min-w-[120px]">
                <select
                  value={filters.category || ''}
                  onChange={(e) => updateFilter('category', e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-wrench-accent"
                >
                  <option value="">{t('allCategories')}</option>
                  {(categories as Category[]).map((category) => (
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

              {/* Location Filter Toggle (like services page) */}
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
              {(filters.search || filters.location || filters.category || filters.minPrice || filters.maxPrice || (filters.radiusKm && filters.radiusKm !== '10')) && (
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
                  currentRadius={filters.radiusKm ? parseInt(filters.radiusKm as string, 10) : 10}
                  onLocationChange={(loc, coords) => {
                    updateFilter('location', loc || '');
                    updateFilter('latitude', coords?.lat?.toString() || '');
                    updateFilter('longitude', coords?.lng?.toString() || '');
                  }}
                  onRadiusChange={(r) => updateFilter('radiusKm', r.toString())}
                  onUseCurrentLocation={() => {}}
                  onClearLocation={() => {
                    updateFilter('location', '');
                    updateFilter('latitude', '');
                    updateFilter('longitude', '');
                    updateFilter('radiusKm', '10');
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Products Catalog */}
        <div>
          <Suspense fallback={<LoadingSpinner />}>
            {products ? (
              <div className="relative">
                {/* Results with subtle fade while loading */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={JSON.stringify({
                      q: filters.search || '',
                      c: filters.category || '',
                      min: filters.minPrice || '',
                      max: filters.maxPrice || '',
                      loc: filters.location || '',
                      r: filters.radiusKm || ''
                    })}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className={`transition-opacity duration-200 ${isLoading ? 'opacity-80' : 'opacity-100'}`}
                  >
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
                    >
                      <ProductCatalog 
                        searchResult={products}
                        currentFilters={filters}
                      />
                    </motion.div>
                  </motion.div>
                </AnimatePresence>

                {/* Smooth overlay spinner instead of replacing content */}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex items-center justify-center"
                  >
                    <LoadingSpinner />
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
          </Suspense>
        </div>
      </div>
    </div>
  );
}