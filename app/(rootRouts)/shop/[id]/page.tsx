'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
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
import { getShopRoleLabel } from '@/lib/utils';
import ProductCard from '@/components/products/ProductCard';
import ServiceCard from '@/components/services/ServiceCard';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/lib/stores/auth';
import { toast } from 'react-hot-toast';
import { DirectionButton } from '@/components/location/DirectionButton';
import { DistanceDisplay } from '@/components/location/DistanceDisplay';
import { Seller, Product, Service } from '@/types';
import ReviewSummary from '@/components/reviews/ReviewSummary';
import ReviewsList from '@/components/reviews/ReviewsList';
import SmartReviewButton from '@/components/reviews/SmartReviewButton';
import { useScrollSpy } from '@/hooks/useScrollSpy';
import { guardContactSeller } from '@/lib/guards/accessGuard';
import { Toaster } from 'react-hot-toast';

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
  const t = useTranslations('common.shopDetail');
  const tReviews = useTranslations('common.reviews');
  const params = useParams();
  const sellerId = params.id as string;
  
  // Detect current locale
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const currentLocale = pathname.includes('/ar/') ? 'ar' : 'en';
  
  const [shopData, setShopData] = useState<ShopPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canContactSeller, setCanContactSeller] = useState<boolean>(false);
  const [checkingContactPermission, setCheckingContactPermission] = useState(false);
  // Review system state
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<number | null>(null);
  const [reviewsKey, setReviewsKey] = useState(0);

  // Scroll spy for section navigation
  const sectionIds = ['products', 'services', 'reviews', 'about'];
  const { activeSection, scrollToSection } = useScrollSpy({ sectionIds, offset: 120 });

  // Auth store
  const { token, user } = useAuthStore();

  // Function to check if user can contact seller
  const checkContactPermission = async () => {
    if (!token || !user) {
      setCanContactSeller(false);
      return;
    }

    setCheckingContactPermission(true);
    try {
      const response = await apiClient.canContactSeller(sellerId);
      if (response.success && response.data) {
        setCanContactSeller(response.data.canContact);
      } else {
        setCanContactSeller(false);
      }
    } catch (error) {
      console.error('Error checking contact permission:', error);
      setCanContactSeller(false);
    } finally {
      setCheckingContactPermission(false);
    }
  };

  // Function to calculate membership duration
  const calculateMembershipDuration = (createdAt: string) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffInMs = now.getTime() - created.getTime();
    
    const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);
    
    if (years > 0) {
      return { value: years, unit: years === 1 ? t('year') : t('years'), label: 'memberSince' };
    } else if (months > 0) {
      return { value: months, unit: months === 1 ? t('month') : t('months'), label: 'memberSince' };
    } else if (days > 0) {
      return { value: days, unit: days === 1 ? t('day') : t('days'), label: 'memberSince' };
    } else {
      return { value: 'New', unit: '', label: 'memberSince' };
    }
  };

  useEffect(() => {
    if (sellerId) {
      fetchShopData(sellerId);
      checkContactPermission();
    }
  }, [sellerId, currentLocale, token, user]);

  const fetchShopData = async (id: string) => {
    try {
      setLoading(true);
      
      // Fetch seller details
      const sellerResponse = await apiClient.get(`/sellers/public/${id}?lang=${currentLocale}`);
      
      // Fetch seller's products
      const productsResponse = await apiClient.get(`/products?sellerId=${id}&limit=20&lang=${currentLocale}`);
      
      // Fetch seller's services
      const servicesResponse = await apiClient.get(`/services?sellerId=${id}&limit=20&lang=${currentLocale}`);
      
      if (sellerResponse.success) {
        const seller = sellerResponse.data;
        const products = productsResponse.success ? productsResponse.data.products || [] : [];
        const services = servicesResponse.success ? servicesResponse.data.services || [] : [];
        
        // Calculate stats
        const membershipDuration = seller.createdAt ? calculateMembershipDuration(seller.createdAt) : { value: t('new'), unit: '', label: 'Member Since' };
        
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
        setError(t('shopNotFound'));
      }
    } catch (err) {
      console.error('Error fetching shop data:', err);
      setError(t('loadShopInformationFailed'));
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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('shopNotFound')}</h1>
          <p className="text-gray-600 mb-6">{error || t('shopNotFoundDesc')}</p>
          <Button onClick={() => window.history.back()}>
            {t('tryAgain')}
          </Button>
        </div>
      </div>
    );
  }

  const { seller, products, services, stats } = shopData;

  return (
    <div className="min-h-screen bg-wrench-bg-primary">
      <Toaster position="top-center" />
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
                      <span className="text-sm text-gray-600">({stats.totalReviews} {tReviews('reviews')})</span>
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
                  {t('getDirectionsAddressOnly')}
                </Button>
              )}
              
              <Button 
                variant="primary" 
                className="flex items-center gap-2 border-[#D4F142] text-[#D4F142] hover:bg-[#D4F142] hover:text-black"
                onClick={async () => {
                  const allowed = await guardContactSeller(seller.id, { token, user });
                  if (!allowed) return;

                  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
                  if (isMobile) {
                    window.open(`tel:${seller.user?.phone}`, '_blank');
                  } else {
                    alert(`Contact Number: ${seller.user?.phone}`);
                  }
                }}
                disabled={checkingContactPermission}
              >
                <Phone className="h-4 w-4" />
                {checkingContactPermission ? 'Checking...' : t('contactShop')}
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
              <div className="text-xs sm:text-sm text-gray-600">{t('products')}</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalServices}</div>
              <div className="text-xs sm:text-sm text-gray-600">{t('services')}</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-gray-900">{stats.responseTime}</div>
                <div className="text-xs sm:text-sm text-gray-600">{t('responseTime')}</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-gray-900">
                {stats?.membershipDuration.value}
                {stats?.membershipDuration.unit && ` ${stats.membershipDuration.unit}`}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">{t('memberSince')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Navigation */}
      <div className="sticky top-20 z-40 bg-wrench-bg-primary/60 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex flex-wrap overflow-x-auto">
            <button
              onClick={() => scrollToSection('products')}
              className={`px-4 sm:px-6 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                activeSection === 'products'
                  ? 'border-[#D4F142] text-[#D4F142]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Package className="h-4 w-4 inline mr-2" />
              {t('products')} ({stats.totalProducts})
            </button>
            <button
              onClick={() => scrollToSection('services')}
              className={`px-4 sm:px-6 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                activeSection === 'services'
                  ? 'border-[#D4F142] text-[#D4F142]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Wrench className="h-4 w-4 inline mr-2" />
              {t('services')} ({stats.totalServices})
            </button>
            <button
              onClick={() => scrollToSection('reviews')}
              className={`px-4 sm:px-6 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                activeSection === 'reviews'
                  ? 'border-[#D4F142] text-[#D4F142]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Star className="h-4 w-4 inline mr-2" />
              {t('reviews')} ({stats.totalReviews})
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className={`px-4 sm:px-6 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                activeSection === 'about'
                  ? 'border-[#D4F142] text-[#D4F142]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <User className="h-4 w-4 inline mr-2" />
              {t('aboutShop')}
            </button>
          </nav>
        </div>
      </div>

      {/* All Sections - Full Page Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 py-8">

        {/* Products Section */}
        <section id="products" className="scroll-mt-32">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('products')} ({stats.totalProducts})</h2>
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('noProducts')}</h3>
              <p className="text-gray-600">{t('noProducts')}</p>
            </div>
          )}
        </section>

        {/* Services Section */}
        <section id="services" className="scroll-mt-32">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('services')} ({stats.totalServices})</h2>
          {services.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {services.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('noServices')}</h3>
              <p className="text-gray-600">{t('noServices')}</p>
            </div>
          )}
        </section>

        {/* Reviews Section */}
        <section id="reviews" className="scroll-mt-32">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('reviews')} ({stats.totalReviews})</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Review Summary */}
            <div className="lg:col-span-1">
              <ReviewSummary
                entityType="seller"
                entityId={seller.id}
                onRatingFilter={setSelectedRatingFilter}
                selectedRating={selectedRatingFilter}
              />
              
              {/* Smart Review Button */}
              <Card className="p-4 text-center mt-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  {tReviews('writeReview')}
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  {tReviews('shareYourExperienceWith', { entityName: seller.shopName })}
                </p>
                <SmartReviewButton
                  entityType="seller"
                  entityId={seller.id}
                  entityName={seller.shopName}
                  entityImage={`https://ui-avatars.com/api/?name=${encodeURIComponent(seller.shopName)}&background=D4F142&color=000000&size=200`}
                  onReviewSubmitted={() => setReviewsKey(prev => prev + 1)}
                  className="w-full bg-[#D4F142] hover:bg-[#9CB833] text-black"
                />
              </Card>
            </div>

            {/* Reviews List */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {t('reviews')}
                </h3>
                {selectedRatingFilter && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedRatingFilter(null)}
                  >
                    {tReviews('all')}
                  </Button>
                )}
              </div>
              
              <ReviewsList
                key={reviewsKey}
                entityType="seller"
                entityId={seller.id}
                ratingFilter={selectedRatingFilter || undefined}
                sortBy="helpful"
                limit={10}
                showLoadMore={true}
              />
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="scroll-mt-32">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('aboutShop')}</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Shop Information */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Shop Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Shop Role</label>
                  <p className="text-gray-900">
                    {seller.user?.firstName} {seller.user?.lastName} - {getShopRoleLabel(seller.shopRole, seller.customShopRole)} at {seller.shopName}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Business Type</label>
                  <p className="text-gray-900">{seller.businessType || t('general')}</p>
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
                    {seller.createdAt ? new Date(seller.createdAt).toLocaleDateString() : t('recentlyJoined')}
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
        </section>
      </div>
    </div>
  );
}