

// Extend Window interface to include google maps
declare global {
  interface Window {
    google: typeof google;
  }
}

export interface LocationData {
  latitude: number;
  longitude: number;
  city?: string;
  area?: string;
  country?: string;
  address?: string;
  accuracy?: number;
}

export interface IPLocationData {
  city: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
}

export class LocationService {
  private static readonly LOCATION_STORAGE_KEY = 'wrench_user_location';
  private static readonly LOCATION_PERMISSION_KEY = 'wrench_location_permission';

  /**
   * Get user's current location using GPS
   */
  static async getCurrentLocation(): Promise<LocationData | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.warn('Geolocation is not supported by this browser');
        resolve(null);
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 15000, // Increased to 15 seconds
        maximumAge: 60000 // Reduced to 1 minute for fresher location
      };

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const locationData: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          };

          // Try to get address from coordinates
          try {
            const addressData = await this.internalReverseGeocode(
              locationData.latitude,
              locationData.longitude
            );
            if (addressData) {
              locationData.city = addressData.city;
              locationData.area = addressData.area;
              locationData.country = addressData.country;
            }
          } catch (error) {
            console.warn('Failed to get address from coordinates:', error);
          }

          // Store location and update permission
          this.storeLocation(locationData);
          this.setLocationPermission('granted');
          console.log('🎯 GPS location obtained successfully');
          resolve(locationData);
        },
        (error) => {
          this.setLocationPermission('denied');
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              // Don't show error for user-denied permission - it's a choice
              console.info('Location access denied by user');
              break;
            case error.POSITION_UNAVAILABLE:
              console.warn('Location position unavailable');
              break;
            case error.TIMEOUT:
              console.warn('Location request timed out');
              break;
            default:
              console.warn('Location error:', error.message);
              break;
          }
          
          resolve(null);
        },
        options
      );
    });
  }

  /**
   * Get location from IP address (fallback)
   */
  static async getIPLocation(): Promise<LocationData | null> {
    try {
      // Use more reliable IP location services that don't require API keys and support CORS
      const services = [
        'https://ipapi.co/json/',
        'https://get.geojs.io/v1/ip/geo.json',
        'https://api.bigdatacloud.net/data/reverse-geocode-client'
      ];

      for (const serviceUrl of services) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
          
          const response = await fetch(serviceUrl, {
            signal: controller.signal,
            headers: {
              'Accept': 'application/json',
            }
          });
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          const data = await response.json();
          
          // Handle different API response formats
          let locationData: LocationData;
          
          // Handle different response formats from various APIs
          const lat = data.latitude || data.lat || data.coords?.lat;
          const lng = data.longitude || data.lng || data.lon || data.coords?.lng;
          
          if (lat && lng) {
            locationData = {
              latitude: parseFloat(lat.toString()),
              longitude: parseFloat(lng.toString()),
              city: data.city || data.locality || data.region || 'Unknown City',
              area: data.region || data.region_name || data.state || data.district || 'Unknown Area',
              country: data.country || data.country_name || data.countryName || 'Unknown Country'
            };
          } else {
            continue; // Try next service
          }

          this.storeLocation(locationData);
          console.log('IP location detected:', locationData);
          return locationData;
          
        } catch (error) {
          // Silently continue to next service for better UX
          continue; // Try next service
        }
      }
      
      // All services failed, use default location
      console.warn('All IP location services failed, using default location');
      const defaultLocation: LocationData = {
        latitude: parseFloat(process.env.NEXT_PUBLIC_DEFAULT_LOCATION_LAT || '33.6844'),
        longitude: parseFloat(process.env.NEXT_PUBLIC_DEFAULT_LOCATION_LNG || '73.0479'),
        city: process.env.NEXT_PUBLIC_DEFAULT_CITY || 'Islamabad',
        area: 'Default Area',
        country: process.env.NEXT_PUBLIC_DEFAULT_COUNTRY || 'Pakistan'
      };
      
      return defaultLocation;
      
    } catch (error) {
      console.error('IP location completely failed:', error);
      
      // Return default location as final fallback
      return {
        latitude: 33.6844, // Islamabad coordinates
        longitude: 73.0479,
        city: 'Islamabad',
        area: 'Default Area',
        country: 'Pakistan'
      };
    }
  }

  /**
   * Request location permission and get location
   */
  static async requestLocationPermission(): Promise<LocationData | null> {
    // Always try GPS first - user might have changed browser settings
    const gpsLocation = await this.getCurrentLocation();
    if (gpsLocation) {
      this.setLocationPermission('granted');
      console.log('🎯 Using GPS location:', gpsLocation.city || 'Unknown location');
      return gpsLocation;
    }

    // Check if we've explicitly been denied
    const permission = this.getLocationPermission();
    console.log('📍 GPS failed, stored permission:', permission);

    // Fallback to IP location
    const ipLocation = await this.getIPLocation();
    if (ipLocation) {
      console.log('🌐 Using IP location fallback:', ipLocation.city || 'Unknown location');
    }
    return ipLocation;
  }

  /**
   * Calculate distance between two points using Haversine formula
   */
  static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return Math.round(distance * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Convert degrees to radians
   */
  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Helper method for internal reverse geocoding
   */
  private static async internalReverseGeocode(lat: number, lng: number): Promise<{
    city?: string;
    area?: string;
    country?: string;
    formatted_address?: string;
  } | null> {
    try {
      // Using Google Geocoding API
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        console.warn('Google Maps API key not found');
        return null;
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
      );

      if (!response.ok) {
        throw new Error('Geocoding API request failed');
      }

      const data = await response.json();
      
      if (data.status !== 'OK' || !data.results?.[0]) {
        return null;
      }

      const result = data.results[0];
      const components = result.address_components;
      
      let city = '';
      let area = '';
      let country = '';

      // Parse address components
      components.forEach((component: any) => {
        const types = component.types;
        
        if (types.includes('locality')) {
          city = component.long_name;
        } else if (types.includes('sublocality') || types.includes('neighborhood')) {
          area = component.long_name;
        } else if (types.includes('administrative_area_level_1') && !city) {
          city = component.long_name;
        } else if (types.includes('country')) {
          country = component.long_name;
        }
      });

      return {
        city: city || undefined,
        area: area || undefined,
        country: country || undefined,
        formatted_address: result.formatted_address
      };
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      return null;
    }
  }

  /**
   * Geocoding - get coordinates from address
   */
  static async geocodeAddress(address: string): Promise<LocationData | null> {
    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        console.warn('Google Maps API key not found');
        return null;
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
      );

      if (!response.ok) {
        throw new Error('Geocoding API request failed');
      }

      const data = await response.json();
      
      if (data.status !== 'OK' || !data.results?.[0]) {
        return null;
      }

      const result = data.results[0];
      const location = result.geometry.location;
      const components = result.address_components;
      
      let city = '';
      let area = '';
      let country = '';

      components.forEach((component: any) => {
        const types = component.types;
        
        if (types.includes('locality')) {
          city = component.long_name;
        } else if (types.includes('sublocality') || types.includes('neighborhood')) {
          area = component.long_name;
        } else if (types.includes('administrative_area_level_1') && !city) {
          city = component.long_name;
        } else if (types.includes('country')) {
          country = component.long_name;
        }
      });

      return {
        latitude: location.lat,
        longitude: location.lng,
        city: city || undefined,
        area: area || undefined,
        country: country || undefined
      };
    } catch (error) {
      console.error('Geocoding failed:', error);
      return null;
    }
  }

  /**
   * Store location in localStorage
   */
  static storeLocation(location: LocationData): void {
    try {
      localStorage.setItem(this.LOCATION_STORAGE_KEY, JSON.stringify({
        ...location,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Failed to store location:', error);
    }
  }

  /**
   * Get stored location from localStorage
   */
  static getStoredLocation(): LocationData | null {
    try {
      const stored = localStorage.getItem(this.LOCATION_STORAGE_KEY);
      if (!stored) return null;

      const data = JSON.parse(stored);
      const age = Date.now() - (data.timestamp || 0);
      
      // Location expires after 1 hour
      if (age > 3600000) {
        localStorage.removeItem(this.LOCATION_STORAGE_KEY);
        return null;
      }

      return {
        latitude: data.latitude,
        longitude: data.longitude,
        city: data.city,
        area: data.area,
        country: data.country,
        accuracy: data.accuracy
      };
    } catch (error) {
      console.error('Failed to get stored location:', error);
      return null;
    }
  }

  /**
   * Set location permission status
   */
  static setLocationPermission(status: 'granted' | 'denied' | 'prompt'): void {
    try {
      localStorage.setItem(this.LOCATION_PERMISSION_KEY, status);
    } catch (error) {
      console.error('Failed to store location permission:', error);
    }
  }

  /**
   * Get location permission status
   */
  static getLocationPermission(): 'granted' | 'denied' | 'prompt' | null {
    try {
      return localStorage.getItem(this.LOCATION_PERMISSION_KEY) as any;
    } catch (error) {
      console.error('Failed to get location permission:', error);
      return null;
    }
  }

  /**
   * Clear stored location data
   */
  static clearStoredLocation(): void {
    try {
      localStorage.removeItem(this.LOCATION_STORAGE_KEY);
      localStorage.removeItem(this.LOCATION_PERMISSION_KEY);
    } catch (error) {
      console.error('Failed to clear location data:', error);
    }
  }

  /**
   * Get user location with all fallbacks
   */
  static async getUserLocation(): Promise<LocationData | null> {
    // First, try to get stored location
    const stored = this.getStoredLocation();
    if (stored) {
      return stored;
    }

    // Then try to get fresh location
    return await this.requestLocationPermission();
  }

  /**
   * Format distance for display
   */
  static formatDistance(distance: number): string {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    } else if (distance < 10) {
      return `${distance.toFixed(1)}km`;
    } else {
      return `${Math.round(distance)}km`;
    }
  }

  /**
   * Get distance filter options
   */
  static getDistanceOptions(): Array<{ value: number; label: string }> {
    return [
      { value: 1, label: '1 km' },
      { value: 5, label: '5 km' },
      { value: 10, label: '10 km' },
      { value: 20, label: '20 km' },
      { value: 50, label: '50 km' },
      { value: 100, label: '100 km' }
    ];
  }

  /**
   * Reverse geocode coordinates to get address details
   */
  static async reverseGeocode(lat: number, lng: number): Promise<LocationData> {
    try {
      // Try Google Maps Geocoding API first
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      
      if (apiKey && window.google) {
        return new Promise((resolve, reject) => {
          const geocoder = new google.maps.Geocoder();
          
          geocoder.geocode(
            { location: { lat, lng } },
            (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus) => {
              if (status === 'OK' && results && results[0]) {
                const result = results[0];
                const components = result.address_components;
                
                let city = '';
                let area = '';
                let country = '';
                
                // Extract city, area, and country from address components
                for (const component of components) {
                  const types = component.types;
                  
                  if (types.includes('locality')) {
                    city = component.long_name;
                  } else if (types.includes('administrative_area_level_2') && !city) {
                    city = component.long_name;
                  } else if (types.includes('sublocality') || types.includes('sublocality_level_1')) {
                    area = component.long_name;
                  } else if (types.includes('administrative_area_level_3') && !area) {
                    area = component.long_name;
                  } else if (types.includes('country')) {
                    country = component.long_name;
                  }
                }
                
                resolve({
                  latitude: lat,
                  longitude: lng,
                  city: city || 'Unknown City',
                  area: area || 'Unknown Area',
                  address: result.formatted_address,
                  country: country || 'Unknown Country'
                });
              } else {
                reject(new Error('Geocoding failed'));
              }
            }
          );
        });
      }
      
      // Fallback to a basic response if Google Maps is not available
      return {
        latitude: lat,
        longitude: lng,
        city: 'Unknown City',
        area: 'Unknown Area',
        address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        country: 'Unknown Country'
      };
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      
      // Return basic location data as fallback
      return {
        latitude: lat,
        longitude: lng,
        city: 'Unknown City',
        area: 'Unknown Area',
        address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        country: 'Unknown Country'
      };
    }
  }
}
