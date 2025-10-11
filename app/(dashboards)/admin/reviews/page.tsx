'use client';

import React from 'react';
import { useAuthStore } from '@/lib/stores/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { 
  Star, 
  MessageSquare, 
  Clock, 
  User, 
  Package,
  Construction
} from 'lucide-react';

export default function AdminReviewsPage() {
  const { isLoading, isAuthenticated } = useAuthStore();
  const pathname = usePathname();
  const currentLocale = pathname?.split('/').filter(Boolean)[0] === 'ar' ? 'ar' : 'en';
  const t = useTranslations('adminReviews');

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wrench-accent"></div>
          <p className="text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('reviewManagement')}</h1>
          <p className="text-gray-600">{t('monitorAndManagePlatformReviewsAndRatings')}</p>
        </div>
      </div>

      {/* Coming Soon Message */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-8">
          <div className="text-center">
            <Construction className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-yellow-800 mb-2">{t('comingSoon')}</h2>
            <p className="text-yellow-700 mb-6 max-w-md mx-auto">
              {t('reviewManagementSystemUnderDevelopment')}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 max-w-2xl mx-auto">
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                <Star className="h-5 w-5 text-yellow-600" />
                <span className="text-sm text-gray-700">{t('monitorAllPlatformReviews')}</span>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                <span className="text-sm text-gray-700">{t('moderateInappropriateContent')}</span>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                <User className="h-5 w-5 text-green-600" />
                <span className="text-sm text-gray-700">{t('trackReviewAnalytics')}</span>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                <Package className="h-5 w-5 text-purple-600" />
                <span className="text-sm text-gray-700">{t('manageReviewPolicies')}</span>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-yellow-600">
                <strong>{t('expectedFeatures')}:</strong>
              </p>
              <ul className="text-sm text-yellow-600 space-y-1">
                <li>• {t('viewAllProductAndServiceReviews')}</li>
                <li>• {t('filterReviewsByRatingDateAndContent')}</li>
                <li>• {t('flagAndRemoveInappropriateReviews')}</li>
                <li>• {t('reviewAnalyticsAndReporting')}</li>
                <li>• {t('automatedReviewModeration')}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Placeholder Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('totalReviews')}</p>
                <p className="text-2xl font-bold text-gray-900">--</p>
                <p className="text-sm text-gray-500">{t('comingSoon')}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('averageRating')}</p>
                <p className="text-2xl font-bold text-gray-900">--</p>
                <p className="text-sm text-gray-500">{t('comingSoon')}</p>
              </div>
              <Star className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('pendingModeration')}</p>
                <p className="text-2xl font-bold text-gray-900">--</p>
                <p className="text-sm text-gray-500">{t('comingSoon')}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('flaggedReviews')}</p>
                <p className="text-2xl font-bold text-gray-900">--</p>
                <p className="text-sm text-gray-500">{t('comingSoon')}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            {t('recentReviews')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">{t('reviewManagementSystemComingSoon')}</p>
            <p className="text-sm text-gray-400">
              {t('thisSectionWillDisplayRecentReviewsModerationQueueAndReviewAnalytics')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
