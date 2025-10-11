'use client';

import React, { useState, useEffect } from 'react';
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
  Package, 
  Search,  
  Eye, 
  Edit, 
  Trash2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Store,
  Tag,
} from 'lucide-react';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  isActive: boolean;
  isFlagged: boolean;
  isFeatured?: boolean;
  ratingAverage?: number;
  ratingCount: number;
  viewCount?: number;
  createdAt: string;
  updatedAt: string;
  seller: {
    id: string;
    shopName: string;
    city: string;
    area: string;
    ratingAverage?: number;
    ratingCount: number;
  };
  category: {
    id: string;
    name: string;
  };
  images?: string[];
}

interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default function AdminProductsPage() {
  const role = useUserRole();
  const { isLoading, isAuthenticated } = useAuthStore();
  const pathname = usePathname();
  const currentLocale = pathname?.split('/').filter(Boolean)[0] === 'ar' ? 'ar' : 'en';
  const t = useTranslations('adminProducts');
  const tCurrency = useTranslations('common.currency');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    if (isAuthenticated && role === 'ADMIN') {
      fetchProducts();
    }
  }, [isAuthenticated, role, currentPage, search, categoryFilter, statusFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.getProducts({
        search: search || undefined,
        categoryId: categoryFilter || undefined,
        page: currentPage,
        limit: 10
      });

      if (response.success && response.data) {
        setProducts(response.data.products);
        setPagination(response.data.pagination);
      } else {
        setError(response.error?.message || t('fetchProductsFailed'));
      }
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setError(err.message || t('fetchProductsFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts();
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
    fetchProducts();
  };

  const getStatusBadge = (isActive: boolean, isFlagged: boolean) => {
    if (isFlagged) {
      return <Badge className="bg-red-100 text-red-800">{t('flagged')}</Badge>;
    }
    return isActive ? (
      <Badge className="bg-green-100 text-green-800">{t('active')}</Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-800">{t('inactive')}</Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(currentLocale === 'ar' ? 'ar-AE' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(currentLocale === 'ar' ? 'ar-AE' : 'en-US', {
      style: 'currency',
      currency: 'AED'
    }).format(amount);
  };

  // Show loading state while user data is being fetched
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
          <h1 className="text-2xl font-bold text-gray-900">{t('productManagement')}</h1>
          <p className="text-gray-600">{t('monitorAndManageAllPlatformProducts')}</p>
        </div>
        <Button 
          onClick={fetchProducts} 
          variant="outline" 
          leftIcon={<RefreshCw className="h-4 w-4" />}
          disabled={loading}
        >
          {t('refresh')}
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('searchProducts')}
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder={t('searchPlaceholder')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('statusFilter')}
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    handleFilterChange();
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wrench-accent focus:border-transparent"
                >
                  <option value="">{t('allStatuses')}</option>
                  <option value="active">{t('active')}</option>
                  <option value="inactive">{t('inactive')}</option>
                  <option value="flagged">{t('flagged')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('categoryFilter')}
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    handleFilterChange();
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wrench-accent focus:border-transparent"
                >
                  <option value="">{t('allCategories')}</option>
                  {/* Categories would be populated from API */}
                </select>
              </div>

              <div className="flex items-end">
                <Button type="submit" variant="primary" className="w-full">
                  <Search className="h-4 w-4 mr-2" />
                  {t('search')}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Products List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {t('products', { count: pagination.total })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex flex-col items-center space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wrench-accent"></div>
                <p className="text-gray-600">{t('loadingProducts')}</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchProducts} variant="outline">
                {t('tryAgain')}
              </Button>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">{t('noProductsFound')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-gray-900">{product.title}</h3>
                        {getStatusBadge(product.isActive, product.isFlagged)}
                        {product.isFeatured && (
                          <Badge className="bg-yellow-100 text-yellow-800">{t('featured')}</Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {product.description}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Store className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="font-medium text-gray-700">{t('seller')}</p>
                            <p className="text-gray-600">{product.seller.shopName}</p>
                            <p className="text-xs text-gray-500">
                              {product.seller.city}, {product.seller.area}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="font-medium text-gray-700">{t('category')}</p>
                            <p className="text-gray-600">{product.category.name}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="font-medium text-gray-700">{t('price')}</p>
                            <p className="text-gray-600">{tCurrency('aed')} {product.price}</p>
                            {product.originalPrice && (
                              <p className="text-xs text-gray-500 line-through">
                                {tCurrency('aed')} {product.originalPrice}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="font-medium text-gray-700">{t('stats')}</p>
                            <p className="text-gray-600">
                              ⭐ {product.ratingAverage?.toFixed(1) || '0'} ({product.ratingCount})
                            </p>
                            <p className="text-xs text-gray-500">
                              {t('views', { count: product.ratingCount || 0 })}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 text-xs text-gray-500">
                        {t('created')}: {formatDate(product.createdAt)} | 
                        {t('updated')}: {formatDate(product.updatedAt)}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 min-w-fit">
                      <Button variant="outline" size="sm" leftIcon={<Eye className="h-4 w-4" />}>
                        {t('view')}
                      </Button>
                      <Button variant="outline" size="sm" leftIcon={<Edit className="h-4 w-4" />}>
                        {t('edit')}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        leftIcon={<Trash2 className="h-4 w-4" />}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        {t('delete')}
                      </Button>
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
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
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
                >
                  <ChevronLeft className="h-4 w-4" />
                  {t('previous')}
                </Button>
                
                <span className="text-sm text-gray-600">
                  {t('pageOf', { current: currentPage, total: pagination.pages })}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === pagination.pages}
                >
                  {t('next')}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
