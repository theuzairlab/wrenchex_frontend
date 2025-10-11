'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth';
import { apiClient } from '@/lib/api/client'; 
import { SellerProfileForm } from '@/components/seller/SellerProfileForm';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { SocialAccountManager } from '@/components/auth/SocialAccountManager';
import { EmailVerificationBanner } from '@/components/auth/EmailVerificationBanner';
import { useTranslations } from 'next-intl';

export default function SellerProfilePage() {
  const pathname = usePathname();
  const currentLocale = pathname?.split('/').filter(Boolean)[0] === 'ar' ? 'ar' : 'en';
  const t = useTranslations('sellerProfile');
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
      console.log('Profile data fields:', profileResponse.data ? Object.keys(profileResponse.data) : 'No data');
      
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
        setError(profileResponse.error?.message || t('failedToLoadProfileData'));
      }
    } catch (err: any) {
      console.error('Profile error:', err);
      setError(err.message || t('failedToLoadProfileData'));
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
        alert(t('profileUpdatedSuccessfully'));
      } else {
        alert(t('failedToUpdateProfile') + ': ' + (response.error?.message || t('unknownError')));
      }
    } catch (err: any) {
      alert(t('failedToUpdateProfile') + ': ' + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isAuthenticated || user?.role !== 'SELLER') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('accessDenied')}</h1>
          <p className="text-gray-600">{t('mustBeSellerToAccess')}</p>
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
            <p className="text-lg font-medium">{t('errorLoadingProfile')}</p>
            <p className="text-sm text-gray-600">{error}</p>
          </div>
          <button 
            onClick={fetchProfile}
            className="bg-wrench-orange-500 text-white px-4 py-2 rounded-lg hover:bg-wrench-orange-600"
          >
            {t('tryAgain')}
          </button>
        </div>
    );
  }

  if (!profileData) {
    return (
        <div className="text-center py-12">
          <p className="text-gray-600">{t('noProfileDataAvailable')}</p>
        </div>
    );
  }

  return (
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t('profileSettings')}
          </h1>
          <p className="mt-2 text-gray-600">
            {t('manageSellerProfileDescription')}
          </p>
        </div>

        {/* Email Verification Banner */}
        <EmailVerificationBanner />

        {/* Social Account Management */}
        <SocialAccountManager />

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