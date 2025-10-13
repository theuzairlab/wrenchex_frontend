'use client';

import { useState } from 'react';
import { WishlistIcon } from '@/components/ui/WishlistIcon';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Star,
  MapPin,
  ShoppingCart,
  Heart,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Store,
  Tag
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { cn, formatPrice } from '@/lib/utils';
import { ProductSearchResult, Product } from '@/types';

interface ProductCatalogProps {
  searchResult: ProductSearchResult;
  currentFilters: Record<string, string | undefined>;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const t = useTranslations('common');
  const [imageError, setImageError] = useState(false);
  const pathname = usePathname();
  const currentLocale = pathname?.split('/').filter(Boolean)[0] === 'ar' ? 'ar' : 'en';

  const primaryImage = product.images?.[0] || product.productImages?.[0]?.url;
  const discountPercentage = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Card className="group hover:shadow-lg transition-shadow p-3 w-[260px] sm:w-[280px]">
      <CardHeader className="p-0 relative">
        <div className="relative aspect-square overflow-hidden rounded-t-lg">
          <Image
            src={primaryImage || '/placeholder-image.jpg'}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
            onError={() => setImageError(true)}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />

          {/* Category Badge */}
          {product.category?.name && (
            <Badge variant="secondary" className="absolute top-2 left-2">
              {product.category.name}
            </Badge>
          )}

          {/* Discount Badge */}
          {discountPercentage > 0 && (
            <Badge className="absolute top-2 right-2 bg-red-500 hover:bg-red-600">
              -{discountPercentage}%
            </Badge>
          )}

          {/* Wishlist Heart Icon */}
          <div className="absolute top-2 right-2">
            <WishlistIcon
              id={product.id}
              type="product"
              title={product.title}
              price={product.price}
              currency={product.currency}
              image={primaryImage || ''}
              category={product.category?.name}
              sellerName={product.seller.shopName}
              size="sm"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        <Link href={`/products/${product.id}`}>
          <Button variant="link" className="font-semibold p-0 text-gray-900 mb-2 block text-left overflow-hidden">
            <span className="line-clamp-2">
              {product.title}
            </span>
          </Button>
        </Link>

        <p className="text-sm text-gray-600 mb-2">
          {t('search.by')} {product.seller.shopName}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-wrench-orange-600">
          {formatPrice(product.price, product.currency || 'AED', currentLocale)}
          </span>

          <div className="flex space-x-2">
            <Link href={`/products/${product.id}`} className="w-full">
              <Button
                size="sm"
                className="w-full"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                {t('search.letsChat')}
              </Button>
            </Link>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
          <div className="flex items-center">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${i < Math.floor(product.ratingAverage || 0)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                    }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500 ml-1">
              ({product.ratingCount || 0})
            </span>
          </div>
          <div className="text-xs text-gray-500">
            {(product.seller.shopAddress || product.seller.area || product.seller.city) && (
              <div className="text-xs text-gray-500 mb-1 line-clamp-1">
                <MapPin className="h-3 w-3 inline mr-1" />
                {product.seller.shopAddress || `${product.seller.area}, ${product.seller.city}`}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ProductCatalog = ({ searchResult, currentFilters }: ProductCatalogProps) => {
  const t = useTranslations('common');
  const router = useRouter();
  const searchParams = useSearchParams();

  // Handle new data structure with pagination
  const rawProducts = searchResult?.products || [];
  const products = Array.isArray(rawProducts) ? rawProducts : [];
  const pagination = searchResult?.pagination || { total: 0, page: 1, pages: 0 };

  const totalCount = pagination.total;
  const currentPage = pagination.page;
  const totalPages = pagination.pages;
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  const updateSort = (sortBy: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sortBy', sortBy);
    params.delete('page'); // Reset to first page
    router.replace(`/products?${params.toString()}`);
  };

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.replace(`/products?${params.toString()}`);
  };

  return (
    <div className="space-y-6">

      {/* Products Grid */}
      {products.length > 0 ? (
        <div className="flex justify-center flex-wrap gap-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {t('products.noResults')}
          </h3>
          <p className="text-gray-600 mb-4">
            {t('products.tryAdjusting')}
          </p>
          <Button onClick={() => router.push('/products')}>
            {t('products.viewAllProducts')}
          </Button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 pt-6">
          <div className="text-sm text-gray-600">
            {t('products.paginationSummary', { 
              start: ((currentPage - 1) * 12) + 1, 
              end: Math.min(currentPage * 12, totalCount), 
              total: totalCount.toLocaleString() 
            })}
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage - 1)}
              disabled={!hasPreviousPage}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              {t('pagination.previous')}
            </Button>

            {/* Page Numbers */}
            <div className="flex space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                return (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={cn(
                      "px-3 py-2 text-sm rounded-lg transition-colors",
                      pageNum === currentPage
                        ? "bg-wrench-accent text-black"
                        : "text-gray-600 hover:bg-gray-100"
                    )}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage + 1)}
              disabled={!hasNextPage}
            >
              {t('pagination.next')}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCatalog;