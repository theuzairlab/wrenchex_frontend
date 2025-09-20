'use client';

import { useState } from 'react';
import { WishlistIcon } from '@/components/ui/WishlistIcon';
import Link from 'next/link';
import Image from 'next/image';
import { Star, MapPin, Clock, Wrench, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { Service } from '@/types';
import DistanceDisplay from '@/components/location/DistanceDisplay';
import { DirectionButton } from '@/components/location/DirectionButton';

interface ServiceCardProps {
  service: Service;
}

const ServiceCard = ({ service }: ServiceCardProps) => {
  const [imageError, setImageError] = useState(false);
  const primaryImage = service.images?.[0];
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-200 overflow-hidden">
      {/* Service Image */}
      <Link href={`/services/${service.id}`}>
        <div className="relative aspect-video bg-gray-100 overflow-hidden">
          {primaryImage && !imageError ? (
            <Image
              src={primaryImage}
              alt={service.title}
              fill
              className="object-cover hover:scale-105 transition-transform duration-200"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <Wrench className="h-12 w-12" />
            </div>
          )}
          
          {/* Wishlist Icon */}
          <div className="absolute top-2 right-2">
            <WishlistIcon
              id={service.id}
              type="service"
              title={service.title}
              price={service.price}
              image={primaryImage || ''}
              category={service.category?.name}
              sellerName={service.seller.shopName}
            />
          </div>

          {/* Mobile Service Badge */}
          {service.isMobileService && (
            <div className="absolute top-2 left-2">
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                Mobile Service
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Service Info */}
      <div className="p-4">
        {/* Title */}
        <Link href={`/services/${service.id}`}>
          <h3 className="font-semibold text-gray-900 hover:text-wrench-accent transition-colors line-clamp-2 mb-2">
            {service.title}
          </h3>
        </Link>

        {/* Category */}
        {service.category?.name && (
          <div className="mb-2">
            <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
              {service.category.name}
            </span>
          </div>
        )}

        {/* Rating */}
        {service.ratingAverage && service.ratingCount > 0 && (
          <div className="flex items-center space-x-1 mb-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-3 w-3",
                    i < Math.floor(service.ratingAverage!)
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300"
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-gray-600">({service.ratingCount})</span>
          </div>
        )}

        {/* Seller Info */}
        <div className="mb-2">
          <div className="flex items-center space-x-1 text-sm text-gray-700 mb-1">
            <span className="font-medium line-clamp-1">{service.seller.shopName}</span>
          </div>
          
          {/* Shop Address */}
          {(service.seller.shopAddress || service.seller.area || service.seller.city) && (
            <div className="text-xs text-gray-500 line-clamp-1">
              <MapPin className="h-3 w-3 inline mr-1" />
              {service.seller.shopAddress || `${service.seller.area}, ${service.seller.city}`}
            </div>
          )}
        </div>

        {/* Duration and Location */}
        <div className="mb-3">
          <div className="flex items-center space-x-1 text-sm text-gray-600 mb-1">
            <Clock className="h-3 w-3" />
            <span>{formatDuration(service.durationMinutes)}</span>
          </div>
          <div className="flex items-center justify-between">
            <DistanceDisplay
              sellerLatitude={service.seller.latitude}
              sellerLongitude={service.seller.longitude}
              sellerCity={service.seller.city}
              sellerArea={service.seller.area}
              className="text-xs"
              showIcon={true}
              showFallbackLocation={true}
            />
            {service.seller.latitude && service.seller.longitude && (
              <DirectionButton
                destination={{
                  latitude: service.seller.latitude,
                  longitude: service.seller.longitude,
                  address: service.seller.shopAddress || `${service.seller.area}, ${service.seller.city}`,
                  name: service.seller.shopName
                }}
                size="sm"
                variant="ghost"
                showText={false}
                className="text-xs px-1 h-6"
              />
            )}
          </div>
        </div>

        {/* Price */}
        <div className="mb-3">
          <div className="text-lg font-bold text-gray-900">
            {formatPrice(service.price)}
          </div>
        </div>

        {/* Action Button */}
        <Link href={`/services/${service.id}`} className="w-full">
          <Button 
            size="sm" 
            className="w-full"
            disabled={!service.isActive}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Book Now
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ServiceCard;
