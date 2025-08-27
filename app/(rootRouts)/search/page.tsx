'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { apiClient } from '@/lib/api/client';
import { Product } from '@/types';
import { Search, Grid, List } from 'lucide-react';
import Link from 'next/link';
import ChatWithSellerButton from '@/components/chat/ChatWithSellerButton';

export default function SearchPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
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
      const response = await apiClient.searchProducts(query);
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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Search Products</h1>
        
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search for auto parts, tools, accessories..."
              className="pl-10"
            />
          </div>
          <Button 
            onClick={() => handleSearch()}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-gray-600">
            {products.length > 0 && `Found ${products.length} products`}
          </p>
          
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid size={16} />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
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
                  <h3 className="font-semibold text-gray-900 hover:text-blue-600 cursor-pointer line-clamp-2">
                    {product.title}
                  </h3>
                </Link>
                
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {product.description}
                </p>

                <div className="flex items-center justify-between mt-3">
                  <div>
                    <span className="text-lg font-bold text-green-600">
                      ${product.price.toFixed(2)}
                    </span>
                    {product.seller && (
                      <p className="text-xs text-gray-500">
                        by {product.seller.shopName}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <ChatWithSellerButton
                    productId={product.id}
                    sellerId={product.seller?.userId || ''}
                    sellerPhone={product.seller?.user?.phone}
                    showPhone={product.seller?.chatSettings?.showPhone}
                    className="w-full"
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}