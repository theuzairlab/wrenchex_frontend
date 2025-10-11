'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, X, Navigation, Globe, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { LocationService } from '@/lib/services/locationService';
import { useTranslations } from 'next-intl';

interface LocationPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationGranted: (location: any) => void;
  onLocationDenied: () => void;
}

export function LocationPermissionModal({
  isOpen,
  onClose,
  onLocationGranted,
  onLocationDenied
}: LocationPermissionModalProps) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'request' | 'processing' | 'success' | 'fallback'>('request');
  const t = useTranslations('common.location');

  const handleAllowLocation = async () => {
    setLoading(true);
    setStep('processing');

    try {
      // Request GPS location
      const location = await LocationService.getCurrentLocation();
      
      if (location) {
        setStep('success');
        LocationService.setLocationPermission('granted');
        setTimeout(() => {
          onLocationGranted(location);
          onClose();
        }, 1500);
      } else {
        // Fallback to IP location
        setStep('fallback');
        const ipLocation = await LocationService.getIPLocation();
        
        if (ipLocation) {
          setTimeout(() => {
            onLocationGranted(ipLocation);
            onClose();
          }, 1000);
        } else {
          onLocationDenied();
          onClose();
        }
      }
    } catch (error) {
      console.error('Location permission error:', error);
      setStep('fallback');
      
      // Try IP location as fallback
      const ipLocation = await LocationService.getIPLocation();
      if (ipLocation) {
        setTimeout(() => {
          onLocationGranted(ipLocation);
          onClose();
        }, 1000);
      } else {
        onLocationDenied();
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDenyLocation = () => {
    LocationService.setLocationPermission('denied');
    onLocationDenied();
    onClose();
  };

  const handleUseIPLocation = async () => {
    setLoading(true);
    setStep('processing');

    try {
      const ipLocation = await LocationService.getIPLocation();
      if (ipLocation) {
        onLocationGranted(ipLocation);
        onClose();
      } else {
        onLocationDenied();
        onClose();
      }
    } catch (error) {
      console.error('IP location error:', error);
      onLocationDenied();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="p-6">
          {step === 'request' && (
            <>
              {/* Header */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <MapPin className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {t('findAutoPartsNearYou')}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t('allowLocationAccess')}
                </p>
              </div>

              {/* Benefits */}
              <div className="space-y-3 mb-6">
                <div className="flex items-start space-x-3">
                  <Navigation className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{t('nearbyProductsServices')}</p>
                    <p className="text-gray-600 text-xs">{t('seeWhatsAvailable')}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{t('distanceBasedSearch')}</p>
                    <p className="text-gray-600 text-xs">{t('filterByDistance')}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Globe className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{t('localShopDiscovery')}</p>
                    <p className="text-gray-600 text-xs">{t('findShopsAndMechanics')}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Button
                  onClick={handleAllowLocation}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  {t('allowPreciseLocation')}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleUseIPLocation}
                  disabled={loading}
                  className="w-full"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  {t('useApproximateLocation')}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleDenyLocation}
                  className="w-full text-gray-600 hover:text-gray-800"
                >
                  {t('skipForNow')}
                </Button>
              </div>

              {/* Privacy note */}
              <p className="text-xs text-gray-500 text-center mt-4">
                {t('privacyNote')}
              </p>
            </>
          )}

          {step === 'processing' && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('gettingYourLocation')}
              </h3>
              <p className="text-gray-600 text-sm">
                {t('thisMayTakeFewSeconds')}
              </p>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('locationDetected')}!
              </h3>
              <p className="text-gray-600 text-sm">
                {t('nowShowingProducts')}
              </p>
            </div>
          )}

          {step === 'fallback' && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                <Globe className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('usingApproximateLocation')}
              </h3>
              <p className="text-gray-600 text-sm">
                {t('basedOnInternetConnection')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LocationPermissionModal;
