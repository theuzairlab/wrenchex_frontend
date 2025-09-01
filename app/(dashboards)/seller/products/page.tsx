'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api/client';
import SellerProductDashboard from '@/components/seller/SellerProductDashboard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuthStore } from '@/lib/stores/auth';

export default function SellerProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuthStore();
  
  const [products, setProducts] = useState(null);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Extract search parameters
  const params = {
    page: searchParams.get('page') || undefined,
    search: searchParams.get('search') || undefined,
    status: searchParams.get('status') || undefined,
    category: searchParams.get('category') || undefined,
    sortBy: searchParams.get('sortBy') || undefined,
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || !user) {
        setIsLoading(false);
        return;
      }

      if (user.role !== 'SELLER') {
        router.push('/dashboard');
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const filters = {
          page: params.page ? parseInt(params.page) : 1,
          search: params.search,
          status: params.status,
          categoryId: params.category,
          sortBy: params.sortBy as any,
          limit: 20,
        };

        // Remove undefined values
        Object.keys(filters).forEach(key => 
          filters[key as keyof typeof filters] === undefined && delete filters[key as keyof typeof filters]
        );

        const [productsResponse, categoriesResponse] = await Promise.all([
          apiClient.getMyProducts(filters),
          apiClient.getCategories(),
        ]);

        if (productsResponse.success) {
          setProducts(productsResponse.data);
        } else {
          setError(productsResponse.error);
        }

        if (categoriesResponse.success) {
          const categoriesData = Array.isArray(categoriesResponse.data) 
            ? categoriesResponse.data 
            : (categoriesResponse.data.categories || []);
          setCategories(categoriesData);
        }

      } catch (error: any) {
        console.error('Error fetching seller products data:', error);
        setError({ message: 'Failed to load products data' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, user, params.page, params.search, params.status, params.category, params.sortBy, router]);

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
          <div className="container-responsive py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  Product Management
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage your inventory, add new products, and track performance
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Handling */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error loading products
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  {error.message}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="container-responsive">
          {error ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Unable to load product dashboard
              </h3>
              <p className="text-gray-600 mb-4">{error.message}</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            <SellerProductDashboard 
              products={products || null}
              categories={categories || []}
              currentFilters={params}
              onProductsUpdate={setProducts}
            />
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}