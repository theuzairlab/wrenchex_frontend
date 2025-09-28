'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Star, 
  Heart, 
  Share2, 
  Plus, 
  Minus, 
  Truck, 
  Shield, 
  RotateCcw,
  MapPin,
  Phone,
  CheckCircle,
  AlertCircle,
  Info,
  Package,
  Clock,
  Award,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { Product } from '@/types';
import { ChatWithSellerButton } from '@/components/chat/ChatWithSellerButton';
import { WishlistIcon } from '@/components/ui/WishlistIcon';
import ReviewSummary from '@/components/reviews/ReviewSummary';
import ReviewsList from '@/components/reviews/ReviewsList';
import SmartReviewButton from '@/components/reviews/SmartReviewButton';
import { useScrollSpy } from '@/hooks/useScrollSpy';

interface ProductDetailViewProps {
  product: Product;
}

const ProductDetailView = ({ product }: ProductDetailViewProps) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<number | null>(null);
  const [reviewsKey, setReviewsKey] = useState(0); // For refreshing reviews after submission

  // Scroll spy for section navigation
  const sectionIds = ['description', 'specifications', 'shipping', 'reviews'];
  const { activeSection, scrollToSection } = useScrollSpy({ sectionIds, offset: 120 });

  const images = product.images || product.productImages?.map(img => img.url) || ['/placeholder-product.jpg'];
  const primaryImage = images[selectedImageIndex] || images[0];
  
  const discountPercentage = product.originalPrice && product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const isInStock = product.isActive;
  const isLowStock = false; // No longer tracking stock levels

  // Handle quantity changes
  const incrementQuantity = () => {
    if (quantity < (product.maxOrderQuantity || 99)) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > (product.minOrderQuantity || 1)) {
      setQuantity(quantity - 1);
    }
  };

  // Handle share
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: product.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You could show a toast notification here
    }
  };

  // Handle image navigation
  const goToPreviousImage = () => {
    setSelectedImageIndex((prev) => 
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const goToNextImage = () => {
    setSelectedImageIndex((prev) => 
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (images.length <= 1) return;
    
    if (event.key === 'ArrowLeft') {
      goToPreviousImage();
    } else if (event.key === 'ArrowRight') {
      goToNextImage();
    }
  };

  return (
    <div className="container-responsive py-8 px-4 mt-20">
      {/* Breadcrumb */}
      <nav className="flex text-sm text-gray-600 mb-8" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-wrench-accent">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/products" className="hover:text-wrench-accent">Products</Link>
        <span className="mx-2">/</span>
        <Link 
          href={`/products?category=${product.categoryId}`} 
          className="hover:text-wrench-accent"
        >
          {product.category?.name || 'Auto Parts'}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium truncate">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
        {/* Product Images */}
        <div className="space-y-4 flex flex-col lg:flex-row-reverse gap-4 lg:gap-2">
          {/* Main Image */}
          <div 
            className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative group focus:outline-none focus:ring-2 focus:ring-wrench-accent max-w-2xl lg:flex-1"
            tabIndex={images.length > 1 ? 0 : -1}
            onKeyDown={handleKeyDown}
          >
            <Image
              src={primaryImage}
              alt={product.title}
              fill
              className="object-cover rounded-xl"
              priority
            />
            
            {/* Image Counter */}
            {images.length > 1 && (
              <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-lg text-sm font-medium">
                {selectedImageIndex + 1} / {images.length}
              </div>
            )}

            {/* Discount Badge */}
            {discountPercentage > 0 && (
              <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-lg font-semibold">
                -{discountPercentage}% OFF
              </div>
            )}

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={goToPreviousImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                
                <button
                  onClick={goToNextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            {/* Out of Stock Overlay */}
            {!isInStock && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <span className="bg-gray-900 text-white px-4 py-2 rounded-lg font-semibold">
                  Out of Stock
                </span>
              </div>
            )}
          </div>

          {/* Thumbnail Images */}
          {images.length > 1 && (
            <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
              {images.slice(0, 6).map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={cn(
                    "aspect-square rounded-lg overflow-hidden border-2 transition-colors flex-shrink-0",
                    "w-16 h-16 lg:w-12 lg:h-12",
                    selectedImageIndex === index
                      ? "border-wrench-accent"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <Image
                    src={image}
                    alt={`${product.title} - Image ${index + 1}`}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
            
            <div className="flex items-center space-x-4 mb-4">
              {product.brand && (
                <span className="text-lg text-gray-600">
                  by <span className="font-semibold text-wrench-accent">{product.brand}</span>
                </span>
              )}
              
              {product.sku && (
                <span className="text-sm text-gray-500">SKU: {product.sku}</span>
              )}
            </div>

            {/* Rating */}
            {/* {product.ratingAverage && product.ratingCount > 0 && (
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-5 w-5",
                        i < Math.floor(product.ratingAverage!)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      )}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {product.ratingAverage.toFixed(1)} ({product.ratingCount} reviews)
                </span>
              </div>
            )} */}
          </div>

          {/* Price */}
          <div className="border-b border-gray-200 pb-6">
            <div className="flex items-baseline space-x-3">
              <span className="text-3xl sm:text-4xl font-bold text-gray-900">
                AED {product.price?.toLocaleString() || '0'}
              </span>
              {product.originalPrice && product.originalPrice > (product.price || 0) && (
                <span className="text-xl text-gray-500 line-through">
                  AED {product.originalPrice?.toLocaleString() || '0'}
                </span>
              )}
            </div>
            
            {discountPercentage > 0 && (
              <div className="text-green-600 font-semibold mt-1">
                You save AED {((product.originalPrice || 0) - (product.price || 0)).toLocaleString()} ({discountPercentage}% off)
              </div>
            )}
          </div>

          {/* Stock Status */}
          <div className="flex items-center space-x-2">
            {isInStock ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-green-600 font-medium">
                  Available
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="h-5 w-5 text-red-500" />
                <span className="text-red-600 font-medium">Out of Stock</span>
              </>
            )}
          </div>

          {/* Product Tags */}
          {/* {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )} */}

          {/* Condition Badge */}
          {/* {product.condition && (
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Condition:</span>
              <span className={cn(
                "px-3 py-1 rounded-full text-sm font-medium",
                product.condition === 'NEW' ? 'bg-green-100 text-green-700' :
                product.condition === 'USED' ? 'bg-yellow-100 text-yellow-700' :
                'bg-blue-100 text-blue-700'
              )}>
                {product.condition}
              </span>
            </div>
          )} */}

          {/* Quantity and Add to Cart */}
          {isInStock && (
            <div className="space-y-4">

              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <ChatWithSellerButton 
                  productId={product.id}
                  sellerId={product.seller?.user?.id || product.seller?.id || ''}
                  sellerPhone={product.seller?.user?.phone}
                  showPhone={false}
                  className="w-full sm:flex-1"
                />
                
                <WishlistIcon
                  id={product.id}
                  type="product"
                  title={product.title}
                  price={product.price}
                  image={primaryImage}
                  category={product.category?.name}
                  sellerName={product.seller.shopName}
                  size="lg"
                  className="static w-12 h-12 flex items-center justify-center self-center sm:self-auto"
                />
                
                <Button variant="outline" size="lg" onClick={handleShare} className="w-full sm:w-auto">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {/* Seller Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-gray-600" />
                <span>Sold by</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-lg">{product.seller.shopName}</h4>
                  {(product.seller.shopAddress || product.seller.area || product.seller.city) && (
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span className="line-clamp-1">
                        {product.seller.shopAddress || `${product.seller.area}, ${product.seller.city}`}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="text-right">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="font-medium">{(product.seller as any).rating || 4.5}</span>
                  </div>
                  <span className="text-sm text-gray-500">Seller Rating</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <Link href={`/shop/${product.sellerId}`} className="w-full sm:flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    <Package className="h-4 w-4 mr-2" />
                    View Shop Details
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full sm:flex-1" 
                  onClick={() => {
                    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
                    if (isMobile) {
                      window.open(`tel:${product.seller.user?.phone}`, '_blank');
                    } else {
                      // Show phone number in a modal or alert for desktop/tablet
                      alert(`Contact Number: ${product.seller.user?.phone}`);
                    }
                  }}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Contact Shop
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Shipping & Warranty Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Truck className="h-6 w-6 text-wrench-accent" />
              <div>
                <div className="font-medium text-sm">
                  {product.shippingInfo?.freeShipping ? 'Free Shipping' : 'Fast Delivery'}
                </div>
                <div className="text-xs text-gray-600">
                  {product.shippingInfo?.estimatedDelivery || '2-3 business days'}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <RotateCcw className="h-6 w-6 text-wrench-accent" />
              <div>
                <div className="font-medium text-sm">Easy Returns</div>
                <div className="text-xs text-gray-600">30-day return policy</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Shield className="h-6 w-6 text-wrench-accent" />
              <div>
                <div className="font-medium text-sm">
                  {product.warranty ? `${product.warranty} Warranty` : 'Quality Guarantee'}
                </div>
                <div className="text-xs text-gray-600">Authentic parts only</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Navigation */}
      <div className="sticky top-20 z-40 bg-wrench-bg-primary/80 backdrop-blur-sm border-b border-gray-200 mt-12">
        <div className="container-responsive">
          <nav className="flex flex-wrap space-x-4 sm:space-x-8 overflow-x-auto">
            {[
              { id: 'description', label: 'Description', icon: Info },
              { id: 'specifications', label: 'Specifications', icon: Package },
              { id: 'shipping', label: 'Shipping & Returns', icon: Truck },
              { id: 'reviews', label: 'Reviews', icon: Star },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => scrollToSection(tab.id)}
                className={cn(
                  "flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap",
                  activeSection === tab.id
                    ? "border-wrench-accent text-wrench-accent"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                )}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* All Sections - Full Page Layout */}
      <div className="space-y-16 py-8">
        {/* Description Section */}
        <section id="description" className="scroll-mt-32">
          <div className="max-w-4xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Description</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>
        </section>

        {/* Specifications Section */}
        <section id="specifications" className="scroll-mt-32">
          <div className="max-w-4xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Specifications</h2>
            {(product.specifications || product.productSpecs) ? (
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Legacy specifications */}
                  {product.specifications && typeof product.specifications === 'object' && (
                    Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-3 border-b border-gray-200">
                        <span className="font-medium text-gray-900 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="text-gray-600">{String(value)}</span>
                      </div>
                    ))
                  )}
                  
                  {/* Enhanced specifications */}
                  {product.productSpecs?.map((spec) => (
                    <div key={spec.id} className="flex justify-between py-3 border-b border-gray-200">
                      <span className="font-medium text-gray-900">{spec.name}</span>
                      <span className="text-gray-600">
                        {spec.value} {spec.unit && <span className="text-gray-500">{spec.unit}</span>}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No specifications available for this product.</p>
              </div>
            )}
          </div>
        </section>

        {/* Shipping & Returns Section */}
        <section id="shipping" className="scroll-mt-32">
          <div className="max-w-4xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Shipping & Returns</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Shipping Information */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Truck className="h-5 w-5 text-wrench-accent mr-2" />
                  Shipping Information
                </h3>
                <div className="space-y-3 text-gray-700">
                  <p>• {product.shippingInfo?.freeShipping ? 'Free shipping on this item' : `Shipping cost: AED ${product.shippingInfo?.shippingCost || 25}`}</p>
                  <p>• Estimated delivery: {product.shippingInfo?.estimatedDelivery || '2-3 business days'}</p>
                  <p>• Ships from seller location in UAE</p>
                  <p>• Tracking information provided</p>
                </div>
              </div>
              
              {/* Returns & Refunds */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <RotateCcw className="h-5 w-5 text-wrench-accent mr-2" />
                  Returns & Refunds
                </h3>
                <div className="space-y-3 text-gray-700">
                  <p>• 30-day return policy</p>
                  <p>• Items must be in original condition</p>
                  <p>• Return shipping may apply</p>
                  <p>• Refund processed within 5-7 business days</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section id="reviews" className="scroll-mt-32">
          <div className="max-w-6xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Review Summary */}
              <div className="lg:col-span-1">
                <ReviewSummary
                  entityType="product"
                  entityId={product.id}
                  onRatingFilter={setSelectedRatingFilter}
                  selectedRating={selectedRatingFilter}
                />
                
                {/* Smart Review Button */}
                <Card className="mt-4">
                  <CardContent className="p-4 text-center">
                    <h4 className="font-medium text-gray-900 mb-2">
                      Share Your Experience
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Help others by reviewing this product
                    </p>
                    <SmartReviewButton
                      entityType="product"
                      entityId={product.id}
                      entityName={product.title}
                      entityImage={primaryImage}
                      onReviewSubmitted={() => setReviewsKey(prev => prev + 1)}
                      className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Reviews List */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    All Reviews
                  </h3>
                  {selectedRatingFilter && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedRatingFilter(null)}
                    >
                      Clear Filter
                    </Button>
                  )}
                </div>
                
                <ReviewsList
                  key={reviewsKey} // Force refresh when reviews change
                  entityType="product"
                  entityId={product.id}
                  ratingFilter={selectedRatingFilter || undefined}
                  sortBy="helpful"
                  limit={10}
                  showLoadMore={true}
                />
              </div>
            </div>
          </div>
        </section>
      </div>
      </div>
    
  );
};

export default ProductDetailView;