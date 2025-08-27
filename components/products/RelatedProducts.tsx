'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { ArrowRight, Star, ShoppingCart, Heart } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { Product } from '@/types';

interface RelatedProductsProps {
  products: Product[];
  currentProductId: string;
  categoryName?: string;
}

interface RelatedProductCardProps {
  product: Product;
}

const RelatedProductCard = ({ product }: RelatedProductCardProps) => {
  const [imageError, setImageError] = useState(false);
  const [isWishListed, setIsWishListed] = useState(false);

  const primaryImage = product.images?.[0] || product.productImages?.[0]?.url;
  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-200 group">
      <Link href={`/products/${product.id}`}>
        <div className="relative aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
          {primaryImage && !imageError ? (
            <Image
              src={primaryImage}
              alt={product.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <ShoppingCart className="h-8 w-8" />
            </div>
          )}
          
          {discountPercentage > 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
              -{discountPercentage}%
            </div>
          )}

          <button
            onClick={(e) => {
              e.preventDefault();
              setIsWishListed(!isWishListed);
            }}
            className={cn(
              "absolute top-2 right-2 p-1.5 rounded-full bg-white shadow-md hover:bg-gray-50 transition-colors opacity-0 group-hover:opacity-100",
              isWishListed ? "text-red-500" : "text-gray-400"
            )}
          >
            <Heart className={cn("h-3 w-3", isWishListed && "fill-current")} />
          </button>
        </div>
      </Link>

      <div className="p-3">
        <Link href={`/products/${product.id}`}>
          <h3 className="font-medium text-gray-900 hover:text-wrench-accent transition-colors line-clamp-2 text-sm mb-2">
            {product.title}
          </h3>
        </Link>

        {/* Brand and Rating */}
        <div className="flex items-center justify-between mb-2">
          {product.brand && (
            <span className="text-xs text-gray-600 truncate">{product.brand}</span>
          )}
          
          {product.ratingAverage && product.ratingCount > 0 && (
            <div className="flex items-center space-x-1">
              <Star className="h-3 w-3 text-yellow-400 fill-current" />
              <span className="text-xs text-gray-600">
                {product.ratingAverage.toFixed(1)}
              </span>
            </div>
          )}
        </div>

        {/* Price */}
        <div className="flex items-end justify-between mb-2">
          <div>
            <div className="text-base font-bold text-gray-900">
              AED {product.price.toLocaleString()}
            </div>
            {product.originalPrice && product.originalPrice > product.price && (
              <div className="text-xs text-gray-500 line-through">
                AED {product.originalPrice.toLocaleString()}
              </div>
            )}
          </div>
          
          <div className="text-xs text-gray-500">
            {product.isActive ? (
              <span className="text-green-600">Available</span>
            ) : (
              <span className="text-red-600">Not Available</span>
            )}
          </div>
        </div>

        {/* Quick Add to Cart */}
        <Button 
          size="sm" 
          className="w-full text-xs"
          disabled={!product.isActive}
        >
          <ShoppingCart className="h-3 w-3 mr-1" />
          Quick Add
        </Button>
      </div>
    </div>
  );
};

const RelatedProducts = ({ 
  products, 
  currentProductId, 
  categoryName 
}: RelatedProductsProps) => {
  // Filter out the current product from related products
  const relatedProducts = products.filter(p => p.id !== currentProductId);

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <section className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Related Products</h2>
          {categoryName && (
            <p className="text-gray-600 mt-1">
              More items from {categoryName}
            </p>
          )}
        </div>
        
        <Link href="/products" className="group">
          <Button variant="outline" className="group-hover:bg-wrench-accent group-hover:text-black transition-colors">
            View All Products
            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {relatedProducts.slice(0, 8).map((product) => (
          <RelatedProductCard
            key={product.id}
            product={product}
          />
        ))}
      </div>

      {/* Show More Link */}
      {relatedProducts.length > 8 && (
        <div className="text-center pt-4">
          <Link href={`/products?category=${relatedProducts[0]?.categoryId}`}>
            <Button variant="outline">
              Show More from {categoryName}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      )}
    </section>
  );
};

export default RelatedProducts;