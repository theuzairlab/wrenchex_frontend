'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TranslationManagement from '@/components/seller/TranslationManagement';
import { useTranslations } from 'next-intl';
import { apiClient } from '@/lib/api/client';
import { 
  Languages, 
  Package, 
  Wrench, 
  FolderOpen,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface TranslationStats {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

export default function SellerTranslationsPage() {
  const pathname = usePathname();
  const currentLocale = pathname?.split('/').filter(Boolean)[0] === 'ar' ? 'ar' : 'en';
  const t = useTranslations('common.translationManagement');
  const [activeTab, setActiveTab] = useState('products');
  const [stats, setStats] = useState<TranslationStats>({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      let endpoint = '';
      
      switch (activeTab) {
        case 'products':
          endpoint = '/translations/pending/products';
          break;
        case 'services':
          endpoint = '/translations/pending/services';
          break;
        case 'categories':
          endpoint = '/translations/pending/categories';
          break;
        default:
          endpoint = '/translations/pending/products';
      }

      const response = await apiClient.get(endpoint);
      
      if (response.success && response.data) {
        const items = response.data.items || [];
        
        // Count translations by status
        let pending = 0;
        let approved = 0;
        let rejected = 0;
        
        items.forEach((item: any) => {
          item.translations?.forEach((translation: any) => {
            if (translation.status === 'DRAFT') pending++;
            else if (translation.status === 'APPROVED') approved++;
            else if (translation.status === 'REJECTED') rejected++;
          });
        });
        
        setStats({
          pending,
          approved,
          rejected,
          total: items.length
        });
      }
    } catch (error) {
      console.error('Failed to fetch translation stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Languages className="w-8 h-8 mr-3 text-wrench-accent" />
            {t('translationManagement')}
          </h1>
          <p className="text-gray-600 mt-2">
            {t('manageAutoTranslations')}
          </p>
        </div>
      </div>

      {/* Translation Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('pendingReview')}</p>
                <p className="text-2xl font-bold">{loading ? '...' : stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('approved')}</p>
                <p className="text-2xl font-bold">{loading ? '...' : stats.approved}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('rejected')}</p>
                <p className="text-2xl font-bold">{loading ? '...' : stats.rejected}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('totalItems')}</p>
                <p className="text-2xl font-bold">{loading ? '...' : stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Translation Management Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>{t('translationManagement')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="products" className="flex items-center space-x-2">
                <Package className="w-4 h-4" />
                <span>{t('products')}</span>
              </TabsTrigger>
              <TabsTrigger value="services" className="flex items-center space-x-2">
                <Wrench className="w-4 h-4" />
                <span>{t('services')}</span>
              </TabsTrigger>
              <TabsTrigger value="categories" className="flex items-center space-x-2">
                <FolderOpen className="w-4 h-4" />
                <span>{t('categories')}</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="products" className="mt-6">
              <TranslationManagement 
                entityType="product" 
                showPendingOnly={true}
              />
            </TabsContent>

            <TabsContent value="services" className="mt-6">
              <TranslationManagement 
                entityType="service" 
                showPendingOnly={true}
              />
            </TabsContent>

            <TabsContent value="categories" className="mt-6">
              <TranslationManagement 
                entityType="category" 
                showPendingOnly={true}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle>{t('howTranslationWorks')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">🤖 {t('automaticTranslation')}</h3>
              <p className="text-sm text-gray-600">
                {t('automaticTranslationDescription')}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">✅ {t('reviewProcess')}</h3>
              <p className="text-sm text-gray-600">
                {t('reviewProcessDescription')}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">✏️ {t('editAndApprove')}</h3>
              <p className="text-sm text-gray-600">
                {t('editAndApproveDescription')}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">🔄 {t('fallbackSystem')}</h3>
              <p className="text-sm text-gray-600">
                {t('fallbackSystemDescription')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
