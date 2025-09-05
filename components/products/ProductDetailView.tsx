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
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { Product } from '@/types';
import { ChatWithSellerButton } from '@/components/chat/ChatWithSellerButton';
import { WishlistIcon } from '@/components/ui/WishlistIcon';

interface ProductDetailViewProps {
  product: Product;
}

const ProductDetailView = ({ product }: ProductDetailViewProps) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'shipping' | 'reviews'>('description');

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

  return (
    <div className="container-responsive py-8 mt-20">
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

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
            <Image
              src={primaryImage}
              alt={product.title}
              fill
              className="object-cover rounded-xl"
              priority
            />
            
            {discountPercentage > 0 && (
              <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-lg font-semibold">
                -{discountPercentage}% OFF
              </div>
            )}

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
            <div className="grid grid-cols-4 gap-2">
              {images.slice(0, 4).map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={cn(
                    "aspect-square rounded-lg overflow-hidden border-2 transition-colors",
                    selectedImageIndex === index
                      ? "border-wrench-accent"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <Image
                    src={image}
                    alt={`${product.title} - Image ${index + 1}`}
                    width={100}
                    height={100}
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
            
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
              <span className="text-4xl font-bold text-gray-900">
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

              <div className="flex space-x-4">
                <ChatWithSellerButton 
                  productId={product.id}
                  sellerId={product.seller?.user?.id || product.seller?.id || ''}
                  sellerPhone={product.seller?.user?.phone}
                  showPhone={false}
                  className="flex-1"
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
                  className="static w-12 h-12 flex items-center justify-center"
                />
                
                <Button variant="outline" size="lg" onClick={handleShare}>
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

                </div>
                
                <div className="text-right">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="font-medium">{(product.seller as any).rating || 4.5}</span>
                  </div>
                  <span className="text-sm text-gray-500">Seller Rating</span>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Package className="h-4 w-4 mr-2" />
                  View Store
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Phone className="h-4 w-4 mr-2" />
                  Contact
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Shipping & Warranty Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

      {/* Product Details Tabs */}
      <div className="mt-12">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {[
              { id: 'description', label: 'Description', icon: Info },
              { id: 'specifications', label: 'Specifications', icon: Package },
              { id: 'shipping', label: 'Shipping & Returns', icon: Truck },
              { id: 'reviews', label: 'Reviews', icon: Star },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors",
                  activeTab === tab.id
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

        <div className="py-8">
          {activeTab === 'description' && (
            <div className="max-w-4xl">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {activeTab === 'specifications' && (
            <div className="max-w-4xl">
              {(product.specifications || product.productSpecs) ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Legacy specifications */}
                  {product.specifications && typeof product.specifications === 'object' && (
                    Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                        <span className="font-medium text-gray-900 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="text-gray-600">{String(value)}</span>
                      </div>
                    ))
                  )}
                  
                  {/* Enhanced specifications */}
                  {product.productSpecs?.map((spec) => (
                    <div key={spec.id} className="flex justify-between py-2 border-b border-gray-100">
                      <span className="font-medium text-gray-900">{spec.name}</span>
                      <span className="text-gray-600">
                        {spec.value} {spec.unit && <span className="text-gray-500">{spec.unit}</span>}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No specifications available for this product.</p>
              )}
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="max-w-4xl space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Shipping Information</h3>
                <div className="space-y-2 text-gray-700">
                  <p>• {product.shippingInfo?.freeShipping ? 'Free shipping on this item' : `Shipping cost: AED ${product.shippingInfo?.shippingCost || 25}`}</p>
                  <p>• Estimated delivery: {product.shippingInfo?.estimatedDelivery || '2-3 business days'}</p>
                  <p>• Ships from seller location in UAE</p>
                  <p>• Tracking information provided</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Returns & Refunds</h3>
                <div className="space-y-2 text-gray-700">
                  <p>• 30-day return policy</p>
                  <p>• Items must be in original condition</p>
                  <p>• Return shipping may apply</p>
                  <p>• Refund processed within 5-7 business days</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="max-w-4xl">
              {product.ratingCount > 0 ? (
                <div className="text-center py-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {product.ratingCount} Customer Reviews
                  </h3>
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "h-6 w-6",
                            i < Math.floor(product.ratingAverage!)
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-xl font-semibold">{product.ratingAverage?.toFixed(1)}</span>
                  </div>
                  <p className="text-gray-600">Reviews section coming soon...</p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reviews Yet</h3>
                  <p className="text-gray-600">Be the first to review this product!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailView;