'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { apiClient } from '@/lib/api/client';
import { Product } from '@/types';
import { Search, Grid, List, MessageCircle, MapPin } from 'lucide-react';
import Link from 'next/link';
import { LocationFilter } from '@/components/location/LocationFilter';
import LocationSearch from '@/components/services/LocationSearch';

export default function SearchPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Location state (like services page)
  const [location, setLocation] = useState('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [radiusKm, setRadiusKm] = useState(10);
  const [showLocationFilter, setShowLocationFilter] = useState(false);
  
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  useEffect(() => {
    if (initialQuery) {
      setSearchQuery(initialQuery);
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSearch = async (query: string = searchQuery) => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      // Build filters with location if available
      const filters: any = {
        search: query,
        page: 1,
        limit: 50
      };

      // Add location parameters if coordinates are available
      if (coordinates) {
        console.log('🌍 Using location-based search with coordinates:', coordinates, 'radius:', radiusKm);
        filters.latitude = coordinates.lat;
        filters.longitude = coordinates.lng;
        filters.radiusKm = radiusKm;
      } else {
        console.log('📍 No coordinates available, using regular search');
      }

      const response = await apiClient.getProducts(filters);
      
      if (response.success && response.data) {
        setProducts(response.data.products || []);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Location handlers (like services page)
  const handleLocationChange = (newLocation: string | null, coords?: { lat: number; lng: number }) => {
    setLocation(newLocation || '');
    setCoordinates(coords || null);
    // Trigger search when location changes
    if (searchQuery.trim()) {
      handleSearch();
    }
  };

  const handleRadiusChange = (newRadius: number) => {
    setRadiusKm(newRadius);
    // Trigger search when radius changes
    if (searchQuery.trim() && coordinates) {
      handleSearch();
    }
  };

  const handleUseCurrentLocation = () => {
    // This will trigger the location permission modal in LocationFilter
  };

  const handleClearLocation = () => {
    setLocation('');
    setCoordinates(null);
    setRadiusKm(10);
    // Trigger search when location is cleared
    if (searchQuery.trim()) {
      handleSearch();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Header */}
      <div className="mb-8 pt-20">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Search Products</h1>
        
        {/* Enhanced Search Section with Location */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
          {/* Main Search Row */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Search for auto parts, tools, accessories..."
                  className="pl-9 pr-3 py-2 text-sm"
                />
              </div>
            </div>

            {/* Location Search */}
            <div className="flex-1 min-w-[200px]">
              <LocationSearch
                value={location}
                onChange={(newLocation, coords) => {
                  setLocation(newLocation);
                  setCoordinates(coords || null);
                  // Trigger search when location changes
                  if (searchQuery.trim()) {
                    handleSearch();
                  }
                }}
                placeholder="Enter city or area"
                className="h-10 text-sm"
              />
            </div>

            {/* Search Button */}
            <Button 
              onClick={() => handleSearch()}
              disabled={loading}
              className="bg-wrench-accent hover:bg-wrench-accent-hover text-white px-6"
            >
              {loading ? 'Searching...' : 'Search'}
            </Button>

            {/* Location Filter Toggle */}
            <Button
              variant={location && coordinates ? "primary" : "outline"}
              size="sm"
              onClick={() => setShowLocationFilter(!showLocationFilter)}
              className="min-w-[120px]"
            >
              <MapPin className="h-4 w-4 mr-1" />
              {location && coordinates ? 'Distance ✓' : 'Distance'}
            </Button>
          </div>

          {/* Location Distance Filter Section */}
          {showLocationFilter && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <LocationFilter
                currentLocation={location}
                currentRadius={radiusKm}
                onLocationChange={handleLocationChange}
                onRadiusChange={handleRadiusChange}
                onUseCurrentLocation={handleUseCurrentLocation}
                onClearLocation={handleClearLocation}
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-gray-600">
            {products.length > 0 && `Found ${products.length} products`}
          </p>
          
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid size={16} />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* Search Results */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Searching products...</div>
        </div>
      ) : products.length === 0 ? (
        <Card className="p-8 text-center">
          <Search className="mx-auto mb-4 text-gray-400" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchQuery ? 'No products found' : 'Start searching'}
          </h3>
          <p className="text-gray-600">
            {searchQuery 
              ? `Try different keywords for "${searchQuery}"`
              : 'Enter keywords to find products'
            }
          </p>
        </Card>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
        }>
          {products.map((product) => (
            <Card key={product.id} className={`overflow-hidden hover:shadow-lg transition-shadow ${
              viewMode === 'list' ? 'flex' : ''
            }`}>
              {/* Product Image */}
              <div className={`${viewMode === 'list' ? 'w-48' : 'w-full h-48'} relative bg-gray-100`}>
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                <Link href={`/products/${product.id}`}>
                  <h3 className="font-semibold text-gray-900 hover:text-wrench-accent cursor-pointer line-clamp-2">
                    {product.title}
                  </h3>
                </Link>
                
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {product.description}
                </p>

                <div className="flex items-center justify-between mt-3">
                  <div>
                    <span className="text-lg font-bold text-wrench-accent">
                      AED {product.price.toFixed(2)}
                    </span>
                    {product.seller && (
                      <p className="text-xs text-gray-500">
                        by {product.seller.shopName}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <Link href={`/products/${product.id}`} className="w-full">
                    <Button size="sm" className="w-full">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Let's Chat
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}