import { Metadata } from 'next';
import { Suspense } from 'react';
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

// SEO Metadata generation
export async function generateMetadata({ searchParams }: ProductsPageProps): Promise<Metadata> {
  const params = await searchParams;
  const category = params.category;
  const search = params.search;

  let title = 'Auto Parts & Accessories | WrenchEX Marketplace';
  let description = 'Browse thousands of genuine auto parts and accessories from verified sellers. Find OEM and aftermarket parts for all car makes and models with fast delivery.';

  if (search) {
    title = `"${search}" - Auto Parts Search | WrenchEX`;
    description = `Search results for "${search}". Find the best auto parts and accessories from verified sellers.`;
  } else if (category) {
    title = `Auto Parts in ${category} | WrenchEX Marketplace`;
    description = `Browse ${category} auto parts and accessories from verified sellers with fast delivery.`;
  }

  return {
    title,
    description,
    keywords: 'auto parts, car parts, automotive accessories, brake pads, oil filters, spark plugs, genuine parts, aftermarket parts',
    openGraph: {
      title,
      description,
      type: 'website',
      url: 'https://wrenchex.com/products',
    },
  };
}

// ISR Configuration for product catalog
export const revalidate = 300; // Revalidate every 5 minutes

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { products, categories } = await getProductsData(searchParams);
  const params = await searchParams;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Auto Parts & Accessories
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Browse thousands of genuine auto parts from verified sellers. 
              Find OEM and aftermarket parts for all makes and models.
            </p>
            {products && (
              <div className="text-sm text-gray-500 mt-4">
                Showing {products.products?.length || 0} of {(products?.pagination?.total || 0).toLocaleString()} products
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Filters */}
          <div className="lg:w-64 flex-shrink-0">
            <Suspense fallback={<LoadingSpinner />}>
              <ProductFilters
                categories={categories || []}
                currentFilters={params}
                totalProducts={products?.pagination?.total || 0}
                availableFilters={{
                  categories: (categories || []).map(cat => ({ id: cat.id, name: cat.name, count: 0 })),
                  brands: [],
                  priceRange: { min: 0, max: 10000 },
                  conditions: []
                }}
              />
            </Suspense>
          </div>

          {/* Products Catalog */}
          <div className="flex-1">
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