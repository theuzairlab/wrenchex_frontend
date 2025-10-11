'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { apiClient } from '@/lib/api/client';
import type { Service } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Star, MapPin, Store, Tag, Clock, ChevronLeft, ChevronRight, Wrench, MessageCircle } from 'lucide-react';
import { GlowingEffect } from '../ui/glowing-effect';
import { WishlistIcon } from '../ui/WishlistIcon';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { formatPrice } from '@/lib/utils';

export function TopServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const tServices = useTranslations('common.services');
  const tCommon = useTranslations('common');
  const tSearch = useTranslations('common.search');
  const pathname = usePathname();
  const currentLocale = pathname?.split('/').filter(Boolean)[0] === 'ar' ? 'ar' : 'en';

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
        if (mounted) setError(err?.message || tServices('loading'));
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
            {tServices('heroTitle')}
          </h2>
          <p className="text-wrench-text-secondary text-sm sm:text-base">
            {tServices('heroSubtitle')}
          </p>
        </div>

        {isLoading ? (
          <div className="flex gap-4 sm:gap-6 overflow-x-auto py-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="min-w-[260px] sm:min-w-[280px] h-80 rounded-xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : (
          <div className="relative">
            {/* Navigation Arrows */}
            <button
              type="button"
              aria-label={tCommon('aria.scrollLeft')}
              onClick={() => scrollByAmount('left')}
              className="flex absolute left-0 -top-6 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full bg-white border border-gray-200 shadow-wrench-card hover:shadow-wrench-hover"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label={tCommon('aria.scrollRight')}
              onClick={() => scrollByAmount('right')}
              className="flex absolute right-0 -top-6 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full bg-white border border-gray-200 shadow-wrench-card hover:shadow-wrench-hover"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            {/* Services Carousel */}
            <div
              ref={scrollerRef}
              className="overflow-x-auto -mx-4 px-4 scroll-smooth snap-x snap-mandatory scrollbar-none"
            >
              <div className="flex gap-4 sm:gap-6 py-2">
                {topServices.map((service) => (
                  <div key={service.id} className="snap-start min-w-[330px] sm:min-w-[280px] lg:max-w-[280px]">
                    <Card className="group hover:shadow-lg transition-shadow p-3">
                      <CardHeader className="p-0 relative">
                        <div className="relative aspect-square overflow-hidden rounded-t-lg">
                          <Image
                            src={getImageUrl(service)}
                            alt={service.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                          
                          <div className="absolute top-2 left-2 flex gap-2">
                          {/* Category Badge */}
                          <Badge variant="secondary" className="">
                            {service.category.name}
                          </Badge>

                          {/* Mobile Service Badge */}
                          {service.isMobileService && (
                            <Badge className=" bg-wrench-accent text-wrench-nav-dark">
                              <Wrench className="h-3 w-3 mr-1" />
                              {tServices('mobileBadge')}
                            </Badge>
                          )}
                          </div>

                          {/* Wishlist Heart Icon */}
                          <div className="">
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
                        </div>
                      </CardHeader>

                      <CardContent className="pt-2">
                        <Link href={`/${currentLocale}/services/${service.id}`}>
                          <Button variant="link" className="font-semibold p-0 text-gray-900 mb-2 line-clamp-2">
                            {service.title}
                          </Button>
                        </Link>

                        <p className="text-sm text-gray-600 mb-2">
                          {tSearch('by')} {service.seller.shopName}
                        </p>

                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-wrench-orange-600">
                            {formatPrice(service.price, service.currency || 'AED', currentLocale)}
                          </span>

                          <div className="flex space-x-2">
                            <Link href={`/${currentLocale}/services/${service.id}`} className="w-full">
                              <Button 
                                size="sm" 
                                className="w-full"
                              >
                                <MessageCircle className="h-4 w-4 mr-2" />
                                {tServices('bookNow')}
                              </Button>
                            </Link>
                          </div>
                        </div>

                        {/* Duration and Location */}
                        <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{formatDuration(service.durationMinutes)}</span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span className="line-clamp-1">
                              {service.seller.city}, {service.seller.area}
                            </span>
                          </div>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                          <div className="flex items-center">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${i < Math.floor(service.ratingAverage || 0)
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                    }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-gray-500 ml-1">
                              ({service.ratingCount})
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {service.isMobileService ? tServices('mobileBadge') : tServices('shopBadge')}
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
        {!isLoading && services.length > 0 && (
          <div className="text-center mt-8 sm:mt-12">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href={`/${currentLocale}/services`}>
                <Button className="bg-wrench-accent text-wrench-text-primary hover:bg-wrench-accent-hover px-6 py-3">
                  {tServices('browseAllServices', { default: 'View All Services' })}
                </Button>
              </Link>
              <Link href={`/${currentLocale}/services?sortBy=rating`}>
                <Button variant="outline" className="border-wrench-accent text-wrench-accent hover:bg-wrench-accent hover:text-black px-6 py-3">
                  {tServices('topRatedServices', { default: 'Top Rated Services' })}
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
