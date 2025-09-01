'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuthStore } from '@/lib/stores/auth';
import { apiClient } from '@/lib/api/client';
import SellerServiceDashboard from '@/components/seller/SellerServiceDashboard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { toast } from 'sonner';

interface ServicesData {
  services: any;
  categories: any[];
}

export default function SellerServicesPage() {
  const { user } = useAuthStore();
  const searchParams = useSearchParams();
  const [data, setData] = useState<ServicesData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Parse search params
  const currentFilters = {
    page: searchParams.get('page') || undefined,
    search: searchParams.get('search') || undefined,
    category: searchParams.get('category') || undefined,
    sortBy: searchParams.get('sortBy') || undefined,
    isMobileService: searchParams.get('isMobileService') || undefined,
  };

  useEffect(() => {
    loadServicesData();
  }, [searchParams]);

  const loadServicesData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const filters = {
        page: currentFilters.page ? parseInt(currentFilters.page) : 1,
        search: currentFilters.search,
        categoryId: currentFilters.category,
        isMobileService: currentFilters.isMobileService === 'true' ? true : currentFilters.isMobileService === 'false' ? false : undefined,
        limit: 20,
      };

      console.log('Current filters from URL:', currentFilters);
      console.log('Processed filters for API:', filters);

      // Remove undefined values
      Object.keys(filters).forEach(key => 
        filters[key as keyof typeof filters] === undefined && delete filters[key as keyof typeof filters]
      );

      console.log('Fetching services with filters:', filters);
      const [servicesResponse, categoriesResponse] = await Promise.all([
        apiClient.getSellerServices(filters),
        apiClient.getCategories(),
      ]);

      console.log('Services response:', servicesResponse);
      console.log('Categories response:', categoriesResponse);

      if (servicesResponse.success && categoriesResponse.success) {
        // Handle both direct array and wrapped in categories property
        const categoriesData = Array.isArray(categoriesResponse.data) 
          ? categoriesResponse.data 
          : (categoriesResponse.data as any)?.categories || [];
        
        // Handle services data - it might be an array directly
        const servicesData = Array.isArray(servicesResponse.data) 
          ? servicesResponse.data 
          : servicesResponse.data;
        
        console.log('Processed services data:', servicesData);
        console.log('Processed categories data:', categoriesData);
        
        setData({
          services: servicesData,
          categories: categoriesData
        });
      } else {
        console.error('Services response error:', servicesResponse.error);
        console.error('Categories response error:', categoriesResponse.error);
        setError(servicesResponse.error?.message || 'Failed to load services data');
      }
    } catch (error: any) {
      console.error('Error fetching seller services data:', error);
      setError('Failed to load services data');
      toast.error('Failed to load services data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
          <ProtectedRoute requiredRole="SELLER">
      <div className="min-h-screen bg-wrench-bg-primary">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="container-responsive py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  Service Management
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage your automotive services, bookings, and customer appointments
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container-responsive py-8">
          {isLoading ? (
            <LoadingSpinner size="lg" text="Loading services dashboard..." />
          ) : error ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Unable to load services dashboard
              </h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button 
                onClick={loadServicesData}
                className="px-4 py-2 bg-wrench-accent text-black rounded-lg hover:bg-wrench-accent-hover transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
                        <SellerServiceDashboard
              services={data?.services || null}
              categories={data?.categories || []}
              currentFilters={currentFilters}
              onServicesUpdate={setData}
            />
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}