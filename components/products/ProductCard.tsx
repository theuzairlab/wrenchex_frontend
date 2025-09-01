'use client';

import { useState } from 'react';
import { WishlistIcon } from '@/components/ui/WishlistIcon';
import Link from 'next/link';
import Image from 'next/image';
import { Star, MapPin, ShoppingCart, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [imageError, setImageError] = useState(false);
  const primaryImage = product.images?.[0] || product.productImages?.[0]?.url;
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-200 overflow-hidden">
      {/* Product Image */}
      <Link href={`/products/${product.id}`}>
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

        {/* Seller */}
        <div className="flex items-center space-x-1 mb-3 text-sm text-gray-600">
          <MapPin className="h-3 w-3 text-gray-400" />
          <span className="line-clamp-1">{product.seller.shopName}</span>
          {product.seller.isApproved && (
            <span className="text-xs bg-blue-100 text-blue-700 px-1 rounded">✓</span>
          )}
        </div>

        {/* Price */}
        <div className="mb-3">
          <div className="text-lg font-bold text-gray-900">
            AED {product.price.toLocaleString()}
          </div>
          {product.originalPrice && product.originalPrice > product.price && (
            <div className="text-sm text-gray-500 line-through">
              AED {product.originalPrice.toLocaleString()}
            </div>
          )}
        </div>

        {/* Action Button */}
        <Link href={`/products/${product.id}`} className="w-full">
          <Button 
            size="sm" 
            className="w-full"
            disabled={!product.isActive}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Chat with Seller
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;
