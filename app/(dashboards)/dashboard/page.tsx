'use client';
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useUser, useUserRole } from '@/lib/stores/auth';
import { useAuthStore } from '@/lib/stores/auth';
import { apiClient } from '@/lib/api/client';
import { formatPrice } from '@/lib/utils';
import { BuyerDashboard } from '@/components/dashboards/BuyerDashboard';
import { ShopDashboard } from '@/components/dashboards/ShopDashboard';
import { AdminDashboard } from '@/components/dashboards/AdminDashboard';

// Utility function for date formatting
const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Utility function for currency formatting
const formatCurrency = formatPrice;

interface SellerDashboardData {
  seller: {
    shopName: string;
    ratingAverage: number;
    ratingCount: number;
  };
  stats: {
    totalProducts: number;
    totalOrders: number;
    totalServices: number;
    totalAppointments: number;
    monthlyEarnings: number;
  };
  recentOrders: {
    id: string;
    totalAmount: number;
    status: string;
  }[];
  recentAppointments: {
    id: string;
    service: {
      title: string;
    };
    scheduledTimeStart: string;
    status: string;
  }[];
}






export default function DashboardPage() {
  const role = useUserRole();
  const user = useUser();
  const { isLoading, isAuthenticated } = useAuthStore();

  const [dashboardData, setDashboardData] = useState<SellerDashboardData | null>(null);
  const [Loading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sellerProfile, setSellerProfile] = useState<any>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Only fetch seller dashboard data for seller role
        if (role === 'SELLER') {
          try {
            const response = await apiClient.getSellerDashboard();
            
            if (response.success && response.data) {
              setDashboardData(response.data);
            } else {
              setError(response.error?.message || 'Failed to load dashboard data');
              
              // If dashboard fails, try to get seller profile for pending approval case
              if (response.error?.message?.toLowerCase().includes('pending approval') || 
                  response.error?.message?.toLowerCase().includes('not approved')) {
                try {
                  const profileResponse = await apiClient.getSellerProfile();
                  if (profileResponse.success && profileResponse.data) {
                    setSellerProfile(profileResponse.data);
                  }
                } catch (profileErr) {
                  console.log('Could not fetch seller profile:', profileErr);
                  // If profile also fails, we'll show the pending approval with just user data
                  setSellerProfile(null);
                }
              }
            }
          } catch (err: any) {
            setError(err.message || 'Failed to load dashboard data');
            
                          // Try to get seller profile for pending approval case
              if (err.message?.toLowerCase().includes('pending approval') || 
                  err.message?.toLowerCase().includes('not approved')) {
                try {
                  const profileResponse = await apiClient.getSellerProfile();
                  if (profileResponse.success && profileResponse.data) {
                    setSellerProfile(profileResponse.data);
                  }
                } catch (profileErr) {
                  console.log('Could not fetch seller profile:', profileErr);
                  // If profile also fails, we'll show the pending approval with just user data
                  setSellerProfile(null);
                }
              }
          }
        } else {
          // For other roles, we don't need seller dashboard data
          setDashboardData(null);
        }
      } catch (err: any) {
        console.error('Dashboard error:', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch data if user is authenticated and role is determined
    if (isAuthenticated && role) {
      fetchDashboardData();
    } else {
      setIsLoading(false);
    }
  }, [role, isAuthenticated]);

  // Debug logging
  console.log('Dashboard Debug:', { 
    user, 
    role, 
    isLoading, 
    isAuthenticated,
    userRole: user?.role,
    userName: user?.firstName 
  });

  // Show loading state while user data is being fetched
  if (isLoading || !isAuthenticated) {
    return (
      <DashboardLayout title="Loading..." description="Please wait...">
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wrench-accent"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show error state if user data is missing
  if (!user) {
    return (
      <DashboardLayout title="Error" description="Unable to load user data">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Unable to load user information</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-wrench-accent text-black rounded-lg hover:bg-wrench-accent-hover"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const getDashboardContent = () => {
    
    console.log('Switching dashboard for role:', role, 'from user:', user?.role);
    
    // Use user.role directly as fallback if role hook is undefined
    const currentRole = role || user?.role;
    
    switch (currentRole) {
      case 'BUYER':
        console.log('Rendering Buyer Dashboard');
        return <BuyerDashboard User={useUser} />;
      case 'SELLER':
        console.log('Rendering Seller Dashboard');
        return <ShopDashboard 
                  User={useUser} 
                  Loading={Loading} 
                  dashboardData={dashboardData} 
                  error={error} 
                  formatDateTime={formatDateTime} 
                  formatCurrency={formatCurrency}
                  sellerProfile={sellerProfile}
                />;
      case 'ADMIN':
        console.log('Rendering Admin Dashboard');
        return <AdminDashboard 
                  User={useUser} 
                />;
      default:
        console.log('Rendering Default (Buyer) Dashboard for role:', currentRole);
        return <BuyerDashboard User={useUser} />; // Default fallback
    }
  };

  const getTitle = () => {
    const currentRole = role || user?.role;
    switch (currentRole) {
      case 'BUYER':
        return 'Dashboard';
      case 'SELLER':
        return 'Seller Dashboard';
      case 'ADMIN':
        return 'Admin Dashboard';
      default:
        return 'Dashboard';
    }
  };

  const getDescription = () => {
    const currentRole = role || user?.role;
    switch (currentRole) {
      case 'BUYER':
        return 'Manage your orders, favorites, and account settings';
      case 'SELLER':
        return 'Manage your business, products, and customer relationships';
      case 'ADMIN':
        return 'Oversee platform operations and user management';
      default:
        return 'Welcome to your dashboard';
    }
  };

  return (
    <div>
      {getDashboardContent()}
    </div>
  );
} 