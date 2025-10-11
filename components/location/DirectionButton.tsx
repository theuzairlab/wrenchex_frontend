'use client';

import React, { useState } from 'react';
import { Navigation, MapPin, ExternalLink, Route, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useLocationContext } from '@/lib/contexts/LocationContext';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';

interface DirectionButtonProps {
  destination: {
    latitude: number;
    longitude: number;
    address?: string;
    name?: string;
  };
  className?: string;
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function DirectionButton({
  destination,
  className = '',
  variant = 'primary',
  size = 'sm',
  showText = true
}: DirectionButtonProps) {
  const { location } = useLocationContext();
  const [loading, setLoading] = useState(false);
  
  const t = useTranslations('directionButton');
  const pathname = usePathname();
  const currentLocale = pathname?.split('/').filter(Boolean)[0] === 'ar' ? 'ar' : 'en';

  const handleGetDirections = async () => {
    setLoading(true);
    
    try {
      // If user location is available, use it as origin
      let origin = '';
      if (location) {
        origin = `${location.latitude},${location.longitude}`;
      } else {
        // Fallback to asking user to use current location or entering address
        origin = 'Current+Location';
      }

      const destinationStr = `${destination.latitude},${destination.longitude}`;
      const destinationName = destination.name || destination.address || 'Destination';

      // Detect user's platform and open appropriate map app
      const userAgent = navigator.userAgent;
      const isIOS = /iPad|iPhone|iPod/.test(userAgent);
      const isAndroid = /Android/.test(userAgent);

      if (isIOS) {
        // iOS - Apple Maps (primary)
        const appleMapUrl = `http://maps.apple.com/?daddr=${destinationStr}&dirflg=d`;
        window.open(appleMapUrl, '_blank');
      } else if (isAndroid) {
        // Android - Google Maps
        const googleMapUrl = `https://maps.google.com/maps?daddr=${destinationStr}&saddr=${origin}&dirflg=d`;
        window.open(googleMapUrl, '_blank');
      } else {
        // Desktop - Google Maps (most universal)
        const googleMapUrl = `https://maps.google.com/maps?daddr=${destinationStr}&saddr=${origin}&dirflg=d`;
        window.open(googleMapUrl, '_blank');
      }
    } catch (error) {
      console.error('Error opening directions:', error);
      // Fallback to Google Maps web
      const googleMapUrl = `https://maps.google.com/maps?daddr=${destination.latitude},${destination.longitude}&dirflg=d`;
      window.open(googleMapUrl, '_blank');
    } finally {
      setLoading(false);
    }
  };

  const showDirectionOptions = (origin: string, destination: string, destinationName: string) => {
    // Create a modal or dropdown with multiple map options
    const options = [
      {
        name: 'Google Maps',
        url: `https://maps.google.com/maps?daddr=${destination}&saddr=${origin}&dirflg=d`,
        icon: '🗺️'
      },
      {
        name: 'Waze',
        url: `https://waze.com/ul?ll=${destination}&navigate=yes`,
        icon: '🚗'
      },
      {
        name: 'Apple Maps',
        url: `http://maps.apple.com/?daddr=${destination}&dirflg=d`,
        icon: '🍎'
      }
    ];

    // For now, open Google Maps (can be enhanced with a proper modal)
    window.open(options[0].url, '_blank');
  };

  // Calculate estimated distance and time (simplified)
  const getEstimatedInfo = () => {
    if (!location) return null;

    // Simple distance calculation using Haversine formula
    const R = 6371; // Earth's radius in km
    const dLat = ((destination.latitude - location.latitude) * Math.PI) / 180;
    const dLon = ((destination.longitude - location.longitude) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((location.latitude * Math.PI) / 180) *
        Math.cos((destination.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    // Rough time estimate (assuming 40 km/h average in city)
    const estimatedTime = Math.round((distance / 40) * 60); // minutes

    return {
      distance: distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`,
      time: estimatedTime < 60 ? `${estimatedTime}min` : `${Math.round(estimatedTime / 60)}h ${estimatedTime % 60}min`
    };
  };

  const estimatedInfo = getEstimatedInfo();

  return (
    <div className="relative">
      <Button
        variant={variant}
        size={size}
        onClick={handleGetDirections}
        disabled={loading}
        className={`flex items-center gap-2 ${className} w-full`}
        title={`Get directions to ${destination.name || destination.address || 'this location'}`}
      >
        {loading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
        ) : (
          <Navigation className="h-4 w-4" />
        )}
        {showText && (
          <span className="">
            {loading ? t('opening') : t('directions')}
          </span>
        )}
      </Button>

      {/* Distance/Time Tooltip */}
      {estimatedInfo && !loading && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          📍 {estimatedInfo.distance} • ⏱️ {estimatedInfo.time}
        </div>
      )}
    </div>
  );
}

// Enhanced Direction Button with multiple options
interface DirectionButtonWithOptionsProps extends DirectionButtonProps {
  showOptions?: boolean;
}

export function DirectionButtonWithOptions({
  destination,
  className = '',
  variant = 'primary',
  size = 'sm',
  showText = true,
  showOptions = false
}: DirectionButtonWithOptionsProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const { location } = useLocationContext();

  const directionOptions = [
    {
      name: 'Google Maps',
      icon: '🗺️',
      getUrl: (origin: string, dest: string) => 
        `https://maps.google.com/maps?daddr=${dest}&saddr=${origin}&dirflg=d`
    },
    {
      name: 'Waze',
      icon: '🚗',
      getUrl: (origin: string, dest: string) => 
        `https://waze.com/ul?ll=${dest}&navigate=yes`
    },
    {
      name: 'Apple Maps',
      icon: '🍎',
      getUrl: (origin: string, dest: string) => 
        `http://maps.apple.com/?daddr=${dest}&dirflg=d`
    }
  ];

  const openDirection = (option: typeof directionOptions[0]) => {
    const origin = location ? `${location.latitude},${location.longitude}` : 'Current+Location';
    const dest = `${destination.latitude},${destination.longitude}`;
    window.open(option.getUrl(origin, dest), '_blank');
    setShowDropdown(false);
  };

  if (!showOptions) {
    return <DirectionButton {...{ destination, className, variant, size, showText }} />;
  }

  return (
    <div className="relative">
      <div className="flex">
        <DirectionButton {...{ destination, className: `${className} rounded-r-none`, variant, size, showText }} />
        <Button
          variant={variant}
          size={size}
          onClick={() => setShowDropdown(!showDropdown)}
          className="border-l-0 rounded-l-none px-2"
        >
          <ChevronDown className="h-3 w-3" />
        </Button>
      </div>

      {showDropdown && (
        <div className="absolute z-50 top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg min-w-48">
          {directionOptions.map((option) => (
            <button
              key={option.name}
              onClick={() => openDirection(option)}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 flex items-center gap-3 first:rounded-t-lg last:rounded-b-lg"
            >
              <span className="text-lg">{option.icon}</span>
              <span className="text-sm">{option.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
