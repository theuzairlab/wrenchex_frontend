'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  MapPin, 
  Star, 
  Phone, 
  Package,
  Wrench,
  User,
  Navigation,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import ProductCard from '@/components/products/ProductCard';
import ServiceCard from '@/components/services/ServiceCard';
import { DirectionButton } from '@/components/location/DirectionButton';
import { DistanceDisplay } from '@/components/location/DistanceDisplay';
import { apiClient } from '@/lib/api/client';
import { Seller, Product, Service } from '@/types';

interface ShopPageData {
  seller: Seller;
  products: Product[];
  services: Service[];
  stats: {
    totalProducts: number;
    totalServices: number;
    totalRating: number;
    totalReviews: number;
    responseTime: string;
    membershipDuration: {
      value: string | number;
      unit: string;
      label: string;
    };
  };
}

export default function ShopPage() {
  const params = useParams();
  const sellerId = params.id as string;
  
  const [shopData, setShopData] = useState<ShopPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'services' | 'about'>('products');

  // Function to calculate membership duration
  const calculateMembershipDuration = (createdAt: string) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffInMs = now.getTime() - created.getTime();
    
    const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);
    
    if (years > 0) {
      return { value: years, unit: years === 1 ? 'Year' : 'Years', label: 'Member Since' };
    } else if (months > 0) {
      return { value: months, unit: months === 1 ? 'Month' : 'Months', label: 'Member Since' };
    } else if (days > 0) {
      return { value: days, unit: days === 1 ? 'Day' : 'Days', label: 'Member Since' };
    } else {
      return { value: 'New', unit: '', label: 'Member Since' };
    }
  };

  useEffect(() => {
    if (sellerId) {
      fetchShopData(sellerId);
    }
  }, [sellerId]);

  const fetchShopData = async (id: string) => {
    try {
      setLoading(true);
      
      // Fetch seller details
      const sellerResponse = await apiClient.get(`/sellers/public/${id}`);
      
      // Fetch seller's products
      const productsResponse = await apiClient.get(`/products?sellerId=${id}&limit=20`);
      
      // Fetch seller's services
      const servicesResponse = await apiClient.get(`/services?sellerId=${id}&limit=20`);
      
      if (sellerResponse.success) {
        const seller = sellerResponse.data;
        const products = productsResponse.success ? productsResponse.data.products || [] : [];
        const services = servicesResponse.success ? servicesResponse.data.services || [] : [];
        
        // Calculate stats
        const membershipDuration = seller.createdAt ? calculateMembershipDuration(seller.createdAt) : { value: 'New', unit: '', label: 'Member Since' };
        
        const stats = {
          totalProducts: products.length,
          totalServices: services.length,
          totalRating: seller.ratingAverage || 0,
          totalReviews: seller.ratingCount || 0,
          responseTime: '2-4 hours', // Mock data
          membershipDuration: membershipDuration
        };
        
        setShopData({
          seller,
          products,
          services,
          stats
        });
      } else {
        setError('Shop not found');
      }
    } catch (err) {
      console.error('Error fetching shop data:', err);
      setError('Failed to load shop information');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4F142]"></div>
      </div>
    );
  }

  if (error || !shopData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Shop Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The shop you\'re looking for doesn\'t exist.'}</p>
          <Button onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const { seller, products, services, stats } = shopData;

  return (
    <div className="min-h-screen bg-wrench-bg-primary">
      {/* Header Section */}
      <div className="bg-wrench-bg-primary shadow-sm pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Shop Info */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row items-start gap-4">
                {/* Shop Avatar */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#D4F142] to-[#9CB833] rounded-full flex items-center justify-center text-black text-xl sm:text-2xl font-bold flex-shrink-0">
                  {seller.shopName.charAt(0).toUpperCase()}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{seller.shopName}</h1>
                    {seller.isApproved && (
                      <Badge variant="default" className="bg-green-100 text-green-800 self-start">
                        <Shield className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>

                  {/* Rating */}
                  {stats.totalRating > 0 && (
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= Math.round(stats.totalRating)
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium">{stats.totalRating.toFixed(1)}</span>
                      <span className="text-sm text-gray-600">({stats.totalReviews} reviews)</span>
                    </div>
                  )}
                  
                  {/* Address */}
                  <div className="flex items-center gap-2 text-gray-600 mb-3">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">
                      {seller.shopAddress || `${seller.area}, ${seller.city}`}
                </span>
              </div>
                  
                  {/* Distance */}
                  <DistanceDisplay
                    sellerLatitude={seller.latitude}
                    sellerLongitude={seller.longitude}
                    sellerCity={seller.city}
                    sellerArea={seller.area}
                    className="text-sm"
                    showIcon={true}
                    showFallbackLocation={true}
                  />
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 mt-4 lg:mt-0">
              
              {seller.latitude && seller.longitude ? (
                <DirectionButton
                  destination={{
                    latitude: seller.latitude,
                    longitude: seller.longitude,
                    address: seller.shopAddress || `${seller.area}, ${seller.city}`,
                    name: seller.shopName
                  }}
                  size="md"
                  variant="primary"
                  className="bg-[#D4F142] hover:bg-[#9CB833]"
                />
              ) : (
                <Button
                  variant="primary"
                  size="md"
                  className="border-[#D4F142] text-[#D4F142] hover:bg-[#D4F142] hover:text-black"
                  onClick={() => {
                    // Open maps with just the address
                    const address = seller.shopAddress || `${seller.area}, ${seller.city}`;
                    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
                    window.open(mapsUrl, '_blank');
                  }}
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Get Directions (Address Only)
                </Button>
              )}
              
              <Button 
                variant="primary" 
                className="flex items-center gap-2 border-[#D4F142] text-[#D4F142] hover:bg-[#D4F142] hover:text-black"
                onClick={() => {
                  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
                  if (isMobile) {
                    window.open(`tel:${seller.user?.phone}`, '_blank');
                  } else {
                    alert(`Contact Number: ${seller.user?.phone}`);
                  }
                }}
              >
                <Phone className="h-4 w-4" />
                Contact Shop
              </Button>
            </div>
          </div>
        </div>
          </div>

      {/* Stats Section */}
      <div className="bg-wrench-bg-primary border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalProducts}</div>
              <div className="text-xs sm:text-sm text-gray-600">Products</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalServices}</div>
              <div className="text-xs sm:text-sm text-gray-600">Services</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-gray-900">{stats.responseTime}</div>
              <div className="text-xs sm:text-sm text-gray-600">Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-gray-900">
                {stats?.membershipDuration.value}
                {stats?.membershipDuration.unit && ` ${stats.membershipDuration.unit}`}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">{stats?.membershipDuration.label}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Tabs */}
        <div className="flex flex-wrap border-b border-gray-200 mb-6 lg:mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 sm:px-6 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'products'
                ? 'border-[#D4F142] text-[#D4F142]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Package className="h-4 w-4 inline mr-2" />
            Products ({stats.totalProducts})
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`px-4 sm:px-6 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'services'
                ? 'border-[#D4F142] text-[#D4F142]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Wrench className="h-4 w-4 inline mr-2" />
            Services ({stats.totalServices})
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`px-4 sm:px-6 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'about'
                ? 'border-[#D4F142] text-[#D4F142]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <User className="h-4 w-4 inline mr-2" />
            About
          </button>
            </div>

        {/* Tab Content */}
        <div className="min-h-[300px] sm:min-h-[400px]">
          {activeTab === 'products' && (
            <div>
            {products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Products Available</h3>
                  <p className="text-gray-600">This shop hasn't listed any products yet.</p>
              </div>
            )}
            </div>
          )}

          {activeTab === 'services' && (
            <div>
            {services.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {services.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                  <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Services Available</h3>
                  <p className="text-gray-600">This shop doesn't offer any services yet.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'about' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {/* Shop Information */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Shop Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Business Type</label>
                    <p className="text-gray-900">{seller.businessType || 'General'}</p>
                  </div>
                  
                  {seller.shopDescription && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Description</label>
                      <p className="text-gray-900">{seller.shopDescription}</p>
                    </div>
                  )}
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Member Since</label>
                    <p className="text-gray-900">
                      {seller.createdAt ? new Date(seller.createdAt).toLocaleDateString() : 'Recently joined'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Location</label>
                    <p className="text-gray-900">{seller.city}, {seller.area}</p>
                  </div>
                </div>
              </Card>

              {/* Contact & Location */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Contact & Location</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Full Address</label>
                    <p className="text-gray-900">
                      {seller.shopAddress || `${seller.area}, ${seller.city}`}
                    </p>
                  </div>
                  
                  {seller.latitude && seller.longitude && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">City & Area</label>
                      <p className="text-gray-900 text-sm">
                        City: {seller.city}, Area: {seller.area}
                      </p>
              </div>
            )}
                  
                  <div className="pt-4">
                    
                    {seller.latitude && seller.longitude ? (
                      <DirectionButton
                        destination={{
                          latitude: seller.latitude,
                          longitude: seller.longitude,
                          address: seller.shopAddress || `${seller.area}, ${seller.city}`,
                          name: seller.shopName
                        }}
                        size="lg"
                        variant="primary"
                        className="w-full bg-[#D4F142] hover:bg-[#9CB833] text-black"
                      />
                    ) : (
                      <Button
                        variant="primary"
                        size="lg"
                        className="w-full border-[#D4F142] text-[#D4F142] hover:bg-[#D4F142] hover:text-black"
                        onClick={() => {
                          // Open maps with just the address
                          const address = seller.shopAddress || `${seller.area}, ${seller.city}`;
                          const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
                          window.open(mapsUrl, '_blank');
                        }}
                      >
                        <Navigation className="h-4 w-4 mr-2" />
                        Get Directions (Address Only)
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}