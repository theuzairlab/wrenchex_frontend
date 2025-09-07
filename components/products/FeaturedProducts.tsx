'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api/client';
import type { Product } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Star, MapPin, Store, Tag, ChevronLeft, ChevronRight, MessageCircle, Heart } from 'lucide-react';
import { GlowingEffect } from '../ui/glowing-effect';
import { WishlistIcon } from '../ui/WishlistIcon';
import Image from 'next/image';

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
              <div className="flex gap-4 sm:gap-6 py-2">
                {featuredProducts.map((product) => (
                  <div key={product.id} className="snap-start min-w-[260px] sm:min-w-[280px]">
                    <Card className="group hover:shadow-lg transition-shadow p-3">
                      <CardHeader className="p-0 relative">
                        <div className="relative aspect-square overflow-hidden rounded-t-lg">
                          <Image
                            src={getImageUrl(product)}
                            alt={product.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />

                          {/* Type Badge */}
                          <Badge className="absolute top-2 left-2 bg-blue-500 hover:bg-blue-600">
                            Product
                          </Badge>

                          {/* Category Badge */}
                          <Badge variant="secondary" className="absolute top-2 left-20">
                            {product.category.name}
                          </Badge>

                          {/* Wishlist Heart Icon */}
                          <div className="absolute top-2 right-2">
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
                        </div>
                      </CardHeader>

                      <CardContent className="pt-2">
                        <Link href={`/products/${product.id}`}>
                          <Button variant="link" className="font-semibold p-0 text-gray-900 mb-2 line-clamp-2">
                            {product.title}
                          </Button>
                        </Link>

                        <p className="text-sm text-gray-600 mb-2">
                          by {product.seller.shopName}
                        </p>

                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-wrench-orange-600">
                            {formatPrice(product.price)}
                          </span>

                          <div className="flex space-x-2">
                            <Link href={`/products/${product.id}`} className="w-full">
                              <Button 
                                size="sm" 
                                className="w-full"
                              >
                                <MessageCircle className="h-4 w-4 mr-2" />
                                Let's Chat
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
                              ({product.ratingCount})
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {product.condition || 'NEW'}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
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
