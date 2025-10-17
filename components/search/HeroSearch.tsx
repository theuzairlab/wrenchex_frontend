'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Clock, TrendingUp, Filter, MapPin, Package, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn, formatPrice } from '@/lib/utils';
import { apiClient } from '@/lib/api/client';
import { Product, Category } from '@/types';
import { useLocationContext } from '@/lib/contexts/LocationContext';
import { useTranslations } from 'next-intl';

interface SearchSuggestion {
  type: 'product' | 'service' | 'category' | 'brand' | 'recent' | 'trending';
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  url: string;
  badge?: string;
}

interface HeroSearchProps {
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
  onSearch?: () => void; 
}

const HeroSearch = ({ 
  className,
  placeholder = "Search for auto parts, services, or categories...", 
  autoFocus = false,
  onSearch,
}: HeroSearchProps) => {
  const router = useRouter();
  const { location } = useLocationContext();
  const t = useTranslations('globalSearch');
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('wrench_recent_searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading recent searches:', error);
      }
    }
  }, []);

  // Save recent search
  const saveRecentSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    const updated = [
      searchQuery,
      ...recentSearches.filter(s => s !== searchQuery)
    ].slice(0, 5); // Keep only 5 recent searches
    
    setRecentSearches(updated);
    localStorage.setItem('wrench_recent_searches', JSON.stringify(updated));
  }, [recentSearches]);

  // Fetch search suggestions for both products and services
  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const suggestions: SearchSuggestion[] = [];

      // Search both products and services in parallel
      const [productsResponse, servicesResponse, categoriesResponse, serviceCategoriesResponse] = await Promise.all([
        apiClient.searchProducts(searchQuery, { limit: 3 }),
        apiClient.searchServices(searchQuery, { limit: 3 }),
        apiClient.getCategories(),
        apiClient.getServiceCategories()
      ]);

      // Add product suggestions
      if (productsResponse.success && productsResponse.data?.products) {
        productsResponse.data.products.forEach(product => {
          suggestions.push({
            type: 'product',
            id: product.id,
            title: product.title,
            subtitle: `${formatPrice(product.price || 0, product.currency || 'AED', 'en')} • ${product.seller?.shopName || 'Auto Parts Store'}`,
            image: product.images?.[0] || product.productImages?.[0]?.url,
            url: `/products/${product.id}`,
            badge: 'Product'
          });
        });
      }

      // Add service suggestions
      if (servicesResponse.success && servicesResponse.data?.services) {
        servicesResponse.data.services.forEach((service: any) => {
          suggestions.push({
            type: 'service',
            id: service.id,
            title: service.title,
            subtitle: `${formatPrice(service.price || 0, service.currency || 'AED', 'en')} • ${service.seller?.shopName || 'Service Provider'}`,
            image: service.images?.[0],
            url: `/services/${service.id}`,
            badge: 'Service'
          });
        });
      }

      // Add product category suggestions
      if (categoriesResponse.success && categoriesResponse.data) {
        const categories = Array.isArray(categoriesResponse.data) 
          ? categoriesResponse.data 
          : (categoriesResponse.data as any)?.categories || [];
        
        const matchingCategories = categories.filter((category: any) =>
          category.name.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 2);

        matchingCategories.forEach((category: any) => {
          suggestions.push({
            type: 'category',
            id: category.id,
            title: category.name,
            subtitle: `${category.productCount || 0} products`,
            url: `/products?category=${category.id}`,
            badge: 'Category'
          });
        });
      }

      // Add service category suggestions
      if (serviceCategoriesResponse.success && serviceCategoriesResponse.data) {
        serviceCategoriesResponse.data
          .filter((cat: any) => cat.name.toLowerCase().includes(searchQuery.toLowerCase()))
          .slice(0, 2)
          .forEach((category: any) => {
            suggestions.push({
              type: 'category',
              id: category.id,
              title: category.name,
              subtitle: 'Service Category',
              url: `/services?category=${category.id}`,
              badge: 'Service Category'
            });
          });
      }

      setSuggestions(suggestions);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle input change with debouncing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (debounceRef.current !== undefined) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  };

  // Handle search submission
  const handleSearch = (searchQuery?: string) => {
    const finalQuery = searchQuery || query;
    if (!finalQuery.trim()) return;

    saveRecentSearch(finalQuery);
    setIsOpen(false);
    setQuery('');
    
    // Build search URL with location if available
    let searchUrl = '';
    const locationParams = new URLSearchParams();
    
    if (location) {
      locationParams.set('latitude', location.latitude.toString());
      locationParams.set('longitude', location.longitude.toString());
      const locationStr = location.city && location.area 
        ? `${location.area}, ${location.city}`
        : location.city || 'Current Location';
      locationParams.set('location', locationStr);
    }
    
    // Default to products search
    searchUrl = `/search?q=${encodeURIComponent(finalQuery)}`;
    if (locationParams.toString()) {
      searchUrl += `&${locationParams.toString()}`;
    }
    
    router.push(searchUrl);
    onSearch?.();
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'recent') {
      setQuery(suggestion.title);
      handleSearch(suggestion.title);
    } else {
      setIsOpen(false);
      router.push(suggestion.url);
      onSearch?.();
    }
  };

  // Handle key down
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  // Handle focus
  const handleFocus = () => {
    setIsOpen(true);
    if (!query && recentSearches.length > 0) {
      const recentSuggestions: SearchSuggestion[] = recentSearches.map(search => ({
        type: 'recent',
        id: search,
        title: search,
        url: `/search?q=${encodeURIComponent(search)}`
      }));
      setSuggestions(recentSuggestions);
    }
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (debounceRef.current !== undefined) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Trending searches
  const trendingSearches = [
    'brake pads',
    'oil filter',
    'spark plugs',
    'headlights',
    'tires'
  ];

  return (
    <div ref={searchRef} className={cn("relative z-50", className)}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={location 
            ? t('searchNearLocation', { location: location.city || t('yourLocation') })
            : placeholder
          }
          autoFocus={autoFocus}
          className="block w-full pl-10 pr-6 py-3 border border-gray-300 rounded-lg bg-white/40 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-wrench-accent focus:border-wrench-accent text-sm"
        />

        {/* Location Indicator */}
        {location && (
          <div className="absolute bottom-0 left-10 transform translate-y-full">
            <div className="flex items-center text-xs text-green-600 bg-green-50 px-2 py-1 rounded-b border border-t-0 border-green-200">
              <MapPin className="h-3 w-3 mr-1" />
              {t('locationBasedSearchEnabled')}
            </div>
          </div>
        )}

        <div className="absolute inset-y-0 right-0 flex items-center">
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setSuggestions([]);
                inputRef.current?.focus();
              }}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Search Dropdown */}
      {isOpen && (
        <div className="absolute z-[9999] w-full top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center">
              <div className="animate-spin h-5 w-5 border-2 border-wrench-accent border-t-transparent rounded-full mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">{t('searching')}</p>
            </div>
          ) : suggestions.length > 0 ? (
            <div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={`${suggestion.type}-${suggestion.id}`}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full flex items-center px-4 py-3 hover:bg-gray-50 text-left border-b border-gray-100 last:border-b-0"
                >
                  {/* Suggestion Icon */}
                  <div className="flex-shrink-0 mr-3">
                    {(suggestion.type === 'product' || suggestion.type === 'service') && suggestion.image ? (
                      <img
                        src={suggestion.image}
                        alt={suggestion.title}
                        className="w-8 h-8 object-cover rounded"
                      />
                    ) : suggestion.type === 'service' ? (
                      <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                        <Wrench className="h-4 w-4 text-blue-600" />
                      </div>
                    ) : suggestion.type === 'product' ? (
                      <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                        <Package className="h-4 w-4 text-green-600" />
                      </div>
                    ) : suggestion.type === 'recent' ? (
                      <Clock className="h-5 w-5 text-gray-400" />
                    ) : suggestion.type === 'category' ? (
                      <Filter className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Search className="h-5 w-5 text-gray-400" />
                    )}
                  </div>

                  {/* Suggestion Content */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {suggestion.title}
                    </div>
                    {suggestion.subtitle && (
                      <div className="text-xs text-gray-500 truncate">
                        {suggestion.subtitle}
                      </div>
                    )}
                  </div>

                  {/* Badge */}
                  {suggestion.badge && (
                    <div className="flex-shrink-0 ml-2">
                      <span className={cn(
                        "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                        suggestion.badge === 'Product' 
                          ? "bg-green-100 text-green-800"
                          : suggestion.badge === 'Service'
                          ? "bg-blue-100 text-blue-800"
                          : suggestion.badge === 'Category'
                          ? "bg-purple-100 text-purple-800"
                          : suggestion.badge === 'Service Category'
                          ? "bg-orange-100 text-orange-800"
                          : "bg-gray-100 text-gray-800"
                      )}>
                        {suggestion.badge}
                      </span>
                    </div>
                  )}

                  {/* Suggestion Type Badge */}
                  <div className="flex-shrink-0 ml-2">
                    {suggestion.type === 'trending' && (
                      <TrendingUp className="h-4 w-4 text-wrench-accent" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : query ? (
            <div className="p-4 text-center">
              <p className="text-sm text-gray-500 mb-3">{t('noSuggestionsFound')}</p>
              <Button
                size="sm"
                onClick={() => handleSearch()}
                className="w-full"
              >
                {t('searchFor', { query })}
              </Button>
            </div>
          ) : (
            <div className="p-4">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    {t('recentSearches')}
                  </h4>
                  <div className="space-y-1">
                    {recentSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick({
                          type: 'recent',
                          id: search,
                          title: search,
                          url: `/search?q=${encodeURIComponent(search)}`
                        })}
                        className="flex items-center w-full px-2 py-1 text-sm text-gray-700 hover:bg-gray-50 rounded"
                      >
                        <Clock className="h-4 w-4 text-gray-400 mr-2" />
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending Searches */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  {t('trendingSearches')}
                </h4>
                <div className="space-y-1">
                  {trendingSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick({
                        type: 'trending',
                        id: search,
                        title: search,
                        url: `/search?q=${encodeURIComponent(search)}`
                      })}
                      className="flex items-center w-full px-2 py-1 text-sm text-gray-700 hover:bg-gray-50 rounded"
                    >
                      <TrendingUp className="h-4 w-4 text-wrench-accent mr-2" />
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HeroSearch;
