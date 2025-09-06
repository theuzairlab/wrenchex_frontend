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
import { HoverBorderGradient } from '../ui/hover-border-gradient';

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
              className="hidden md:flex absolute left-0 -top-6 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full bg-white border border-gray-200 shadow-wrench-card hover:shadow-wrench-hover"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Scroll right"
              onClick={() => scrollByAmount('right')}
              className="hidden md:flex absolute right-0 -top-6 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full bg-white border border-gray-200 shadow-wrench-card hover:shadow-wrench-hover"
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
                      <HoverBorderGradient
                        containerClassName="rounded-full p-[1px]"
                        className="bg-white text-black"
                        as="div"
                      >
                        <div className="group hover:shadow-wrench-hover transition-all duration-200 bg-white cursor-pointer w-[160px] h-[160px] sm:w-[180px] sm:h-[180px] rounded-full flex items-center flex-col justify-center gap-3 p-4">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-wrench-accent/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                            <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-wrench-text-primary" />
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-wrench-text-primary group-hover:text-wrench-accent line-clamp-1 text-xs sm:text-sm">{cat.name}</div>
                            {cat.description && (
                              <div className="text-xs text-wrench-text-secondary line-clamp-2 mt-1">{cat.description}</div>
                            )}
                          </div>
                        </div>
                      </HoverBorderGradient>
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


