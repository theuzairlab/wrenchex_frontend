'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Filter, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Star,
  Package,
  Search,
  MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Category } from '@/types';
import { useTranslations } from 'next-intl';

interface ProductFiltersProps {
  categories: Category[];
  currentFilters: Record<string, string | undefined>;
  totalProducts: number;
  availableFilters?: {
    categories?: Array<{ id: string; name: string; count: number }>;
    priceRange?: { min: number; max: number };
    conditions?: Array<{ value: string; count: number }>;
  };
}

interface FilterSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  count?: number;
}

const FilterSection = ({ 
  title, 
  icon, 
  children, 
  defaultOpen = false,
  count 
}: FilterSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-200 pb-4 mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-2 text-left"
      >
        <div className="flex items-center space-x-2">
          {icon}
          <span className="font-medium text-gray-900">{title}</span>
          {count !== undefined && (
            <span className="text-sm text-gray-500">({count})</span>
          )}
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        )}
      </button>
      
      {isOpen && (
        <div className="mt-3 space-y-2">
          {children}
        </div>
      )}
    </div>
  );
};

const ProductFilters = ({ 
  categories, 
  currentFilters, 
  totalProducts, 
  availableFilters 
}: ProductFiltersProps) => {
  const t = useTranslations('common');
  // Ensure categories is always an array
  const safeCategories = Array.isArray(categories) ? categories : [];
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [priceRange, setPriceRange] = useState({
    min: currentFilters.minPrice || '',
    max: currentFilters.maxPrice || '',
  });
  
  const [searchQuery, setSearchQuery] = useState(currentFilters.search || '');

  // Helper to update URL with new filters
  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value && value !== '') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    // Reset to first page when filtering
    params.delete('page');
    
    // Use shallow routing to prevent page refresh
    router.push(`/products?${params.toString()}`, { scroll: false });
  };

  // Clear all filters
  const clearAllFilters = () => {
    router.replace('/products');
  };

  // Apply price range filter
  const applyPriceFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (priceRange.min) {
      params.set('minPrice', priceRange.min);
    } else {
      params.delete('minPrice');
    }
    
    if (priceRange.max) {
      params.set('maxPrice', priceRange.max);
    } else {
      params.delete('maxPrice');
    }
    
    params.delete('page');
    router.replace(`/products?${params.toString()}`);
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilter('search', searchQuery.trim() || null);
  };


  // Count active filters (including location)
  const locationFilterActive = currentFilters.location || currentFilters.latitude;
  const activeFiltersCount = Object.values(currentFilters).filter(Boolean).length;

  const conditions = [
    { value: 'NEW', label: 'New', count: availableFilters?.conditions?.find((c: any) => c.value === 'NEW')?.count || 0 },
    { value: 'USED', label: 'Used', count: availableFilters?.conditions?.find((c: any) => c.value === 'USED')?.count || 0 },
    { value: 'REFURBISHED', label: 'Refurbished', count: availableFilters?.conditions?.find((c: any) => c.value === 'REFURBISHED')?.count || 0 },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      {/* Single Line Filters */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder={t('products.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
              className="pl-9 pr-3 py-2 text-sm"
            />
          </div>
        </div>

        {/* Category Dropdown */}
        <div className="min-w-[150px]">
          <select
            value={currentFilters.category || ''}
            onChange={(e) => updateFilter('category', e.target.value || null)}
            className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-wrench-accent"
          >
            <option value="">{t('products.allCategories')}</option>
            {safeCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Condition Dropdown */}
        <div className="min-w-[120px]">
          <select
            value={currentFilters.condition || ''}
            onChange={(e) => updateFilter('condition', e.target.value || null)}
            className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-wrench-accent"
          >
            <option value="">{t('searchFilters.condition')}</option>
            {conditions.map((condition) => (
              <option key={condition.value} value={condition.value}>
                {condition.label}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div className="flex items-center gap-2 min-w-[200px]">
          <Input
            type="number"
            placeholder={t('products.min')}
            value={priceRange.min}
            onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
            className="w-20 text-sm py-2"
          />
          <span className="text-gray-500">-</span>
          <Input
            type="number"
            placeholder={t('products.max')}
            value={priceRange.max}
            onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
            className="w-20 text-sm py-2"
          />
          <Button 
            size="sm" 
            onClick={applyPriceFilter}
            className="px-3 py-2"
          >
            {t('products.apply')}
          </Button>
        </div>


        {/* Clear Filters */}
        {activeFiltersCount > 0 && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={clearAllFilters}
            className="text-gray-600 hover:text-gray-800"
          >
            <X className="h-4 w-4 mr-1" />
            {t('products.clear')}
          </Button>
        )}
      </div>

    </div>
  );
};

export default ProductFilters;