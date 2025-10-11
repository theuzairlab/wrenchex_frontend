import { useState, useEffect, useCallback } from 'react';
import { LocationService, LocationData } from '@/lib/services/locationService';
import { toast } from 'sonner';

// Translation helper for location hook
const getLocationTranslation = (key: string): string => {
  const translations: Record<string, string> = {
    'locationDetectedSuccessfully': 'Location detected successfully!',
    'couldNotGetLocation': 'Could not get your location. Showing all available items.',
    'locationUpdatedSuccessfully': 'Location updated successfully!',
    'couldNotUpdateLocation': 'Could not update your location.',
  };
  return translations[key] || key;
};

interface UseLocationOptions {
  immediate?: boolean; // Request location immediately
  watch?: boolean; // Watch for location changes
  enableHighAccuracy?: boolean;
}

interface UseLocationReturn {
  location: LocationData | null;
  loading: boolean;
  error: string | null;
  permission: 'granted' | 'denied' | 'prompt' | null;
  requestLocation: () => Promise<void>;
  clearLocation: () => void;
  refreshLocation: () => Promise<void>;
}

export function useLocation(options: UseLocationOptions = {}): UseLocationReturn {
  const { immediate = false, watch = false, enableHighAccuracy = true } = options;

  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permission, setPermission] = useState<'granted' | 'denied' | 'prompt' | null>(null);

  // Request location permission and get coordinates
  const requestLocation = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // First check if we have stored location
      const stored = LocationService.getStoredLocation();
      if (stored) {
        setLocation(stored);
        setPermission('granted');
        setLoading(false);
        return;
      }

      // Request fresh location
      const locationData = await LocationService.requestLocationPermission();
      
      if (locationData) {
        setLocation(locationData);
        setPermission('granted');
        toast.success(getLocationTranslation('locationDetectedSuccessfully'));
      } else {
        setError('Unable to get your location');
        setPermission('denied');
        toast.error(getLocationTranslation('couldNotGetLocation'));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get location';
      setError(errorMessage);
      setPermission('denied');
      console.error('Location error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh current location
  const refreshLocation = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Clear stored location to force fresh request
      LocationService.clearStoredLocation();
      
      const locationData = await LocationService.getCurrentLocation();
      
      if (locationData) {
        setLocation(locationData);
        setPermission('granted');
        toast.success(getLocationTranslation('locationUpdatedSuccessfully'));
      } else {
        // Fallback to IP location
        const ipLocation = await LocationService.getIPLocation();
        if (ipLocation) {
          setLocation(ipLocation);
          setPermission('prompt');
          toast('Using approximate location based on your IP address.');
        } else {
          setError('Unable to update location');
          toast.error(getLocationTranslation('couldNotUpdateLocation'));
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh location';
      setError(errorMessage);
      console.error('Location refresh error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear location data
  const clearLocation = useCallback(() => {
    LocationService.clearStoredLocation();
    setLocation(null);
    setError(null);
    setPermission(null);
    toast('Location data cleared.');
  }, []);

  // Initialize location on mount
  useEffect(() => {
    const initializeLocation = async () => {
      // Check stored permission
      const storedPermission = LocationService.getLocationPermission();
      setPermission(storedPermission);

      // Check stored location
      const storedLocation = LocationService.getStoredLocation();
      if (storedLocation) {
        setLocation(storedLocation);
        return;
      }

      // Request location if immediate is true
      if (immediate) {
        await requestLocation();
      }
    };

    initializeLocation();
  }, [immediate, requestLocation]);

  // Watch for location changes
  useEffect(() => {
    if (!watch || !location) return;

    let watchId: number;

    if (navigator.geolocation) {
      const options = {
        enableHighAccuracy,
        timeout: 10000,
        maximumAge: 60000 // 1 minute
      };

      watchId = navigator.geolocation.watchPosition(
        async (position) => {
          const newLocation: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          };

          // Check if location has changed significantly (more than 100 meters)
          if (location) {
            const distance = LocationService.calculateDistance(
              location.latitude,
              location.longitude,
              newLocation.latitude,
              newLocation.longitude
            );

            if (distance < 0.1) return; // Less than 100 meters, ignore
          }

          // Get address for new location
          try {
            const addressData = await LocationService.reverseGeocode(
              newLocation.latitude,
              newLocation.longitude
            );
            if (addressData) {
              newLocation.city = addressData.city;
              newLocation.area = addressData.area;
              newLocation.country = addressData.country;
            }
          } catch (error) {
            console.warn('Failed to get address for new location:', error);
          }

          setLocation(newLocation);
          LocationService.storeLocation(newLocation);
        },
        (error) => {
          console.warn('Location watch error:', error);
        },
        options
      );
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watch, location, enableHighAccuracy]);

  return {
    location,
    loading,
    error,
    permission,
    requestLocation,
    clearLocation,
    refreshLocation
  };
}

// Hook for getting distance between user and a point
export function useDistance(
  targetLat?: number,
  targetLng?: number
): {
  distance: number | null;
  formattedDistance: string | null;
} {
  const { location } = useLocation();
  
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

// Hook for checking if a location is within a certain radius
export function useWithinRadius(
  targetLat?: number,
  targetLng?: number,
  radiusKm: number = 10
): boolean {
  const { distance } = useDistance(targetLat, targetLng);
  
  if (distance === null) return false;
  
  return distance <= radiusKm;
}
