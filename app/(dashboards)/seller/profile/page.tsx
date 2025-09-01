'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/stores/auth';
import { apiClient } from '@/lib/api/client'; 
import { SellerProfileForm } from '@/components/seller/SellerProfileForm';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function SellerProfilePage() {
  const { user, isAuthenticated } = useAuthStore();
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'SELLER') {
      return;
    }

    fetchProfile();
  }, [isAuthenticated, user]);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get profile data for personal and shop information
      const profileResponse = await apiClient.getSellerProfile();
      console.log('Profile response:', profileResponse);
      
      if (profileResponse.success && profileResponse.data) {
        // Get dashboard data only for chat count stats
        try {
          const dashboardResponse = await apiClient.getSellerDashboard();
          if (dashboardResponse.success && dashboardResponse.data) {
            // Merge profile data with chat count from dashboard
            const mergedData = {
              ...profileResponse.data,
              chatCount: dashboardResponse.data.stats.chats || 0
            };
            setProfileData(mergedData);
          } else {
            // If dashboard fails, still show profile data with 0 chat count
            setProfileData({
              ...profileResponse.data,
              chatCount: 0
            });
          }
        } catch (dashboardErr) {
          console.warn('Dashboard fetch failed, using profile data only:', dashboardErr);
          // If dashboard fails, still show profile data with 0 chat count
          setProfileData({
            ...profileResponse.data,
            chatCount: 0
          });
        }
      } else {
        setError(profileResponse.error?.message || 'Failed to load profile data');
      }
    } catch (err: any) {
      console.error('Profile error:', err);
      setError(err.message || 'Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = async (updatedData: any) => {
    try {
      setIsUpdating(true);
      setError(null);
      
      const response = await apiClient.updateSellerProfile(updatedData);
      
      if (response.success && response.data) {
        setProfileData(response.data);
        alert('Profile updated successfully!');
      } else {
        alert('Failed to update profile: ' + (response.error?.message || 'Unknown error'));
      }
    } catch (err: any) {
      alert('Failed to update profile: ' + err.message);
    } finally {
      setIsUpdating(false);
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
            <p className="text-lg font-medium">Error loading profile</p>
            <p className="text-sm text-gray-600">{error}</p>
          </div>
          <button 
            onClick={fetchProfile}
            className="bg-wrench-orange-500 text-white px-4 py-2 rounded-lg hover:bg-wrench-orange-600"
          >
            Try Again
          </button>
        </div>
    );
  }

  if (!profileData) {
    return (
        <div className="text-center py-12">
          <p className="text-gray-600">No profile data available</p>
        </div>
    );
  }

  return (
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Profile Settings
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your seller profile and business information.
          </p>
        </div>

        {/* Profile Form */}
        <SellerProfileForm
          profile={profileData}
          isUpdating={isUpdating}
          onUpdate={handleProfileUpdate}
          onRefresh={fetchProfile}
        />
      </div>
  );
}