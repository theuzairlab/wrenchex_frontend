import { useState, useEffect, useCallback, useRef } from 'react';

interface UseLiveSearchOptions {
  debounceMs?: number;
  minChars?: number;
  onSearch?: (filters: any) => Promise<void>;
}

export function useLiveSearch(options: UseLiveSearchOptions = {}) {
  const { debounceMs = 500, minChars = 0, onSearch } = options;
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef(true);
  
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [isSearching, setIsSearching] = useState(false);
  const [pathname, setPathname] = useState<string>('');

  // Stabilize onSearch to avoid re-running effect every render
  const onSearchRef = useRef<UseLiveSearchOptions['onSearch']>(onSearch);
  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  // Track last query to avoid redundant history updates/calls
  const lastQueryRef = useRef<string>('');
  const lastFiltersRef = useRef<string>('');

  // Initialize pathname on client
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPathname(window.location.pathname);
    }
  }, []);

  // Update URL and trigger search when filters change
  useEffect(() => {
    // Skip on initial mount to avoid double fetching
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Check if search query meets minimum character requirement
    const searchQuery = filters.search || '';
    if (searchQuery && searchQuery.length > 0 && searchQuery.length < minChars) {
      return;
    }

    debounceRef.current = setTimeout(async () => {
      // Build URL with all filters (sorted keys for stable string)
      const params = new URLSearchParams();
      Object.entries(filters)
        .sort(([a],[b]) => a.localeCompare(b))
        .forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.set(key, String(value));
          }
        });

      const queryString = params.toString();
      const filtersSignature = JSON.stringify(params.toString());

      // If nothing changed, do nothing
      if (queryString === lastQueryRef.current && filtersSignature === lastFiltersRef.current) {
        return;
      }

      lastQueryRef.current = queryString;
      lastFiltersRef.current = filtersSignature;

      // Update URL without page reload (only if changed)
      const currentPath = pathname || (typeof window !== 'undefined' ? window.location.pathname : '/');
      const newUrl = queryString ? `${currentPath}?${queryString}` : currentPath;
      if (typeof window !== 'undefined' && window.history && window.history.pushState) {
        const currentUrl = window.location.pathname + (window.location.search || '');
        if (currentUrl !== newUrl) {
          window.history.pushState({}, '', newUrl);
        }
      }

      // Call custom search handler if provided
      if (onSearchRef.current) {
        setIsSearching(true);
        try {
          await onSearchRef.current(filters);
        } catch (error) {
          // silent; caller handles toasts
          // console.error('Search error:', error);
        } finally {
          setIsSearching(false);
        }
      }
    }, debounceMs);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [filters, debounceMs, minChars, pathname]);

  const updateFilter = useCallback((key: string, value: any) => {
    setFilters(prev => {
      // If value is empty, remove the filter
      if (value === '' || value === null || value === undefined) {
        const { [key]: _removed, ...rest } = prev;
        return rest;
      }
      if (prev[key] === value) return prev; // no change
      return { ...prev, [key]: value };
    });
  }, []);

  const updateFilters = useCallback((newFilters: Record<string, any>) => {
    setFilters(prev => {
      const merged = { ...prev, ...newFilters };
      return merged;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    lastQueryRef.current = '';
    lastFiltersRef.current = '';
    const currentPath = pathname || (typeof window !== 'undefined' ? window.location.pathname : '/');
    if (typeof window !== 'undefined' && window.history && window.history.pushState) {
      window.history.pushState({}, '', currentPath);
    }
  }, [pathname]);

  const clearFilter = useCallback((key: string) => {
    setFilters(prev => {
      const { [key]: _removed, ...rest } = prev;
      return rest;
    });
  }, []);

  return {
    filters,
    updateFilter,
    updateFilters,
    clearFilters,
    clearFilter,
    isSearching
  };
}

