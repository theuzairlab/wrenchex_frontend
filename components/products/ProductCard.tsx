'use client';

import { useState } from 'react';
import { WishlistIcon } from '@/components/ui/WishlistIcon';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { Star, MapPin, ShoppingCart, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn, formatPrice } from '@/lib/utils';
import { Product } from '@/types';
import DistanceDisplay from '@/components/location/DistanceDisplay';
import { DirectionButton } from '@/components/location/DirectionButton';
import { useTranslations } from 'next-intl';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [imageError, setImageError] = useState(false);
  const primaryImage = product.images?.[0] || product.productImages?.[0]?.url;
  const t = useTranslations('common');
  const pathname = usePathname();
  const currentLocale = pathname?.split('/').filter(Boolean)[0] === 'ar' ? 'ar' : 'en';
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-200 overflow-hidden">
      {/* Product Image */}
      <Link href={`/${currentLocale}/products/${product.id}`}>
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          {primaryImage && !imageError ? (
            <Image
              src={primaryImage}
              alt={product.title}
              fill
              className="object-cover hover:scale-105 transition-transform duration-200"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <ShoppingCart className="h-12 w-12" />
            </div>
          )}
          
          {/* Wishlist Icon */}
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
            />
          </div>

          {/* Condition Badge */}
          {product.condition && (
            <div className="absolute top-2 left-2">
              <span className={cn(
                "px-2 py-1 rounded-full text-xs font-medium text-white",
                product.condition === 'NEW' ? 'bg-green-500' :
                product.condition === 'USED' ? 'bg-yellow-500' :
                'bg-blue-500'
              )}>
                {product.condition}
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4">
        {/* Title */}
        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold text-gray-900 hover:text-wrench-accent transition-colors line-clamp-2 mb-2">
            {product.title}
          </h3>
        </Link>

        {/* Brand and Category */}
        <div className="flex items-center justify-between mb-2">
          {product.brand && (
            <span className="text-sm text-gray-600">{product.brand}</span>
          )}
          {product.category?.name && (
            <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
              {product.category.name}
            </span>
          )}
        </div>

        {/* Rating */}
        {product.ratingAverage && product.ratingCount > 0 && (
          <div className="flex items-center space-x-1 mb-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-3 w-3",
                    i < Math.floor(product.ratingAverage!)
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300"
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-gray-600">({product.ratingCount})</span>
          </div>
        )}

        {/* Seller & Distance */}
        <div className="mb-3">
          <div className="flex items-center space-x-1 text-sm text-gray-600 mb-1">
            <span className="font-medium line-clamp-1">{product.seller.shopName}</span>
          </div>
          
          {/* Shop Address */}
          {(product.seller.shopAddress || product.seller.area || product.seller.city) && (
            <div className="text-xs text-gray-500 mb-1 line-clamp-1">
              <MapPin className="h-3 w-3 inline mr-1" />
              {product.seller.shopAddress || `${product.seller.area}, ${product.seller.city}`}
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <DistanceDisplay
              sellerLatitude={product.seller.latitude}
              sellerLongitude={product.seller.longitude}
              sellerCity={product.seller.city}
              sellerArea={product.seller.area}
              className="text-xs"
              showIcon={true}
              showFallbackLocation={true}
            />
            {product.seller.latitude && product.seller.longitude && (
              <DirectionButton
                destination={{
                  latitude: product.seller.latitude,
                  longitude: product.seller.longitude,
                  address: product.seller.shopAddress || `${product.seller.area}, ${product.seller.city}`,
                  name: product.seller.shopName
                }}
                size="sm"
                variant="ghost"
                showText={false}
                className="text-xs px-1 h-6"
              />
            )}
          </div>
        </div>

        {/* Price */}
        <div className="mb-3">
          <div className="text-lg font-bold text-gray-900">
            {formatPrice(product.price, product.currency || 'AED', currentLocale)}
          </div>
          {product.originalPrice && product.originalPrice > product.price && (
            <div className="text-sm text-gray-500 line-through">
              {formatPrice(product.originalPrice, product.currency || 'AED', currentLocale)}
            </div>
          )}
        </div>

        {/* Action Button */}
        <Link href={`/${currentLocale}/products/${product.id}`} className="w-full">
          <Button 
            size="sm" 
            className="w-full"
            disabled={!product.isActive}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            {t('productCard.chatWithSeller')}
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;
