'use client';

import { useState, useEffect } from 'react';
import { useWishlistStore } from '@/lib/stores/wishlist';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Heart, Trash2, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { apiClient } from '@/lib/api/client';
import { formatPrice } from '@/lib/utils';

export default function WishlistPage() {
  const t = useTranslations('common');
  const pathname = usePathname();
  const currentLocale = pathname?.split('/').filter(Boolean)[0] === 'ar' ? 'ar' : 'en';
  const { items, getProducts, getServices, clearWishlist, removeItem } = useWishlistStore();
  const [activeTab, setActiveTab] = useState<'all' | 'products' | 'services'>('all');
  const [localizedItems, setLocalizedItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const products = getProducts();
  const services = getServices();

  // Fetch localized data for wishlist items
  useEffect(() => {
    const fetchLocalizedData = async () => {
      setIsLoading(true);
      try {
        const localizedData = await Promise.all(
          items.map(async (item) => {
            try {
              if (item.type === 'product') {
                const response = await apiClient.getProductById(item.id, currentLocale);
                if (response.success && response.data) {
                  return { ...item, ...response.data };
                }
              } else if (item.type === 'service') {
                const response = await apiClient.getServiceById(item.id, currentLocale);
                if (response.success && response.data) {
                  return { ...item, ...response.data };
                }
              }
            } catch (error) {
              console.error(`Failed to fetch localized data for ${item.type} ${item.id}:`, error);
            }
            return item; // Fallback to original item
          })
        );
        setLocalizedItems(localizedData);
      } catch (error) {
        console.error('Failed to fetch localized wishlist data:', error);
        setLocalizedItems(items); // Fallback to original items
      } finally {
        setIsLoading(false);
      }
    };

    if (items.length > 0) {
      fetchLocalizedData();
    } else {
      setLocalizedItems([]);
      setIsLoading(false);
    }
  }, [items, currentLocale]);

  const getDisplayItems = () => {
    const localizedProducts = localizedItems.filter(item => item.type === 'product');
    const localizedServices = localizedItems.filter(item => item.type === 'service');
    
    switch (activeTab) {
      case 'products':
        return localizedProducts;
      case 'services':
        return localizedServices;
      default:
        return localizedItems;
    }
  };

  const displayItems = getDisplayItems();

  const removeFromWishlist = (id: string, type: 'product' | 'service') => {
    removeItem(id, type);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Heart className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('wishlist.emptyTitle', { default: 'Your Wishlist is Empty' })}</h1>
            <p className="text-lg text-gray-600 mb-8">
              {t('wishlist.emptySubtitle', { default: 'Start adding products and services to your wishlist to see them here.' })}
            </p>
            <div className="space-x-4">
              <Link href={`/${currentLocale}/products`}>
                <Button variant="primary">
                  {t('products.viewAllProducts')}
                </Button>
              </Link>
              <Link href={`/${currentLocale}/services`}>
                <Button variant="outline">
                  {t('services.browseAllServices')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('wishlist.title', { default: 'My Wishlist' })}</h1>
              <p className="text-gray-600 mt-2">
                {t('wishlist.count', { count: items.length, default: `{count} items in your wishlist` })}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={clearWishlist}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t('wishlist.clearAll', { default: 'Clear All' })}
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm mb-6">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${activeTab === 'all'
                ? 'bg-wrench-accent '
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
          >
            {t('wishlist.all', { default: 'All' })} ({items.length})
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${activeTab === 'products'
                ? 'bg-wrench-accent'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
          >
            {t('nav.products')} ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${activeTab === 'services'
                ? 'bg-wrench-accent'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
          >
            {t('nav.services')} ({services.length})
          </button>
        </div>

        {/* Items Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wrench-orange-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayItems.map((item) => (
            <Card key={`${item.type}-${item.id}`} className="group hover:shadow-lg transition-shadow p-3">
              <CardHeader className="p-0 relative">
                <div className="relative aspect-square overflow-hidden rounded-t-lg">
                  <Image
                    src={item.image || '/placeholder-image.jpg'}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />

                  {/* Type Badge */}
                  <Badge
                    className={`absolute top-2 left-2 ${item.type === 'product'
                        ? 'bg-blue-500 hover:bg-blue-600'
                        : 'bg-green-500 hover:bg-green-600'
                      }`}
                  >
                    {item.type === 'product' ? t('products.productBadge') : t('services.shopBadge')}
                  </Badge>

                  {/* Category Badge */}
                  {item.category && (
                    <Badge variant="secondary" className="absolute top-2 left-20">
                      {typeof item.category === 'object' ? item.category.name : item.category}
                    </Badge>
                  )}

                  {/* Remove from Wishlist Heart Icon */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeFromWishlist(item.id, item.type);
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                    title={t('wishlist.remove', { default: 'Remove from wishlist' })}
                  >
                    <Heart className="h-4 w-4 fill-current" />
                  </button>
                </div>
              </CardHeader>

              <CardContent className="pt-2">
                <Link href={item.type === 'product' ? `/${currentLocale}/products/${item.id}` : `/${currentLocale}/services/${item.id}`}>
                <Button variant="link" className="font-semibold p-0 text-gray-900 mb-2 block overflow-hidden text-start">
                    <span className="line-clamp-2">
                      {item.title}
                    </span>
                  </Button>
                </Link>

                {item.sellerName && (
                  <p className="text-sm text-gray-600 mb-2">
                    {t('search.by')} {item.sellerName}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-wrench-orange-600">
                    {formatPrice(item.price, item.currency || 'AED', currentLocale)}
                  </span>

                  <div className="flex space-x-2">

                    {item.type === 'product' ? (
                      <Link href={`/${currentLocale}/products/${item.id}`} className="w-full">
                      <Button 
                        size="sm" 
                        className="w-full"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        {t('search.letsChat')}
                      </Button>
                    </Link>
                    ) : (
                      <Link href={`/${currentLocale}/services/${item.id}`}>
                        <Button size="sm">{t('services.bookNow')}</Button>
                      </Link>
                    )}
                  </div>
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  {t('wishlist.addedOn', { date: new Date(item.addedAt).toLocaleDateString(), default: `Added ${new Date(item.addedAt).toLocaleDateString()}` })}
                </p>
              </CardContent>
            </Card>
            ))}
          </div>
        )}

        {!isLoading && displayItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">{t('wishlist.noneInTab', { tab: activeTab, default: 'No items in this tab.' })}</p>
          </div>
        )}
      </div>
    </div>
  );
}
