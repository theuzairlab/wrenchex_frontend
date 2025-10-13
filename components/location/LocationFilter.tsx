'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Sliders, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useLocationContext } from '@/lib/contexts/LocationContext';
import { LocationService } from '@/lib/services/locationService';
import { LocationPermissionModal } from './LocationPermissionModal';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';

interface LocationFilterProps {
  currentLocation?: string;
  currentRadius?: number;
  onLocationChange: (location: string | null, coordinates?: { lat: number; lng: number }) => void;
  onRadiusChange: (radius: number) => void;
  onUseCurrentLocation: () => void;
  onClearLocation: () => void;
  onClose?: () => void;
  className?: string;
}

export function LocationFilter({
  currentLocation,
  currentRadius = 20,
  onLocationChange,
  onRadiusChange,
  onUseCurrentLocation,
  onClearLocation,
  onClose,
  className = ""
}: LocationFilterProps) {
  const { location, loading, requestLocation } = useLocationContext();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customLocation, setCustomLocation] = useState(currentLocation || '');
  const [radius, setRadius] = useState(currentRadius);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  
  const t = useTranslations('locationFilter');
  const pathname = usePathname();
  const currentLocale = pathname?.split('/').filter(Boolean)[0] === 'ar' ? 'ar' : 'en';

  // Quick distance options
  const distanceOptions = LocationService.getDistanceOptions();

  useEffect(() => {
    setCustomLocation(currentLocation || '');
  }, [currentLocation]);

  useEffect(() => {
    setRadius(currentRadius);
  }, [currentRadius]);

  const handleUseCurrentLocation = () => {
    if (location) {
      const locationString = location.city && location.area 
        ? `${location.area}, ${location.city}`
        : location.city || t('currentLocation');
      
      setCustomLocation(locationString);
      onLocationChange(locationString, {
        lat: location.latitude,
        lng: location.longitude
      });
      onUseCurrentLocation();
    } else {
      // Show permission modal when location is not available
      setShowPermissionModal(true);
    }
  };

  const handleLocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (customLocation.trim()) {
      // Try to geocode the location
      const coordinates = await LocationService.geocodeAddress(customLocation.trim());
      onLocationChange(customLocation.trim(), coordinates ? {
        lat: coordinates.latitude,
        lng: coordinates.longitude
      } : undefined);
    }
  };

  const handleRadiusChange = (newRadius: number) => {
    setRadius(newRadius);
    onRadiusChange(newRadius);
  };

  const handleClearLocation = () => {
    setCustomLocation('');
    onClearLocation();
  };

  const handleLocationGranted = (newLocation: any) => {
    setShowPermissionModal(false);
    if (newLocation) {
      const locationString = newLocation.city && newLocation.area 
        ? `${newLocation.area}, ${newLocation.city}`
        : newLocation.city || t('currentLocation');
      
      setCustomLocation(locationString);
      onLocationChange(locationString, {
        lat: newLocation.latitude,
        lng: newLocation.longitude
      });
      onUseCurrentLocation();
    }
  };

  const handleLocationDenied = () => {
    setShowPermissionModal(false);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Location Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          {t('location')}
        </label>
        <form onSubmit={handleLocationSubmit} className="flex gap-2">
          <div className="flex-1 relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              value={customLocation}
              onChange={(e) => setCustomLocation(e.target.value)}
              placeholder={t('enterCityAreaOrAddress')}
              className="pl-10 pr-10"
            />
            {customLocation && (
              <button
                type="button"
                onClick={handleClearLocation}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleUseCurrentLocation}
          disabled={loading}
          className="text-xs"
        >
          <Navigation className="h-3 w-3 mr-1" />
          {loading ? t('gettingLocation') : location ? t('useCurrentLocation') : t('enableLocation')}
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs"
        >
          <Sliders className="h-3 w-3 mr-1" />
          {t('distance')}
        </Button>
      </div>

      {/* Current Location Display */}
      {location && (
        <div className="text-xs text-gray-600 bg-blue-50 rounded p-2">
          <span className="font-medium">{t('yourLocation')}:</span> {' '}
          {location.city && location.area 
            ? `${location.area}, ${location.city}`
            : location.city || t('unknown')
          }
        </div>
      )}

      {/* Distance Filter */}
      {showAdvanced && (
        <div className="space-y-3 border-t pt-3">
          <label className="text-sm font-medium text-gray-700">
            {t('searchWithin')}
          </label>
          
          {/* Quick Distance Buttons */}
          <div className="flex flex-wrap gap-2">
            {distanceOptions.map((option) => (
              <Button
                key={option.value}
                variant={radius === option.value ? "primary" : "outline"}
                size="sm"
                onClick={() => handleRadiusChange(option.value)}
                className="text-xs"
              >
                {option.label}
              </Button>
            ))}
          </div>
          
          {/* Custom Distance Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{t('customDistance')}</span>
              <span className="text-sm font-medium">{radius} {t('km')}</span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              value={radius}
              onChange={(e) => handleRadiusChange(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>1 {t('km')}</span>
              <span>100 {t('km')}</span>
            </div>
          </div>
        </div>
      )}

      {/* Active Filter Display */}
      {(currentLocation || (location && radius !== 20)) && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <span className="font-medium text-green-800">{t('activeLocationFilter')}:</span>
              <div className="text-green-700 mt-1">
                {currentLocation && (
                  <div>📍 {currentLocation}</div>
                )}
                <div>📏 {t('within')} {radius} {t('km')}</div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearLocation}
              className="text-green-700 border-green-300 hover:bg-green-100"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}


      {/* Location Permission Modal */}
      <LocationPermissionModal
        isOpen={showPermissionModal}
        onClose={() => setShowPermissionModal(false)}
        onLocationGranted={handleLocationGranted}
        onLocationDenied={handleLocationDenied}
      />
    </div>
  );
}

export default LocationFilter;
