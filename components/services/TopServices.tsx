'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api/client';
import type { Service } from '@/types';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Star, MapPin, Store, Tag, Clock, ChevronLeft, ChevronRight, Wrench } from 'lucide-react';
import { GlowingEffect } from '../ui/glowing-effect';
import { WishlistIcon } from '../ui/WishlistIcon';

export function TopServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setIsLoading(true);
        // Fetch top services sorted by rating and reviews
        const response = await apiClient.getServices({
          sortBy: 'rating',
          limit: 12,
          isActive: true
        });

        const items = response?.data?.services || response?.data || [];
        if (mounted) setServices(Array.isArray(items) ? items : []);
      } catch (err: any) {
        if (mounted) setError(err?.message || 'Failed to load top services');
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const topServices = useMemo(() => services.slice(0, 6), [services]);

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

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const getImageUrl = (service: Service) => {
    if (service.images && service.images.length > 0) {
      return service.images[0];
    }
    return '/api/placeholder/300/200';
  };

  return (
    <section className="py-12 sm:py-16 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-wrench-text-primary mb-2">
            Top Services
          </h2>
          <p className="text-wrench-text-secondary text-sm sm:text-base">
            Discover our highest-rated services with excellent reviews
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

            {/* Services Carousel */}
            <div
              ref={scrollerRef}
              className="overflow-x-auto -mx-4 px-4 scroll-smooth snap-x snap-mandatory scrollbar-none"
            >
              <div className="flex gap-2 sm:gap-3 py-2">
                {topServices.map((service) => (
                  <Link key={service.id} href={`/services/${service.id}`} className="snap-start">
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
                      <Card className="group p-0 hover:shadow-wrench-hover transition-all duration-300 border-0 shadow-wrench-card bg-white cursor-pointer min-w-[280px] sm:min-w-[320px] min-h-[485px] sm:min-h-[553px]">
                        <CardContent className="p-0 h-full flex flex-col">
                          {/* Service Image */}
                          <div className="relative object-cover aspect-square overflow-hidden rounded-t-xl">
                            <img
                              src={getImageUrl(service)}
                              alt={service.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {/* Mobile Service Badge */}
                            {service.isMobileService && (
                              <div className="absolute top-2 left-2 bg-wrench-accent text-wrench-text-primary text-xs px-2 py-1 rounded-full flex items-center">
                                <Wrench className="h-3 w-3 mr-1" />
                                Mobile
                              </div>
                            )}
                          </div>

                          {/* Service Details */}
                          <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                            <div className="space-y-2">
                              {/* Price */}
                              <div className="flex items-center space-x-2">
                                <span className="text-lg sm:text-xl font-bold text-wrench-accent">
                                  {formatPrice(service.price)}
                                </span>
                                <span className="text-xs sm:text-sm text-wrench-text-secondary">
                                  per service
                                </span>
                              </div>

                              {/* Title */}
                              <h3 className="font-semibold text-wrench-text-primary group-hover:text-wrench-accent line-clamp-2 text-sm sm:text-base">
                                {service.title}
                              </h3>

                              {/* Duration */}
                              <div className="flex items-center text-xs sm:text-sm text-wrench-text-secondary">

                              </div>

                              {/* Location */}
                              <div className="flex items-center justify-between text-xs sm:text-sm text-wrench-text-secondary">
                                <div className="flex items-center">
                                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                  <span className="line-clamp-1">
                                    {service.seller.city}, {service.seller.area}
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                  <span>{formatDuration(service.durationMinutes)}</span>
                                </div>

                              </div>

                              {/* Shop Name */}
                              <div className="flex items-center justify-between text-xs sm:text-sm text-wrench-text-secondary">
                                <div className="flex items-center">
                                  <Store className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                  <span className="line-clamp-1">{service.seller.shopName}</span>
                                </div>
                                <div className="flex items-center">
                                  <Tag className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                  <span className="line-clamp-1">{service.category.name}</span>
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
                                      className={`h-3 w-3 sm:h-4 sm:w-4 ${i < Math.floor(service.ratingAverage || 0)
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-300'
                                        }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-xs sm:text-sm text-wrench-text-secondary ml-1">
                                  ({service.ratingCount})
                                </span>
                              </div>
                              <div className="text-xs sm:text-sm text-wrench-text-secondary">
                                {service.isMobileService ? 'Mobile' : 'Shop'}
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <WishlistIcon
                              id={service.id}
                              type="service"
                              title={service.title}
                              price={service.price}
                              image={service.images?.[0] || ''}
                              category={service.category?.name}
                              sellerName={service.seller.shopName}
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
        {!isLoading && services.length > 0 && (
          <div className="text-center mt-8 sm:mt-12">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/services">
                <Button className="bg-wrench-accent text-wrench-text-primary hover:bg-wrench-accent-hover px-6 py-3">
                  View All Services
                </Button>
              </Link>
              <Link href="/services?sortBy=rating">
                <Button variant="outline" className="border-wrench-accent text-wrench-accent hover:bg-wrench-accent hover:text-black px-6 py-3">
                  Top Rated Services
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default TopServices;
