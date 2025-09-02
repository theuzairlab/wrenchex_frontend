'use client';

import { Metadata } from 'next';
import { Suspense, useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';
import { ProductSearchResult, Category } from '@/types';
import ProductCatalog from '@/components/products/ProductCatalog';
import ProductFilters from '@/components/products/ProductFilters';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Define props type for the page
interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
    minPrice?: string;
    maxPrice?: string;
    sortBy?: string;
    page?: string;
    limit?: string;
  }>;
}

// Helper function to fetch products data
async function getProductsData(searchParams: any) {
  try {
    const params = await searchParams;
    console.log('Products page params:', params);
    
    const filters = {
      category: params.category, // Backend expects 'category' parameter
      search: params.search,
      minPrice: params.minPrice ? parseFloat(params.minPrice) : undefined,
      maxPrice: params.maxPrice ? parseFloat(params.maxPrice) : undefined,
      sortBy: params.sortBy || 'newest',
      page: params.page ? parseInt(params.page) : 1,
      limit: params.limit ? parseInt(params.limit) : 12,
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
      }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
        cache: 'force-cache',
        next: { revalidate: 3600 },
      }),
    ]);

    console.log('Products response status:', productsResponse.status);
    console.log('Categories response status:', categoriesResponse.status);

    const productsData = productsResponse.ok ? await productsResponse.json() : { success: false };
    const categoriesData = categoriesResponse.ok ? await categoriesResponse.json() : { success: false };

    const products = productsData.success ? productsData.data : null;
    const categories = categoriesData.success 
      ? (Array.isArray(categoriesData.data) ? categoriesData.data : (categoriesData.data.categories || []))
      : [];

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
  const [products, setProducts] = useState<ProductSearchResult | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [params, setParams] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const resolvedParams = await searchParams;
        setParams(resolvedParams);
        const data = await getProductsData(searchParams);
        setProducts(data.products);
        setCategories(data.categories);
      } catch (error) {
        console.error('Failed to load products data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Auto Parts & Accessories
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              Browse thousands of genuine auto parts from verified sellers. 
              Find OEM and aftermarket parts for all makes and models.
            </p>
            {products && (
              <div className="text-sm text-gray-500 mt-3 sm:mt-4 px-4">
                Showing {products.products?.length || 0} of {(products?.pagination?.total || 0).toLocaleString()} products
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Mobile Filter Toggle Button */}
          <div className="lg:hidden mb-4">
            <button className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                </svg>
                <span className="font-medium text-gray-900">Show Filters</span>
                <span className="text-sm text-gray-500">({Object.keys(params).filter(key => params[key as keyof typeof params]).length} active)</span>
              </div>
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Sidebar - Filters */}
          <div className="lg:w-64 flex-shrink-0 order-2 lg:order-1">
            <Suspense fallback={<LoadingSpinner />}>
              <ProductFilters
                categories={categories || []}
                currentFilters={params}
                totalProducts={products?.pagination?.total || 0}
                availableFilters={{
                  categories: (categories || []).map((cat: any) => ({ id: cat.id, name: cat.name, count: 0 })),
                  brands: [],
                  priceRange: { min: 0, max: 10000 },
                  conditions: []
                }}
              />
            </Suspense>
          </div>

          {/* Products Catalog */}
          <div className="flex-1 order-1 lg:order-2">
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
                    <p className="text-lg font-medium">Unable to load products</p>
                    <p className="text-sm">Please try again later</p>
                  </div>
                </div>
              )}
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}