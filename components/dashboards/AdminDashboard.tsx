'use client';

import React, { useState, useEffect } from 'react';
import { Activity, BarChart3, MessageSquare, Package, Users, Store, Calendar } from "lucide-react";
import { Button } from "../ui/Button";
import { Card, CardContent } from "../ui/Card";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { apiClient } from '@/lib/api/client';

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

// Admin Dashboard Content
export function AdminDashboard({ User }: { User: any}) {
  const user = User();
  const pathname = usePathname();
  const currentLocale = pathname?.split('/').filter(Boolean)[0] === 'ar' ? 'ar' : 'en';
  const t = useTranslations('adminDashboard');
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

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

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-6 border border-red-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t('adminDashboard')} 🛡️
        </h2>
        <p className="text-gray-600 mb-4">
          {t('monitorPlatformPerformanceDescription')}
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href={`/${currentLocale}/admin/analytics`}>
            <Button variant="primary" leftIcon={<BarChart3 className="h-4 w-4" />}>
              {t('platformAnalytics')}
            </Button>
          </Link>
          <Link href={`/${currentLocale}/admin/users`}>
            <Button variant="secondary" leftIcon={<Users className="h-4 w-4" />}>
              {t('manageUsers')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Platform Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('totalUsers')}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : stats ? formatNumber(stats.users.total) : '0'}
                </p>
                <p className="text-sm text-green-600">{t('growthThisMonth')}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('activeSellers')}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : stats ? formatNumber(stats.sellers.total) : '0'}
                </p>
                <p className="text-sm text-blue-600">
                  {loading ? '...' : stats ? t('percentageOfUsers', { percentage: Math.round((stats.sellers.total / Math.max(stats.users.total, 1)) * 100) }) : t('zeroPercentageOfUsers')}
                </p>
              </div>
              <Store className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('totalListings')}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : stats ? formatNumber(stats.products.total + stats.services.total) : '0'}
                </p>
                <p className="text-sm text-purple-600">
                  {loading ? '...' : stats ? t('productsAndServices', { products: stats.products.total, services: stats.services.total }) : t('zeroProductsAndServices')}
                </p>
              </div>
              <Package className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('activeChats')}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : stats ? formatNumber(stats.chats.active) : '0'}
                </p>
                <p className="text-sm text-green-600">
                  {loading ? '...' : stats ? t('percentageOfTotal', { percentage: Math.round((stats.chats.active / Math.max(stats.chats.total, 1)) * 100) }) : t('zeroPercentageOfTotal')}
                </p>
              </div>
              <MessageSquare className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <Users className="h-12 w-12 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">{t('userManagement')}</h3>
            <p className="text-sm text-gray-600 mb-4">{t('manageUsersSellersAndPermissions')}</p>
            <Link href={`/${currentLocale}/admin/users`}>
              <Button variant="outline" className="w-full">
                {t('manageUsers')}
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <Store className="h-12 w-12 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">{t('sellerManagement')}</h3>
            <p className="text-sm text-gray-600 mb-4">{t('reviewAndApproveSellerApplications')}</p>
            <Link href={`/${currentLocale}/admin/sellers`}>
              <Button variant="outline" className="w-full">
                {t('manageSellers')}
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <BarChart3 className="h-12 w-12 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">{t('analytics')}</h3>
            <p className="text-sm text-gray-600 mb-4">{t('viewDetailedPlatformAnalytics')}</p>
            <Link href={`/${currentLocale}/admin/analytics`}>
              <Button variant="outline" className="w-full">
                {t('viewAnalytics')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Additional Admin Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <Calendar className="h-12 w-12 text-orange-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">{t('appointments')}</h3>
            <p className="text-sm text-gray-600 mb-4">{t('monitorPlatformAppointments')}</p>
            <Link href={`/${currentLocale}/admin/appointments`}>
              <Button variant="outline" className="w-full">
                {t('viewAppointments')}
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <MessageSquare className="h-12 w-12 text-indigo-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">{t('chatModeration')}</h3>
            <p className="text-sm text-gray-600 mb-4">{t('monitorAndModerateConversations')}</p>
            <Link href={`/${currentLocale}/admin/chats`}>
              <Button variant="outline" className="w-full">
                {t('moderateChats')}
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <Activity className="h-12 w-12 text-red-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">{t('systemHealth')}</h3>
            <p className="text-sm text-gray-600 mb-4">{t('monitorSystemPerformance')}</p>
            <Button variant="outline" className="w-full">
              {t('systemStatus')}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      {stats && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('quickPlatformOverview')}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-xl font-bold text-blue-600">{stats.appointments.total}</div>
                <div className="text-sm text-blue-600">{t('totalAppointments')}</div>
              </div>
              
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-xl font-bold text-green-600">{stats.chats.total}</div>
                <div className="text-sm text-green-600">{t('totalConversations')}</div>
              </div>
              
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="text-xl font-bold text-purple-600">{stats.products.total}</div>
                <div className="text-sm text-purple-600">{t('productsListed')}</div>
              </div>
              
              <div className="p-3 bg-orange-50 rounded-lg">
                <div className="text-xl font-bold text-orange-600">{stats.services.total}</div>
                <div className="text-sm text-orange-600">{t('servicesOffered')}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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