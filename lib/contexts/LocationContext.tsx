'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { LocationData, LocationService } from '@/lib/services/locationService';
import LocationPermissionModal from '@/components/location/LocationPermissionModal';

interface LocationContextType {
  location: LocationData | null;
  loading: boolean;
  error: string | null;
  permission: 'granted' | 'denied' | 'prompt' | null;
  requestLocation: () => Promise<void>;
  clearLocation: () => void;
  refreshLocation: () => Promise<void>;
  showLocationModal: boolean;
  setShowLocationModal: (show: boolean) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function useLocationContext() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocationContext must be used within a LocationProvider');
  }
  return context;
}

interface LocationProviderProps {
  children: React.ReactNode;
  requestOnMount?: boolean; // Whether to show modal on mount
}

export function LocationProvider({ children, requestOnMount = true }: LocationProviderProps) {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permission, setPermission] = useState<'granted' | 'denied' | 'prompt' | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [hasRequestedOnMount, setHasRequestedOnMount] = useState(false);

  // Request location permission and get coordinates
  const requestLocation = async () => {
    setLoading(true);
    setError(null);

    try {
      const locationData = await LocationService.requestLocationPermission();
      
      if (locationData) {
        setLocation(locationData);
        setPermission('granted');
      } else {
        setError('Unable to get your location');
        setPermission('denied');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get location';
      setError(errorMessage);
      setPermission('denied');
      console.error('Location error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Refresh current location
  const refreshLocation = async () => {
    setLoading(true);
    setError(null);

    try {
      LocationService.clearStoredLocation();
      const locationData = await LocationService.getCurrentLocation();
      
      if (locationData) {
        setLocation(locationData);
        setPermission('granted');
      } else {
        const ipLocation = await LocationService.getIPLocation();
        if (ipLocation) {
          setLocation(ipLocation);
          setPermission('prompt');
        } else {
          setError('Unable to update location');
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh location';
      setError(errorMessage);
      console.error('Location refresh error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Clear location data
  const clearLocation = () => {
    LocationService.clearStoredLocation();
    setLocation(null);
    setError(null);
    setPermission(null);
  };

  // Handle location granted from modal
  const handleLocationGranted = (locationData: LocationData) => {
    setLocation(locationData);
    setPermission('granted');
    setShowLocationModal(false);
  };

  // Handle location denied from modal
  const handleLocationDenied = () => {
    setPermission('denied');
    setShowLocationModal(false);
  };

  // Initialize location on mount
  useEffect(() => {
    const initializeLocation = async () => {
      // Check browser permission status first
      if (navigator.permissions) {
        try {
          const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
          const browserPermission = permissionStatus.state;
          
          if (browserPermission === 'granted') {
            // Permission already granted, try to get location directly
            setLoading(true);
            try {
              const locationData = await LocationService.getCurrentLocation();
              if (locationData) {
                setLocation(locationData);
                setPermission('granted');
                setLoading(false);
                return;
              }
            } catch (err) {
              console.warn('Failed to get current location despite permission granted:', err);
            }
            setLoading(false);
          } else if (browserPermission === 'denied') {
            // Permission denied, use IP location as fallback
            setPermission('denied');
            try {
              const ipLocation = await LocationService.getIPLocation();
              if (ipLocation) {
                setLocation(ipLocation);
              }
            } catch (err) {
              console.warn('IP location also failed:', err);
            }
            return;
          }
        } catch (err) {
          console.warn('Permission API not supported:', err);
        }
      }

      // Check stored permission if browser permission API not available
      const storedPermission = LocationService.getLocationPermission();
      setPermission(storedPermission);

      // Check stored location
      const storedLocation = LocationService.getStoredLocation();
      if (storedLocation) {
        setLocation(storedLocation);
        return;
      }

      // Try IP location as fallback
      if (!storedLocation && storedPermission !== 'granted') {
        try {
          const ipLocation = await LocationService.getIPLocation();
          if (ipLocation) {
            setLocation(ipLocation);
            setPermission('prompt');
          }
        } catch (err) {
          console.warn('IP location failed:', err);
        }
      }

      // Only show modal if we have no location at all and haven't asked before
      if (!storedLocation && !storedPermission && requestOnMount && !hasRequestedOnMount) {
        setHasRequestedOnMount(true);
        // Small delay to ensure the app has loaded
        setTimeout(() => {
          setShowLocationModal(true);
        }, 1000);
      }
    };

    initializeLocation();
  }, [requestOnMount, hasRequestedOnMount]);

  const value: LocationContextType = {
    location,
    loading,
    error,
    permission,
    requestLocation,
    clearLocation,
    refreshLocation,
    showLocationModal,
    setShowLocationModal
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
      
      {/* Location Permission Modal */}
      <LocationPermissionModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onLocationGranted={handleLocationGranted}
        onLocationDenied={handleLocationDenied}
      />
    </LocationContext.Provider>
  );
}

// Convenience hook for getting user's current location
export function useUserLocation() {
  const { location, loading, error, permission } = useLocationContext();
  
  return {
    location,
    loading,
    error,
    permission,
    hasLocation: location !== null,
    isLocationGranted: permission === 'granted'
  };
}

// Hook for calculating distance to a point
export function useDistanceToLocation(targetLat?: number, targetLng?: number) {
  const { location } = useLocationContext();
  
  if (!location || !targetLat || !targetLng) {
    return { distance: null, formattedDistance: null };
  }

  const distance = LocationService.calculateDistance(
    location.latitude,
    location.longitude,
    targetLat,
    targetLng
  );

  return {
    distance,
    formattedDistance: LocationService.formatDistance(distance)
  };
}
