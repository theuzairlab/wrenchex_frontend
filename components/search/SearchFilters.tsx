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
  DollarSign,
  Tag,
  Search,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import { Category, ProductSearchResult } from '@/types';

interface SearchFiltersProps {
  categories: Category[];
  currentFilters: Record<string, string | undefined>;
  totalProducts: number;
  availableFilters?: ProductSearchResult['filters'];
  searchQuery: string;
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

const SearchFilters = ({ 
  categories, 
  currentFilters, 
  totalProducts, 
  availableFilters,
  searchQuery 
}: SearchFiltersProps) => {
  // Ensure categories is always an array
  const safeCategories = Array.isArray(categories) ? categories : [];
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [priceRange, setPriceRange] = useState({
    min: currentFilters.minPrice || '',
    max: currentFilters.maxPrice || '',
  });

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
    
    router.push(`/search?${params.toString()}`);
  };

  // Clear all filters except search query
  const clearAllFilters = () => {
    const params = new URLSearchParams();
    if (searchQuery) {
      params.set('q', searchQuery);
    }
    router.push(`/search?${params.toString()}`);
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
    router.push(`/search?${params.toString()}`);
  };

  // Count active filters (excluding search query)
  const activeFiltersCount = Object.entries(currentFilters)
    .filter(([key, value]) => key !== 'q' && value)
    .length;

  // Get filtered categories (only show categories with products)
  const relevantCategories = availableFilters?.categories || 
    safeCategories.map(cat => ({ id: cat.id, name: cat.name, count: cat.productCount || 0 }));

  // Get filtered brands
  const availableBrands = availableFilters?.brands || [];

  const conditions = [
    { value: 'NEW', label: 'New', count: availableFilters?.conditions?.find(c => c.value === 'NEW')?.count || 0 },
    { value: 'USED', label: 'Used', count: availableFilters?.conditions?.find(c => c.value === 'USED')?.count || 0 },
    { value: 'REFURBISHED', label: 'Refurbished', count: availableFilters?.conditions?.find(c => c.value === 'REFURBISHED')?.count || 0 },
  ].filter(condition => condition.count > 0);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Refine Search</h3>
          {activeFiltersCount > 0 && (
            <span className="px-2 py-1 bg-wrench-accent text-black text-xs rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </div>
        
        {activeFiltersCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={clearAllFilters}
            className="text-gray-500 hover:text-gray-700"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>
        )}
      </div>

      {/* Search Query Display */}
      {searchQuery && (
        <div className="mb-6 p-3 bg-wrench-accent/5 rounded-lg border border-wrench-accent/20">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-wrench-accent" />
            <span className="text-sm text-gray-700">Searching for:</span>
            <span className="font-medium text-wrench-accent">"{searchQuery}"</span>
          </div>
          <div className="text-xs text-gray-600 mt-1">
            {totalProducts.toLocaleString()} results found
          </div>
        </div>
      )}

      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Active Filters</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(currentFilters).map(([key, value]) => {
              if (!value || key === 'q') return null;
              
              let displayValue = value;
              if (key === 'category') {
                const category = safeCategories.find(c => c.id === value);
                displayValue = category?.name || value;
              }
              
              return (
                <span
                  key={key}
                  className="inline-flex items-center px-3 py-1 bg-wrench-accent/10 text-wrench-accent-dark text-sm rounded-full"
                >
                  {displayValue}
                  <button
                    onClick={() => updateFilter(key, null)}
                    className="ml-2 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Categories Filter */}
      {relevantCategories.length > 0 && (
        <FilterSection
          title="Categories"
          icon={<Package className="h-4 w-4 text-gray-600" />}
          defaultOpen={!!currentFilters.category}
          count={relevantCategories.length}
        >
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {relevantCategories.map((category) => (
              <label key={category.id} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="category"
                  value={category.id}
                  checked={currentFilters.category === category.id}
                  onChange={(e) => updateFilter('category', e.target.checked ? e.target.value : null)}
                  className="text-wrench-accent focus:ring-wrench-accent border-gray-300"
                />
                <span className="text-sm text-gray-700 flex-1">{category.name}</span>
                {category.count > 0 && (
                  <span className="text-xs text-gray-500">({category.count})</span>
                )}
              </label>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Price Range Filter */}
      <FilterSection
        title="Price Range"
        icon={<DollarSign className="h-4 w-4 text-gray-600" />}
        defaultOpen={!!(currentFilters.minPrice || currentFilters.maxPrice)}
      >
        <div className="space-y-3">
          {availableFilters?.priceRange && (
            <div className="text-xs text-gray-600 mb-2">
              Available range: AED {availableFilters.priceRange.min.toLocaleString()} - AED {availableFilters.priceRange.max.toLocaleString()}
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Min Price</label>
              <Input
                type="number"
                placeholder="0"
                value={priceRange.min}
                onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                className="text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Max Price</label>
              <Input
                type="number"
                placeholder="10000"
                value={priceRange.max}
                onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                className="text-sm"
              />
            </div>
          </div>
          <Button 
            size="sm" 
            className="w-full" 
            onClick={applyPriceFilter}
          >
            Apply Price Filter
          </Button>
        </div>
      </FilterSection>

      {/* Brand Filter */}
      {availableBrands.length > 0 && (
        <FilterSection
          title="Brand"
          icon={<Tag className="h-4 w-4 text-gray-600" />}
          count={availableBrands.length}
        >
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {availableBrands.map((brand) => (
              <label key={brand.name} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="brand"
                  value={brand.name}
                  checked={currentFilters.brand === brand.name}
                  onChange={(e) => updateFilter('brand', e.target.checked ? e.target.value : null)}
                  className="text-wrench-accent focus:ring-wrench-accent border-gray-300"
                />
                <span className="text-sm text-gray-700 flex-1">{brand.name}</span>
                <span className="text-xs text-gray-500">({brand.count})</span>
              </label>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Condition Filter */}
      {conditions.length > 0 && (
        <FilterSection
          title="Condition"
          icon={<Package className="h-4 w-4 text-gray-600" />}
        >
          <div className="space-y-2">
            {conditions.map((condition) => (
              <label key={condition.value} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="condition"
                  value={condition.value}
                  checked={currentFilters.condition === condition.value}
                  onChange={(e) => updateFilter('condition', e.target.checked ? e.target.value : null)}
                  className="text-wrench-accent focus:ring-wrench-accent border-gray-300"
                />
                <span className="text-sm text-gray-700 flex-1">{condition.label}</span>
                <span className="text-xs text-gray-500">({condition.count})</span>
              </label>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-gray-200 space-y-3">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={() => router.push('/search/advanced')}
        >
          <Filter className="h-4 w-4 mr-2" />
          Advanced Search
        </Button>
        
        <div className="text-center text-sm text-gray-600">
          <Package className="h-4 w-4 inline mr-1" />
          {totalProducts.toLocaleString()} products found
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;