'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useUserRole } from '@/lib/stores/auth';
import { useAuthStore } from '@/lib/stores/auth';
import { apiClient } from '@/lib/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { 
  Users, 
  Store, 
  Package, 
  Calendar, 
  MessageSquare, 
  TrendingUp, 
  Activity,
  RefreshCw,
  BarChart3,
  PieChart
} from 'lucide-react';

interface PlatformStats {
  users: { total: number };
  sellers: { total: number };
  products: { total: number };
  services: { total: number };
  appointments: { total: number };
  chats: { 
    total: number;
    active: number;
  };
}

export default function AdminAnalyticsPage() {
  const role = useUserRole();
  // const user = useUser();
  const { isLoading, isAuthenticated } = useAuthStore();
  const pathname = usePathname();
  const currentLocale = pathname?.split('/').filter(Boolean)[0] === 'ar' ? 'ar' : 'en';
  const t = useTranslations('adminAnalytics');

  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && role === 'ADMIN') {
      fetchStats();
    }
  }, [isAuthenticated, role]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.getAdminStats();
      
      if (response.success && response.data) {
        setStats(response.data.stats);
      } else {
        setError(response.error?.message || t('fetchPlatformStatisticsFailed'));
      }
    } catch (err: any) {
      console.error('Error fetching stats:', err);
      setError(err.message || t('fetchPlatformStatisticsFailed'));
    } finally {
      setLoading(false);
    }
  };

  // const getGrowthPercentage = (current: number, previous: number) => {
  //   if (previous === 0) return current > 0 ? 100 : 0;
  //   return ((current - previous) / previous) * 100;
  // };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // Show loading state while user data is being fetched
  if (isLoading || !isAuthenticated) {
    return (
      <DashboardLayout title={t('loading')} description={t('pleaseWait')}>
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wrench-accent"></div>
            <p className="text-gray-600">{t('loading')}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('platformAnalytics')}</h1>
            <p className="text-gray-600">{t('realTimeInsightsDescription')}</p>
          </div>
          <Button 
            onClick={fetchStats} 
            variant="outline" 
            leftIcon={<RefreshCw className="h-4 w-4" />}
            disabled={loading}
          >
            {t('refreshData')}
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('totalUsers')}</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats ? formatNumber(stats.users.total) : '...'}
                  </p>
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    {t('growthThisMonth')}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('activeSellers')}</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats ? formatNumber(stats.sellers.total) : '...'}
                  </p>
                  <p className="text-sm text-blue-600 flex items-center gap-1">
                    <Activity className="h-4 w-4" />
                    {stats ? t('percentageOfUsers', { percentage: Math.round((stats.sellers.total / Math.max(stats.users.total, 1)) * 100) }) : t('zeroPercentageOfUsers')}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Store className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('totalProducts')}</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats ? formatNumber(stats.products.total) : '...'}
                  </p>
                  <p className="text-sm text-purple-600 flex items-center gap-1">
                    <Package className="h-4 w-4" />
                    {stats ? t('perSeller', { count: Math.round(stats.products.total / Math.max(stats.sellers.total, 1)) }) : t('zeroPerSeller')}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Package className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('totalServices')}</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats ? formatNumber(stats.services.total) : '...'}
                  </p>
                  <p className="text-sm text-orange-600 flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {stats ? t('perSeller', { count: Math.round(stats.services.total / Math.max(stats.sellers.total, 1)) }) : t('zeroPerSeller')}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Calendar className="h-8 w-8 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('totalAppointments')}</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats ? formatNumber(stats.appointments.total) : '...'}
                  </p>
                  <p className="text-sm text-indigo-600 flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {stats ? t('perService', { count: Math.round(stats.appointments.total / Math.max(stats.services.total, 1)) }) : t('zeroPerService')}
                  </p>
                </div>
                <div className="p-3 bg-indigo-100 rounded-full">
                  <Calendar className="h-8 w-8 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('activeChats')}</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats ? formatNumber(stats.chats.active) : '...'}
                  </p>
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    {stats ? t('percentageOfTotal', { percentage: Math.round((stats.chats.active / Math.max(stats.chats.total, 1)) * 100) }) : t('zeroPercentageOfTotal')}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <MessageSquare className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Growth Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                {t('userGrowthTrends')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>{t('chartVisualizationComingSoon')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Platform Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                {t('platformDistribution')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{t('buyers')}</span>
                  <span className="font-medium">
                    {stats ? Math.round((stats.users.total - stats.sellers.total) / Math.max(stats.users.total, 1) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ 
                      width: `${stats ? Math.round((stats.users.total - stats.sellers.total) / Math.max(stats.users.total, 1) * 100) : 0}%` 
                    }}
                  ></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{t('sellers')}</span>
                  <span className="font-medium">
                    {stats ? Math.round(stats.sellers.total / Math.max(stats.users.total, 1) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ 
                      width: `${stats ? Math.round(stats.sellers.total / Math.max(stats.users.total, 1) * 100) : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              {t('activityOverview')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {stats ? formatNumber(stats.chats.total) : '...'}
                </div>
                <div className="text-sm text-blue-600">{t('totalConversations')}</div>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {stats ? formatNumber(stats.chats.active) : '...'}
                </div>
                <div className="text-sm text-green-600">{t('activeChats')}</div>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {stats ? formatNumber(stats.products.total + stats.services.total) : '...'}
                </div>
                <div className="text-sm text-purple-600">{t('totalListings')}</div>
              </div>
              
              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {stats ? formatNumber(stats.appointments.total) : '...'}
                </div>
                <div className="text-sm text-orange-600">{t('totalBookings')}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={fetchStats} variant="outline">
                  {t('tryAgain')}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
  );
}
