'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useUserRole } from '@/lib/stores/auth';
import { useAuthStore } from '@/lib/stores/auth';
import { apiClient } from '@/lib/api/client';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { 
  Store, 
  Search, 
  CheckCircle, 
  XCircle, 
  Eye, 
  MapPin, 
  Package, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

interface Seller {
  id: string;
  shopName: string;
  shopDescription?: string;
  shopAddress: string;
  city: string;
  area: string;
  isApproved: boolean;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  _count: {
    products: number;
    services: number;
    appointments: number;
  };
}

interface SellersResponse {
  sellers: Seller[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default function AdminSellersPage() {
  const role = useUserRole();
  const { isLoading, isAuthenticated } = useAuthStore();
  const pathname = usePathname();
  const currentLocale = pathname?.split('/').filter(Boolean)[0] === 'ar' ? 'ar' : 'en';
  const t = useTranslations('adminSellers');

  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [approvalFilter, setApprovalFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [updatingSeller, setUpdatingSeller] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && role === 'ADMIN') {
      fetchSellers();
    }
  }, [isAuthenticated, role, currentPage, search, approvalFilter]);

  const fetchSellers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.getAdminSellers({
        isApproved: approvalFilter === 'true' ? true : approvalFilter === 'false' ? false : undefined,
        search: search || undefined,
        page: currentPage,
        limit: 10
      });

      if (response.success && response.data) {
        setSellers(response.data.sellers);
        setPagination(response.data.pagination);
      } else {
        setError(response.error?.message || t('fetchSellersFailed'));
      }
    } catch (err: any) {
      console.error('Error fetching sellers:', err);
      setError(err.message || t('fetchSellersFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchSellers();
  };

  const handleApprovalFilterChange = (newFilter: string) => {
    setApprovalFilter(newFilter);
    setCurrentPage(1);
  };

  const handleSellerApproval = async (sellerId: string, isApproved: boolean) => {
    try {
      setUpdatingSeller(sellerId);
      
      const response = await apiClient.updateSellerApproval(sellerId, isApproved);
      
      if (response.success) {
        // Update the local state
        setSellers(prev => prev.map(seller => 
          seller.id === sellerId 
            ? { ...seller, isApproved } 
            : seller
        ));
      } else {
        setError(response.error?.message || t('updateSellerApprovalFailed'));
      }
    } catch (err: any) {
      console.error('Error updating seller approval:', err);
      setError(err.message || t('updateSellerApprovalFailed'));
    } finally {
      setUpdatingSeller(null);
    }
  };

  const getApprovalBadge = (isApproved: boolean) => {
    return isApproved ? (
      <Badge className="bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3 mr-1" />
        {t('approved')}
      </Badge>
    ) : (
      <Badge className="bg-yellow-100 text-yellow-800">
        <AlertCircle className="w-3 h-3 mr-1" />
        {t('pendingApproval')}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(currentLocale === 'ar' ? 'ar-AE' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
    
      <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t('sellerManagement')}</h1>
            <p className="text-sm sm:text-base text-gray-600">{t('reviewAndApproveSellerApplications')}</p>
          </div>
          <Button 
            onClick={fetchSellers} 
            variant="outline" 
            leftIcon={<RefreshCw className="h-4 w-4" />}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {t('refresh')}
          </Button>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('searchSellers')}
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="text"
                      placeholder={t('searchPlaceholder')}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10 text-sm sm:text-base"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('approvalStatus')}
                  </label>
                  <select
                    value={approvalFilter}
                    onChange={(e) => handleApprovalFilterChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wrench-accent focus:border-transparent text-sm sm:text-base"
                  >
                    <option value="">{t('allSellers')}</option>
                    <option value="false">{t('pendingApproval')}</option>
                    <option value="true">{t('approved')}</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <Button type="submit" variant="primary" className="w-full">
                    <Search className="h-4 w-4 mr-2" />
                    <span className="text-sm sm:text-base">{t('search')}</span>
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Sellers List */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Store className="h-4 w-4 sm:h-5 sm:w-5" />
              {t('sellers', { count: pagination.total })}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex flex-col items-center space-y-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wrench-accent"></div>
                  <p className="text-gray-600">{t('loadingSellers')}</p>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={fetchSellers} variant="outline">
                  {t('tryAgain')}
                </Button>
              </div>
            ) : sellers.length === 0 ? (
              <div className="text-center py-8">
                <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">{t('noSellersFound')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sellers.map((seller) => (
                  <div
                    key={seller.id}
                    className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                          <h3 className="font-medium text-gray-900 text-sm sm:text-base">{seller.shopName}</h3>
                          {getApprovalBadge(seller.isApproved)}
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600">
                          <div>
                            <p className="font-medium text-gray-700">{t('owner')}</p>
                            <p className="break-words">{seller.user.firstName} {seller.user.lastName}</p>
                            <p className="break-words">{seller.user.email}</p>
                            {seller.user.phone && <p className="break-words">{seller.user.phone}</p>}
                          </div>
                          
                          <div>
                            <p className="font-medium text-gray-700">{t('location')}</p>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                              <p className="break-words">{seller.city}, {seller.area}</p>
                            </div>
                            <p className="text-xs break-words">{seller.shopAddress}</p>
                          </div>
                        </div>

                        {seller.shopDescription && (
                          <div className="mt-2">
                            <p className="text-xs sm:text-sm text-gray-600 break-words">{seller.shopDescription}</p>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-3 text-xs sm:text-sm">
                          <div className="flex items-center gap-1">
                            <Package className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 flex-shrink-0" />
                            <span>{t('products', { count: seller._count.products })}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Store className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 flex-shrink-0" />
                            <span>{t('services', { count: seller._count.services })}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600 flex-shrink-0" />
                            <span>{t('appointments', { count: seller._count.appointments })}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 flex-shrink-0" />
                            <span>{t('joined', { date: formatDate(seller.createdAt) })}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row xl:flex-col gap-2 min-w-fit">
                        <Button variant="outline" size="sm" leftIcon={<Eye className="h-3 w-3 sm:h-4 sm:w-4" />} className="w-full sm:w-auto">
                          <span className="text-xs sm:text-sm">{t('viewDetails')}</span>
                        </Button>
                        
                        {!seller.isApproved ? (
                          <Button
                            variant="primary"
                            size="sm"
                            leftIcon={<CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />}
                            onClick={() => handleSellerApproval(seller.id, true)}
                            disabled={updatingSeller === seller.id}
                            className="w-full sm:w-auto"
                          >
                            <span className="text-xs sm:text-sm">{updatingSeller === seller.id ? t('approving') : t('approve')}</span>
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            leftIcon={<XCircle className="h-3 w-3 sm:h-4 sm:w-4" />}
                            onClick={() => handleSellerApproval(seller.id, false)}
                            disabled={updatingSeller === seller.id}
                            className="text-red-600 border-red-200 hover:bg-red-50 w-full sm:w-auto"
                          >
                            <span className="text-xs sm:text-sm">{updatingSeller === seller.id ? t('updating') : t('revokeApproval')}</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                  {t('showingResults', { 
                    start: ((pagination.page - 1) * pagination.limit) + 1,
                    end: Math.min(pagination.page * pagination.limit, pagination.total),
                    total: pagination.total
                  })}
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="text-xs sm:text-sm"
                  >
                    <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">{t('previous')}</span>
                  </Button>
                  
                  <span className="text-xs sm:text-sm text-gray-600">
                    {t('pageOf', { current: currentPage, total: pagination.pages })}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === pagination.pages}
                    className="text-xs sm:text-sm"
                  >
                    <span className="hidden sm:inline">{t('next')}</span>
                    <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
  );
}
