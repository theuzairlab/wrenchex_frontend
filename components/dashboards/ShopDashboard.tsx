import { ArrowRight, BarChart3, Calendar, Plus, MessageCircle, Star, Package } from "lucide-react";
import { Button } from "../ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { PendingApproval } from "../seller/PendingApproval";
import { useTranslations } from 'next-intl';



// Seller Dashboard Content  
export function ShopDashboard({ User, Loading, dashboardData, error, formatDateTime, formatCurrency, sellerProfile }: { User: any, Loading: any, dashboardData: any, error: any, formatDateTime: any, formatCurrency: any, sellerProfile?: any }) {
    const user = User();
    const t = useTranslations('common.dashboard');
    const pathname = usePathname();
    const currentLocale = pathname?.split('/').filter(Boolean)[0] === 'ar' ? 'ar' : 'en';
    
  
    
  
    if (Loading) {
      return (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wrench-accent mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loadingShopDashboard')}</p>
        </div>
      );
    }
    
    // Show pending approval if we have an error and it's related to approval
    if (error && (error.toLowerCase().includes('pending approval') || 
                   error.toLowerCase().includes('not approved') ||
                   error.toLowerCase().includes('seller account') ||
                   error.toLowerCase().includes('approval'))) {
      return <PendingApproval 
        email={user?.email} 
        shopName={sellerProfile?.shopName}
      />;
    }
  
    if (error) {
      // For other errors, show the generic error message
      return (
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-lg font-medium">{t('errorLoadingDashboard')}</p>
            <p className="text-sm text-gray-600">{error}</p>
          </div>
        </div>
      );
    }
  
    if (!dashboardData) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-600">{t('noDashboardDataAvailable')}</p>
        </div>
      );
    }
  
    return (
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t('welcomeBackShop', { shopName: dashboardData.seller.shopName })}
          </h2>
          <p className="text-gray-600 mb-4">
            {t('manageBusiness')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href={`/${currentLocale}/seller/products/add`}>
              <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />}>
{t('addProduct')}
              </Button>
            </Link>

          </div>
        </div>
  
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('activeProducts')}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardData.stats.products || 0}
                  </p>
                  <p className="text-sm text-green-600">
                    {dashboardData.stats.products > 0 
                      ? t('productsAvailableForSale') 
                      : t('noActiveProducts')}
                  </p>
                </div>
                <Package className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
  
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('totalChats')}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardData.stats.chats || 0}
                  </p>
                  <p className="text-sm text-blue-600">
                    {t('unreadMessagesCount', { count: dashboardData.stats.unreadMessages || 0 })}
                  </p>
                </div>
                <MessageCircle className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
  
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('appointments')}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardData.stats.appointments || 0}
                  </p>
                  <p className="text-sm text-purple-600">
                    {t('upcomingBookings')}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
  
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('shopRating')}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardData.seller.ratingAverage?.toFixed(1) || 'N/A'}
                  </p>
                  <p className="text-sm text-yellow-600">
                    {dashboardData.seller.ratingCount} {t('reviews')}
                  </p>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>
  
        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Chats */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{t('recentChats')}</CardTitle>
                <Link href={`/${currentLocale}/seller/chats`}>
                  <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
{t('viewAll')}
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {dashboardData.recentChats && dashboardData.recentChats.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.recentChats.map((chat: any) => (
                    <div 
                      key={chat.id} 
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {chat.product?.title || t('productChat')}
                        </p>
                        <p className="text-sm text-gray-500">
                          {t('with')} {chat.buyer?.firstName} {chat.buyer?.lastName}
                        </p>
                        {chat.lastMessage && (
                          <p className="text-xs text-gray-400 mt-1 truncate">
                            {chat.lastMessage}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        {chat.unreadCount > 0 && (
                          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                            {chat.unreadCount}
                          </span>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDateTime ? formatDateTime(chat.updatedAt) : t('recentChats')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">{t('noRecentChats')}</p>
                  <Link href={`/${currentLocale}/seller/products/add`}>
                    <Button variant="outline" size="sm" className="mt-3">
                      {t('addProducts')}
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
  
          {/* Recent Appointments */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{t('recentAppointments')}</CardTitle>
                <Link href={`/${currentLocale}/seller/appointments`}>
                  <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
{t('viewAll')}
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {dashboardData.recentAppointments.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.recentAppointments.map((appointment: any) => (
                    <div 
                      key={appointment.id} 
                      className="flex items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-shrink-0">
                        <Calendar className="h-10 w-10 text-blue-600" />
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="font-medium text-gray-900">
                          {appointment.service.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDateTime(appointment.scheduledTimeStart)}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        appointment.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                        appointment.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {appointment.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">{t('noRecentAppointments')}</p>
                  <Link href={`/${currentLocale}/seller/services`}>
                    <Button variant="outline" size="sm" className="mt-3">
                      {t('addServices')}
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }