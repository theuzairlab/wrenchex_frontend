'use client';

import { useState } from 'react';
import { WishlistIcon } from '@/components/ui/WishlistIcon';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Grid3X3, 
  List, 
  Star, 
  MapPin, 
  ShoppingCart, 
  Heart,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Filter,
  MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui_backup/Select';
import { cn } from '@/lib/utils';
import { ProductSearchResult, Product } from '@/types';

interface ProductCatalogProps {
  searchResult: ProductSearchResult;
  currentFilters: Record<string, string | undefined>;
}

interface ProductCardProps {
  product: Product;
  viewMode: 'grid' | 'list';
}

const ProductCard = ({ product, viewMode }: ProductCardProps) => {
  const [imageError, setImageError] = useState(false);

  const primaryImage = product.images?.[0] || product.productImages?.[0]?.url;
  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200">
        <div className="flex p-4 space-x-4">
          {/* Product Image */}
          <div className="flex-shrink-0">
            <Link href={`/products/${product.id}`}>
              <div className="relative w-32 h-32 bg-gray-100 rounded-lg overflow-hidden">
                {primaryImage && !imageError ? (
                  <Image
                    src={primaryImage}
                    alt={product.title}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-200"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <ShoppingCart className="h-8 w-8" />
                  </div>
                )}
                
                {discountPercentage > 0 && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                    -{discountPercentage}%
                  </div>
                )}
              </div>
            </Link>
          </div>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <Link href={`/products/${product.id}`}>
                  <h3 className="text-lg font-semibold text-gray-900 hover:text-wrench-accent transition-colors line-clamp-2">
                    {product.title}
                  </h3>
                </Link>
                
                <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                  {product.description}
                </p>

                <div className="flex items-center space-x-4 mt-2">
                  {product.brand && (
                    <span className="text-sm text-gray-500">
                      Brand: <span className="font-medium">{product.brand}</span>
                    </span>
                  )}
                  
                  {product.condition && (
                    <span className={cn(
                      "text-xs px-2 py-1 rounded-full",
                      product.condition === 'NEW' ? 'bg-green-100 text-green-700' :
                      product.condition === 'USED' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    )}>
                      {product.condition}
                    </span>
                  )}
                </div>

                {/* Seller Info */}
                <div className="flex items-center space-x-2 mt-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{product.seller.shopName}</span>

                </div>

                {/* Rating */}
                {/* {product.ratingAverage && product.ratingCount > 0 && (
                  <div className="flex items-center space-x-1 mt-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "h-4 w-4",
                            i < Math.floor(product.ratingAverage!)
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {product.ratingCount} reviews
                    </span>
                  </div>
                )} */}
              </div>

              {/* Price and Actions */}
              <div className="flex flex-col items-end space-y-2 ml-4">
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    AED {product.price.toLocaleString()}
                  </div>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <div className="text-sm text-gray-500 line-through">
                      AED {product.originalPrice.toLocaleString()}
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  <WishlistIcon
                    id={product.id}
                    type="product"
                    title={product.title}
                    price={product.price}
                    image={primaryImage || ''}
                    category={product.category?.name}
                    sellerName={product.seller.shopName}
                    size="sm"
                    className="static"
                  />
                </div>

                {/* Active Status */}
                <div className="text-xs text-gray-500">
                  {product.isActive ? (
                    <span className="text-green-600">
                      Available
                    </span>
                  ) : (
                    <span className="text-red-600">Not available</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className="group relative bg-white rounded-xl border border-gray-200 hover:border-wrench-accent/50 hover:shadow-2xl transition-all duration-300 overflow-hidden">
      {/* Product Image Section */}
      <Link href={`/products/${product.id}`}>
        <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
          {primaryImage && !imageError ? (
            <Image
              src={primaryImage}
              alt={product.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <ShoppingCart className="h-16 w-16" />
            </div>
          )}
          
          {/* Discount Badge */}
          {discountPercentage > 0 && (
            <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-lg">
              -{discountPercentage}% OFF
            </div>
          )}

          {/* Wishlist Icon */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <WishlistIcon
              id={product.id}
              type="product"
              title={product.title}
              price={product.price}
              image={primaryImage || ''}
              category={product.category?.name}
              sellerName={product.seller.shopName}
            />
          </div>

          {/* Status Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
            <div className="flex items-center justify-between">
              {product.condition && (
                <span className={cn(
                  "text-xs px-2 py-1 rounded-full font-semibold text-white",
                  product.condition === 'NEW' ? 'bg-green-500' :
                  product.condition === 'USED' ? 'bg-yellow-500' :
                  'bg-blue-500'
                )}>
                  {product.condition}
                </span>
              )}
              
              <div className="text-xs text-white font-medium">
                {product.isActive ? (
                  <span className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                    Available
                  </span>
                ) : (
                  <span className="flex items-center">
                    <div className="w-2 h-2 bg-red-400 rounded-full mr-2"></div>
                    Not Available
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Product Info Section */}
      <div className="p-4">
        {/* Title */}
        <Link href={`/products/${product.id}`}>
          <h3 className="font-bold text-gray-900 hover:text-wrench-accent transition-colors line-clamp-2 mb-3 text-base leading-tight group-hover:text-wrench-accent">
            {product.title}
          </h3>
        </Link>

        {/* Brand and Category */}
        <div className="flex items-center justify-between mb-3">
          {product.brand && (
            <span className="text-sm text-gray-600 font-medium bg-gray-100 px-2 py-1 rounded-md">
              {product.brand}
            </span>
          )}
          {product.category?.name && (
            <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
              {product.category.name}
            </span>
          )}
        </div>

        {/* Rating */}
        {/* {product.ratingAverage && product.ratingCount > 0 && (
          <div className="flex items-center space-x-2 mb-3">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-4 w-4",
                    i < Math.floor(product.ratingAverage!)
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300"
                  )}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600 font-medium">
              Product Rating: {product.ratingAverage.toFixed(1)} ({product.ratingCount})
            </span>
          </div>
        )} */}

        {/* Seller Info */}
        <div className="flex items-center space-x-2 mb-4 p-2 bg-gray-50 rounded-lg">
          <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0" />
          <span className="text-sm text-gray-700 font-medium truncate flex-1">
            {product.seller.shopName}
          </span>

        </div>

        {/* Price Section */}
        <div className="mb-4">
          <div className="flex items-baseline space-x-2 mb-2">
            <div className="text-2xl font-bold text-gray-900">
              AED {product.price.toLocaleString()}
            </div>
            {product.originalPrice && product.originalPrice > product.price && (
              <div className="text-lg text-gray-400 line-through">
                AED {product.originalPrice.toLocaleString()}
              </div>
            )}
          </div>
          
          {product.originalPrice && product.originalPrice > product.price && (
            <div className="text-sm text-green-600 font-semibold">
              Save AED {(product.originalPrice - product.price).toLocaleString()}!
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <Link href={`/products/${product.id}`} className="w-full">
            <Button 
              size="md" 
              className="w-full bg-wrench-accent hover:bg-wrench-accent-dark text-black font-bold transition-all duration-200 shadow-lg hover:shadow-xl"
              disabled={!product.isActive}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Chat with Seller
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

const ProductCatalog = ({ searchResult, currentFilters }: ProductCatalogProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Handle new data structure with pagination
  const rawProducts = searchResult?.products || [];
  const products = Array.isArray(rawProducts) ? rawProducts : [];
  const pagination = searchResult?.pagination || { total: 0, page: 1, pages: 0 };
  
  const totalCount = pagination.total;
  const currentPage = pagination.page;
  const totalPages = pagination.pages;
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  // Sorting options
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'popularity', label: 'Most Popular' },
    { value: 'title', label: 'Name A-Z' },
  ];

  const updateSort = (sortBy: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sortBy', sortBy);
    params.delete('page'); // Reset to first page
    router.replace(`/products?${params.toString()}`);
  };

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.replace(`/products?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      {/* Header with sorting and view options */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {totalCount.toLocaleString()} Products
            </h2>
            
            {currentFilters.search && (
              <span className="text-sm text-gray-600 bg-wrench-accent/10 text-wrench-accent-dark px-3 py-1.5 rounded-full font-medium">
                Search results for "{currentFilters.search}"
              </span>
            )}
          </div>

          <div className="flex items-center space-x-4 w-full lg:w-auto">
            {/* Sort Dropdown */}
            <div className="flex items-center space-x-2 flex-1 lg:flex-none">
              <ArrowUpDown className="h-5 w-5 text-gray-500" />
              <select
                value={currentFilters.sortBy || 'newest'}
                onChange={(e) => updateSort(e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-wrench-accent focus:border-wrench-accent flex-1 lg:flex-none min-w-0 bg-white"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden shadow-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-3 transition-all duration-200",
                  viewMode === 'grid'
                    ? "bg-wrench-accent text-black shadow-md"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                )}
                title="Grid View"
              >
                <Grid3X3 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-3 transition-all duration-200",
                  viewMode === 'list'
                    ? "bg-wrench-accent text-black shadow-md"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                )}
                title="List View"
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid/List */}
      {products.length > 0 ? (
        <div className={cn(
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
            : "space-y-6"
        )}>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              viewMode={viewMode}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No products found
          </h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search criteria or browse different categories.
          </p>
          <Button onClick={() => router.push('/products')}>
            Browse All Products
          </Button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 pt-6">
          <div className="text-sm text-gray-600">
            Showing page {currentPage} of {totalPages} ({totalCount.toLocaleString()} total products)
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage - 1)}
              disabled={!hasPreviousPage}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            
            {/* Page Numbers */}
            <div className="flex space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                return (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={cn(
                      "px-3 py-2 text-sm rounded-lg transition-colors",
                      pageNum === currentPage
                        ? "bg-wrench-accent text-black"
                        : "text-gray-600 hover:bg-gray-100"
                    )}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage + 1)}
              disabled={!hasNextPage}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCatalog;