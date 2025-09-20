'use client';

import React from 'react';
import { MapPin } from 'lucide-react';
import { useDistanceToLocation } from '@/lib/contexts/LocationContext';

interface DistanceDisplayProps {
  sellerLatitude?: number;
  sellerLongitude?: number;
  sellerCity?: string;
  sellerArea?: string;
  className?: string;
  showIcon?: boolean;
  showFallbackLocation?: boolean;
}

export function DistanceDisplay({
  sellerLatitude,
  sellerLongitude,
  sellerCity,
  sellerArea,
  className = "",
  showIcon = true,
  showFallbackLocation = true
}: DistanceDisplayProps) {
  const { distance, formattedDistance } = useDistanceToLocation(
    sellerLatitude,
    sellerLongitude
  );

  // If we have distance, show it
  if (distance !== null && formattedDistance) {
    return (
      <div className={`flex items-center text-sm text-gray-600 ${className}`}>
        {showIcon && <MapPin className="h-3 w-3 mr-1" />}
        <span>{formattedDistance} away</span>
      </div>
    );
  }

  // Fallback to city/area if no distance available
  if (showFallbackLocation && (sellerCity || sellerArea)) {
    const locationText = sellerArea && sellerCity 
      ? `${sellerArea}, ${sellerCity}`
      : sellerCity || sellerArea;

    return (
      <div className={`flex items-center text-sm text-gray-600 ${className}`}>
        {showIcon && <MapPin className="h-3 w-3 mr-1" />}
        <span>{locationText}</span>
      </div>
    );
  }

  return null;
}

export default DistanceDisplay;
