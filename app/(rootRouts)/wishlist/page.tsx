'use client';

import { useState } from 'react';
import { useWishlistStore } from '@/lib/stores/wishlist';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Heart, Trash2, ShoppingCart, Calendar, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function WishlistPage() {
  const { items, getProducts, getServices, clearWishlist, removeItem } = useWishlistStore();
  const [activeTab, setActiveTab] = useState<'all' | 'products' | 'services'>('all');

  const products = getProducts();
  const services = getServices();

  const getDisplayItems = () => {
    switch (activeTab) {
      case 'products':
        return products;
      case 'services':
        return services;
      default:
        return items;
    }
  };

  const displayItems = getDisplayItems();

  const removeFromWishlist = (id: string, type: 'product' | 'service') => {
    removeItem(id, type);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Heart className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Wishlist is Empty</h1>
            <p className="text-lg text-gray-600 mb-8">
              Start adding products and services to your wishlist to see them here.
            </p>
            <div className="space-x-4">
              <Link href="/products">
                <Button className="bg-wrench-orange-500 hover:bg-wrench-orange-600">
                  Browse Products
                </Button>
              </Link>
              <Link href="/services">
                <Button variant="outline">
                  Browse Services
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
              <p className="text-gray-600 mt-2">
                {items.length} item{items.length !== 1 ? 's' : ''} in your wishlist
              </p>
            </div>
            <Button
              variant="outline"
              onClick={clearWishlist}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm mb-6">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${activeTab === 'all'
                ? 'bg-wrench-orange-500 text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
          >
            All ({items.length})
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${activeTab === 'products'
                ? 'bg-wrench-orange-500 text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
          >
            Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${activeTab === 'services'
                ? 'bg-wrench-orange-500 text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
          >
            Services ({services.length})
          </button>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayItems.map((item) => (
            <Card key={`${item.type}-${item.id}`} className="group hover:shadow-lg transition-shadow">
              <CardHeader className="p-0 relative">
                <div className="relative aspect-square overflow-hidden rounded-t-lg">
                  <Image
                    src={item.image || '/placeholder-image.jpg'}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />

                  {/* Type Badge */}
                  <Badge
                    className={`absolute top-2 left-2 ${item.type === 'product'
                        ? 'bg-blue-500 hover:bg-blue-600'
                        : 'bg-green-500 hover:bg-green-600'
                      }`}
                  >
                    {item.type === 'product' ? 'Product' : 'Service'}
                  </Badge>

                  {/* Category Badge */}
                  {item.category && (
                    <Badge variant="secondary" className="absolute top-2 left-20">
                      {item.category}
                    </Badge>
                  )}

                  {/* Remove from Wishlist Heart Icon */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeFromWishlist(item.id, item.type);
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                    title="Remove from wishlist"
                  >
                    <Heart className="h-4 w-4 fill-current" />
                  </button>
                </div>
              </CardHeader>

              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {item.title}
                </h3>

                {item.sellerName && (
                  <p className="text-sm text-gray-600 mb-2">
                    by {item.sellerName}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-wrench-orange-600">
                    ${item.price}
                  </span>

                  <div className="flex space-x-2">

                    {item.type === 'product' ? (
                      <Link href={`/products/${item.id}`} className="w-full">
                      <Button 
                        size="sm" 
                        className="w-full"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Let's Chat
                      </Button>
                    </Link>
                    ) : (
                      <Link href={`/services/${item.id}`}>
                        <Button size="sm">Book Now</Button>
                      </Link>
                    )}
                  </div>
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  Added {new Date(item.addedAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {displayItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No {activeTab === 'all' ? '' : activeTab} in your wishlist.</p>
          </div>
        )}
      </div>
    </div>
  );
}
