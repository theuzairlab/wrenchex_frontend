'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Grid3X3, 
  List, 
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Tag,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import ProductCatalog from '@/components/products/ProductCatalog';
import { cn } from '@/lib/utils';
import { ProductSearchResult } from '@/types';
import { useTranslations } from 'next-intl';

interface SearchResultsProps {
  searchResult: ProductSearchResult;
  currentFilters: Record<string, string | undefined>;
  searchQuery: string;
}

const SearchSuggestions = ({ searchQuery }: { searchQuery: string }) => {
  const t = useTranslations('common.search');
  const pathname = usePathname();
  const currentLocale = pathname?.split('/').filter(Boolean)[0] === 'ar' ? 'ar' : 'en';
  // Generate smart suggestions based on the search query
  const suggestions = [
    `${searchQuery} filter`,
    `${searchQuery} genuine`,
    `${searchQuery} aftermarket`,
    `${searchQuery} OEM`,
  ].filter(s => s !== searchQuery);

  const relatedSearches = [
    'brake pads',
    'oil filter',
    'spark plugs',
    'air filter',
    'fuel pump',
    'radiator',
  ];

  if (suggestions.length === 0 && relatedSearches.length === 0) return null;

  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-6">
      <div className="flex items-center space-x-2 mb-3">
        <Lightbulb className="h-4 w-4 text-wrench-accent" />
        <h3 className="font-medium text-gray-900">{t('suggestions')}</h3>
      </div>
      
      <div className="space-y-3">
        {suggestions.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">{t('relatedTo', { query: searchQuery })}</h4>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <Link
                  key={index}
                  href={`/${currentLocale}/search?q=${encodeURIComponent(suggestion)}`}
                  className="inline-flex items-center px-3 py-1 bg-white border border-gray-300 rounded-full text-sm text-gray-700 hover:border-wrench-accent hover:text-wrench-accent transition-colors"
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {suggestion}
                </Link>
              ))}
            </div>
          </div>
        )}
        
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">{t('popularSearches')}</h4>
          <div className="flex flex-wrap gap-2">
            {relatedSearches.slice(0, 4).map((search, index) => (
              <Link
                key={index}
                href={`/${currentLocale}/search?q=${encodeURIComponent(search)}`}
                className="inline-flex items-center px-3 py-1 bg-white border border-gray-300 rounded-full text-sm text-gray-700 hover:border-wrench-accent hover:text-wrench-accent transition-colors"
              >
                <TrendingUp className="h-3 w-3 mr-1" />
                {search}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const SearchStats = ({ 
  searchResult, 
  searchQuery 
}: { 
  searchResult: ProductSearchResult; 
  searchQuery: string;
}) => {
  const t = useTranslations('common.search');
  const { total: totalCount, page: currentPage, pages: totalPages } = searchResult.pagination || {};
  
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <h3 className="font-medium text-blue-900 mb-2">{t('statistics')}</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <div className="font-semibold text-blue-900">{(totalCount || 0).toLocaleString()}</div>
          <div className="text-blue-700">{t('totalResults')}</div>
        </div>
        <div>
          <div className="font-semibold text-blue-900">{totalPages || 0}</div>
          <div className="text-blue-700">{t('pages')}</div>
        </div>
        <div>
          <div className="font-semibold text-blue-900">
            0
          </div>
          <div className="text-blue-700">{t('categories')}</div>
        </div>
        <div>
          <div className="font-semibold text-blue-900">
            0
          </div>
          <div className="text-blue-700">{t('brands')}</div>
        </div>
      </div>
    </div>
  );
};

const NoResultsMessage = ({ searchQuery }: { searchQuery: string }) => {
  const t = useTranslations('common.search');
  const pathname = usePathname();
  const currentLocale = pathname?.split('/').filter(Boolean)[0] === 'ar' ? 'ar' : 'en';
  return (
    <div className="text-center py-12">
      <div className="max-w-md mx-auto">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Grid3X3 className="h-12 w-12 text-gray-400" />
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          {t('noProducts')}
        </h3>
        
        <div className="space-y-4 text-gray-600">
          <p>{t('noProducts')}</p>
          
          <div className="bg-gray-50 rounded-lg p-4 text-left">
            <h4 className="font-medium text-gray-900 mb-2">{t('tryAdjusting')}</h4>
            <ul className="space-y-1 text-sm">
              <li>• {t('startSearching')}</li>
              <li>• {t('enterKeywords')}</li>
            </ul>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            <Link href={`/${currentLocale}/products`}>
              <Button variant="primary">
                {t('browseAllProducts')}
              </Button>
            </Link>
            <Link href={`/${currentLocale}/search/advanced`}>
              <Button variant="outline">
                {t('search')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const SearchResults = ({ searchResult, currentFilters, searchQuery }: SearchResultsProps) => {
  const { products: rawProducts } = searchResult;
  const totalCount = searchResult.pagination?.total || 0;
  const products = Array.isArray(rawProducts) ? rawProducts : [];

  // Show suggestions and stats for searches with results
  const showSuggestions = searchQuery && totalCount > 0 && totalCount < 10;
  const showStats = searchQuery && totalCount > 0;

  return (
    <div className="space-y-6">
      {/* Search Suggestions (shown when few results) */}
      {showSuggestions && <SearchSuggestions searchQuery={searchQuery} />}
      
      {/* Search Stats (shown when there are results) */}
      {showStats && <SearchStats searchResult={searchResult} searchQuery={searchQuery} />}

      {/* Results or No Results */}
      {products.length > 0 ? (
        <ProductCatalog 
          searchResult={searchResult}
          currentFilters={currentFilters}
        />
      ) : searchQuery ? (
        <NoResultsMessage searchQuery={searchQuery} />
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Enter a search term
          </h3>
          <p className="text-gray-600">
            Use the search box above to find auto parts and accessories.
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchResults;