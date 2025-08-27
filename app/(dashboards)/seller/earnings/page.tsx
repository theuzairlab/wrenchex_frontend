'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/stores/auth';
import { apiClient } from '@/lib/api/client';
import { SellerEarnings } from '@/types'; 
import { EarningsOverview } from '@/components/seller/EarningsOverview';
import { EarningsBreakdown } from '@/components/seller/EarningsBreakdown';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function SellerEarningsPage() {
  const { user, isAuthenticated } = useAuthStore();
  const [earningsData, setEarningsData] = useState<SellerEarnings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'SELLER') {
      return;
    }

    fetchEarnings();
  }, [isAuthenticated, user]);

  const fetchEarnings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiClient.getSellerEarnings();
      console.log('Earnings response:', response);
      
      if (response.success && response.data) {
        setEarningsData(response.data);
      } else {
        setError(response.error?.message || 'Failed to load earnings data');
      }
    } catch (err: any) {
      console.error('Earnings error:', err);
      setError(err.message || 'Failed to load earnings data');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated || user?.role !== 'SELLER') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need to be logged in as a seller to access this page.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
        <div className="flex items-center justify-center min-h-96">
          <LoadingSpinner />
        </div>
    );
  }

  if (error) {
    return (
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-lg font-medium">Error loading earnings</p>
            <p className="text-sm text-gray-600">{error}</p>
          </div>
          <button 
            onClick={fetchEarnings}
            className="bg-wrench-orange-500 text-white px-4 py-2 rounded-lg hover:bg-wrench-orange-600"
          >
            Try Again
          </button>
        </div>
    );
  }

  return (
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Earnings & Analytics
          </h1>
          <p className="mt-2 text-gray-600">
            Track your revenue, commission, and financial performance.
          </p>
        </div>

        {/* Earnings Overview */}
        <EarningsOverview 
          earnings={earningsData}
          onRefresh={fetchEarnings}
        />

        {/* Earnings Breakdown */}
        <EarningsBreakdown 
          earnings={earningsData}
          onRefresh={fetchEarnings}
        />
      </div>
  );
}