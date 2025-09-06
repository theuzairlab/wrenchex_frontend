'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api/client';
import type { Product } from '@/types';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Star, MapPin, Store, Tag, ChevronLeft, ChevronRight } from 'lucide-react';
import { GlowingEffect } from '../ui/glowing-effect';
import { WishlistIcon } from '../ui/WishlistIcon';

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setIsLoading(true);
        // Fetch featured products sorted by rating and reviews
        const response = await apiClient.getProducts({
          sortBy: 'rating',
          limit: 12,
          isActive: true
        });

        const items = response?.data?.products || response?.data || [];
        if (mounted) setProducts(Array.isArray(items) ? items : []);
      } catch (err: any) {
        if (mounted) setError(err?.message || 'Failed to load featured products');
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const featuredProducts = useMemo(() => products.slice(0, 6), [products]);

  const scrollByAmount = (direction: 'left' | 'right') => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = Math.min(320, el.clientWidth * 0.8);
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getImageUrl = (product: Product) => {
    if (product.productImages && product.productImages.length > 0) {
      return product.productImages[0].url;
    }
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }
    return '/api/placeholder/300/200';
  };

  return (
    <section className="py-12 sm:py-16 bg-wrench-bg-primary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-wrench-text-primary mb-2">
            Featured Products
          </h2>
          <p className="text-wrench-text-secondary text-sm sm:text-base">
            Discover our top-rated products with the best reviews
          </p>
        </div>

        {isLoading ? (
          <div className="flex gap-4 sm:gap-6 overflow-x-auto py-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="min-w-[280px] sm:min-w-[320px] h-80 rounded-xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : (
          <div className="relative">
            {/* Navigation Arrows */}
            <button
              type="button"
              aria-label="Scroll left"
              onClick={() => scrollByAmount('left')}
              className="hidden md:flex absolute left-0 -top-6 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full bg-white border border-gray-200 shadow-wrench-card hover:shadow-wrench-hover"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Scroll right"
              onClick={() => scrollByAmount('right')}
              className="hidden md:flex absolute right-0 -top-6 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full bg-white border border-gray-200 shadow-wrench-card hover:shadow-wrench-hover"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            {/* Products Carousel */}
            <div
              ref={scrollerRef}
              className="overflow-x-auto -mx-4 px-4 scroll-smooth snap-x snap-mandatory scrollbar-none"
            >
              <div className="flex gap-2 sm:gap-3 py-2">
                {featuredProducts.map((product) => (
                  <Link key={product.id} href={`/products/${product.id}`} className="snap-start">
                    <div className="relative group rounded-xl">
                      <GlowingEffect
                        blur={0}
                        borderWidth={3}
                        spread={80}
                        glow={true}
                        disabled={false}
                        proximity={64}
                        inactiveZone={0.01}
                      />
                      <Card className="group p-0 hover:shadow-wrench-hover transition-all duration-300 border-0 shadow-wrench-card bg-white cursor-pointer min-w-[280px] sm:min-w-[320px] min-h-[453px] sm:min-h-[518px]">
                        <CardContent className="p-0 h-full flex flex-col">
                          {/* Product Image */}
                          <div className="relative object-cover aspect-square overflow-hidden rounded-t-xl">
                            <img
                              src={getImageUrl(product)}
                              alt={product.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>

                          {/* Product Details */}
                          <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                            <div className="space-y-2">
                              {/* Price */}
                              <div className="flex items-center justify-between space-x-2">
                                <span className="text-lg sm:text-xl font-bold text-wrench-accent">
                                  {formatPrice(product.price)}
                                </span>
                                {product.originalPrice && product.originalPrice > product.price && (
                                  <span className="text-sm text-gray-500 line-through">
                                    {formatPrice(product.originalPrice)}
                                  </span>
                                )}
                                {/* Category */}
                                <div className="flex items-center text-xs sm:text-sm text-wrench-text-secondary">
                                  <Tag className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                  <span className="line-clamp-1">{product.category.name}</span>
                                </div>
                              </div>

                              {/* Title */}
                              <h3 className="font-semibold text-wrench-text-primary group-hover:text-wrench-accent line-clamp-2 text-sm sm:text-base">
                                {product.title}
                              </h3>

                              {/* Location */}
                              <div className="flex items-center justify-between text-xs sm:text-sm text-wrench-text-secondary">
                                <div className="flex items-center">
                                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                  <span className="line-clamp-1">
                                    {product.seller.area}
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <Store className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                  <span className="line-clamp-1">{product.seller.shopName}</span>
                                </div>

                              </div>


                            </div>

                            {/* Rating */}
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                              <div className="flex items-center">
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-3 w-3 sm:h-4 sm:w-4 ${i < Math.floor(product.ratingAverage || 0)
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-300'
                                        }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-xs sm:text-sm text-wrench-text-secondary ml-1">
                                  ({product.ratingCount})
                                </span>
                              </div>
                              <div className="text-xs sm:text-sm text-wrench-text-secondary">
                                {product.condition || 'NEW'}
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <WishlistIcon
                              id={product.id}
                              type="product"
                              title={product.title}
                              price={product.price}
                              image={product.images?.[0] || ''}
                              category={product.category?.name}
                              sellerName={product.seller.shopName}
                              size="sm"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CTA Buttons */}
        {!isLoading && products.length > 0 && (
          <div className="text-center mt-8 sm:mt-12">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/products">
                <Button className="bg-wrench-accent text-wrench-text-primary hover:bg-wrench-accent-hover px-6 py-3">
                  View All Products
                </Button>
              </Link>
              <Link href="/products?sortBy=rating">
                <Button variant="outline" className="border-wrench-accent text-wrench-accent hover:bg-wrench-accent-hover hover:text-black px-6 py-3">
                  Top Rated Products
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default FeaturedProducts;
