'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api/client';
import type { Category } from '@/types';
import { Card, CardContent } from '@/components/ui/Card';
import {
  Car,
  Wrench,
  Battery,
  Gauge,
  Zap,
  Shield,
  Settings,
  Truck,
  Filter,
  Boxes,
} from 'lucide-react';

type IconType = React.ComponentType<{ className?: string }>;

const iconMap: Record<string, IconType> = {
  Engine: Car,
  'Engine Parts': Car,
  Brakes: Shield,
  'Brake System': Shield,
  Electrical: Zap,
  Battery: Battery,
  Filters: Filter,
  'Filters & Fluids': Filter,
  Transmission: Settings,
  Suspension: Truck,
  Wheels: Truck,
  Tires: Truck,
  Diagnostics: Gauge,
  default: Wrench,
};

function getIconFor(name: string): IconType {
  // Try exact match, then partial contains of known keys
  const exact = iconMap[name];
  if (exact) return exact;
  const key = Object.keys(iconMap).find(k => name.toLowerCase().includes(k.toLowerCase()));
  return (key ? iconMap[key] : iconMap.default) as IconType;
}

export function TopCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.getCategories();
        const items = Array.isArray(response?.data)
          ? (response.data as Category[])
          : (response as any)?.data?.categories || [];
        if (mounted) setCategories(items);
      } catch (err: any) {
        if (mounted) setError(err?.message || 'Failed to load categories');
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const items = useMemo(() => categories, [categories]);

  const scrollByAmount = (direction: 'left' | 'right') => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = Math.min(320, el.clientWidth * 0.8);
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-wrench-text-primary">Top Categories</h2>
          <p className="text-wrench-text-secondary mt-2 text-sm sm:text-base">Browse our most popular categories</p>
        </div>

        {isLoading ? (
          <div className="flex gap-3 sm:gap-4 overflow-x-auto py-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="min-w-[200px] sm:min-w-[240px] h-24 sm:h-28 rounded-xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : (
          <div className="relative">
            {/* Controls (md and up) */}
            <button
              type="button"
              aria-label="Scroll left"
              onClick={() => scrollByAmount('left')}
              className="hidden md:flex absolute -left-16 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full bg-white border border-gray-200 shadow-wrench-card hover:shadow-wrench-hover"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Scroll right"
              onClick={() => scrollByAmount('right')}
              className="hidden md:flex absolute -right-16 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full bg-white border border-gray-200 shadow-wrench-card hover:shadow-wrench-hover"
            >
              ›
            </button>
            <div
              ref={scrollerRef}
              className="overflow-x-auto -mx-4 px-4 scroll-smooth snap-x snap-mandatory scrollbar-none"
            >
              <div className="flex gap-3 sm:gap-4 py-2">
                {items.map((cat) => {
                  const Icon = getIconFor(cat.name || '');
                  return (
                    <Link key={cat.id} href={`/products?category=${encodeURIComponent(cat.id)}`} className="snap-start">
                      <Card className="group hover:shadow-wrench-hover transition-all duration-200 border-0 shadow-wrench-card bg-white cursor-pointer min-w-[200px] sm:min-w-[240px] min-h-[200px] sm:min-h-[240px]">
                        <CardContent className="p-4 sm:p-5 flex items-center flex-col justify-center gap-4">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-wrench-accent/20 flex items-center justify-center mr-3 sm:mr-4 group-hover:scale-105 transition-transform">
                            <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-wrench-text-primary" />
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-wrench-text-primary group-hover:text-wrench-accent line-clamp-1 text-sm sm:text-base">{cat.name}</div>
                            {cat.description && (
                              <div className="text-xs sm:text-sm text-wrench-text-secondary line-clamp-2">{cat.description}</div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default TopCategories;


