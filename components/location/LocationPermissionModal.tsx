'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, X, Navigation, Globe, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { LocationService } from '@/lib/services/locationService';

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
                  Find Auto Parts Near You
                </h3>
                <p className="text-gray-600 text-sm">
                  Allow location access to discover products and services in your area and get personalized recommendations.
                </p>
              </div>

              {/* Benefits */}
              <div className="space-y-3 mb-6">
                <div className="flex items-start space-x-3">
                  <Navigation className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Nearby Products & Services</p>
                    <p className="text-gray-600 text-xs">See what's available in your area</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Distance-Based Search</p>
                    <p className="text-gray-600 text-xs">Filter by distance from your location</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Globe className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Local Shop Discovery</p>
                    <p className="text-gray-600 text-xs">Find shops and mechanics near you</p>
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
                  Allow Precise Location
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleUseIPLocation}
                  disabled={loading}
                  className="w-full"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Use Approximate Location
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleDenyLocation}
                  className="w-full text-gray-600 hover:text-gray-800"
                >
                  Skip for Now
                </Button>
              </div>

              {/* Privacy note */}
              <p className="text-xs text-gray-500 text-center mt-4">
                We respect your privacy. Your location is only used to improve your shopping experience and is never shared with third parties.
              </p>
            </>
          )}

          {step === 'processing' && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Getting Your Location...
              </h3>
              <p className="text-gray-600 text-sm">
                This may take a few seconds
              </p>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Location Detected!
              </h3>
              <p className="text-gray-600 text-sm">
                Now showing products and services near you
              </p>
            </div>
          )}

          {step === 'fallback' && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                <Globe className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Using Approximate Location
              </h3>
              <p className="text-gray-600 text-sm">
                Based on your internet connection
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LocationPermissionModal;
