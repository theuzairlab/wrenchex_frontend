'use client';

import { Metadata } from 'next';
import { Suspense, useState, useEffect } from 'react';
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
              Auto Parts & Accessories
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Browse thousands of genuine auto parts from verified sellers. 
              Find OEM and aftermarket parts for all makes and models.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8">

        {/* Top Filters Section */}
        <div className="mb-8">
          <Suspense fallback={<LoadingSpinner />}>
            <ProductFilters
              categories={categories || []}
              currentFilters={params}
              totalProducts={products?.pagination?.total || 0}
              availableFilters={{
                categories: (categories || []).map((cat: any) => ({ id: cat.id, name: cat.name, count: 0 })),
                priceRange: { min: 0, max: 10000 },
                conditions: []
              }}
            />
          </Suspense>
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
                  <p className="text-lg font-medium">Unable to load products</p>
                  <p className="text-sm">Please try again later</p>
                </div>
              </div>
            )}
          </Suspense>
        </div>
      </div>
    </div>
  );
}