'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Navigation, Target, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LocationService, LocationData } from '@/lib/services/locationService';
import { MapPickerModal } from './MapPickerModal';

interface AddressInputProps {
  value: string;
  onChange: (value: string) => void;
  onLocationChange?: (location: LocationData | null) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  showCurrentLocationButton?: boolean;
  showMapPinButton?: boolean;
  className?: string;
  // If true, the input stays read-only until a location is chosen via buttons/map
  requireActivation?: boolean;
}

interface AddressSuggestion {
  description: string;
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export function AddressInput({
  value,
  onChange,
  onLocationChange,
  placeholder = "Enter your address",
  error,
  required = false,
  showCurrentLocationButton = true,
  showMapPinButton = false,
  className = "",
  requireActivation = false
}: AddressInputProps) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionToken, setSessionToken] = useState<string>('');
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [activated, setActivated] = useState<boolean>(() => Boolean(value && value.length > 0));
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Generate a new session token
  useEffect(() => {
    const generateSessionToken = () => {
      return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    };
    setSessionToken(generateSessionToken());
  }, []);

  // Debounced search for address suggestions
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (value.length > 2) {
      timeoutRef.current = setTimeout(() => {
        searchAddresses(value);
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value]);

  const searchAddresses = async (query: string) => {
    // Prefer client-side Places AutocompleteService to avoid CORS
    try {
      setLoading(true);
      if (typeof window !== 'undefined' && (window as any).google?.maps?.places?.AutocompleteService) {
        const service = new (window as any).google.maps.places.AutocompleteService();
        service.getPlacePredictions(
          { input: query, types: ['address'], sessionToken },
          (predictions: any[], status: string) => {
            if (status === 'OK' && predictions?.length) {
              setSuggestions(predictions as any);
              setShowSuggestions(true);
            } else {
              setSuggestions([]);
              setShowSuggestions(false);
            }
            setLoading(false);
          }
        );
        return;
      }

      // Fallback to HTTP API if Google library not loaded
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        console.warn('Google Maps API key not found');
        setLoading(false);
        return;
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${apiKey}&sessiontoken=${sessionToken}&types=address`
      );
      const data = await response.json();
      if (data.status === 'OK' && data.predictions) {
        setSuggestions(data.predictions);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Address search failed:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setLoading(false);
    }
  };

  const selectSuggestion = async (suggestion: AddressSuggestion) => {
    onChange(suggestion.description);
    if (requireActivation && !activated) setActivated(true);
    setSuggestions([]);
    setShowSuggestions(false);

    // Get place details including coordinates
    await getPlaceDetails(suggestion.place_id);
    
    // Generate new session token for next search
    setSessionToken(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
  };

  const getPlaceDetails = async (placeId: string) => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) return;

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry,address_components,formatted_address&key=${apiKey}&sessiontoken=${sessionToken}`
      );

      if (!response.ok) {
        throw new Error('Place details request failed');
      }

      const data = await response.json();
      
      if (data.status === 'OK' && data.result) {
        const result = data.result;
        const location = result.geometry?.location;
        const components = result.address_components || [];
        
        if (location && onLocationChange) {
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

          const locationData: LocationData = {
            latitude: location.lat,
            longitude: location.lng,
            city: city || undefined,
            area: area || undefined,
            country: country || undefined
          };

          onLocationChange(locationData);
        }
      }
    } catch (error) {
      console.error('Failed to get place details:', error);
    }
  };

  const getCurrentLocation = async () => {
    if (requireActivation && !activated) setActivated(true);
    setLoading(true);
    try {
      const location = await LocationService.getCurrentLocation();
      if (location) {
        // Reverse geocode to get formatted address
        const addressData = await LocationService.reverseGeocode(
          location.latitude,
          location.longitude
        );
        
        if (addressData?.address) {
          onChange(addressData.address);
        }
        
        onLocationChange?.(location);
      }
    } catch (error) {
      console.error('Failed to get current location:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMapLocationSelect = (location: LocationData) => {
    // Update the address input with the selected location
    if (location.address) {
      onChange(location.address);
    }
    if (requireActivation && !activated) setActivated(true);
    
    // Update current location for potential re-opening of map
    setCurrentLocation({ lat: location.latitude, lng: location.longitude });
    
    // Notify parent component of location change
    onLocationChange?.(location);
    
    // Close the map picker
    setShowMapPicker(false);
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow for click events
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative z-0">
        
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          required={required}
          readOnly={requireActivation && !activated}
          aria-disabled={requireActivation && !activated}
          className={`pl-10 pr-4 ${error ? 'border-red-500' : ''} ${requireActivation && !activated ? 'bg-gray-50 cursor-not-allowed' : ''}`}
        />

        {/* Buttons moved OUTSIDE input for clarity and clickability */}
        {(showCurrentLocationButton || showMapPinButton) && (
          <div className="mt-2 flex flex-wrap gap-2 z-20 relative">
            {showCurrentLocationButton && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={getCurrentLocation}
                disabled={loading}
                title="Use current location"
                className="gap-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b border-current"></div>
                ) : (
                  <Navigation className="h-3 w-3" />
                )}
                Use Current Location
              </Button>
            )}
            {showMapPinButton && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowMapPicker(true)}
                title="Pick location on map"
                className="gap-2"
              >
                <Target className="h-3 w-3" />
                Pick Location on Map
              </Button>
            )}
          </div>
        )}

      </div>

      {requireActivation && !activated && (
        <div className="mt-2 text-xs text-gray-600">
          Click <span className="font-semibold">Use Current Location</span> or <span className="font-semibold">Pick Location on Map</span> to set your shop location, then you can edit the address.
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
          <AlertCircle className="h-3 w-3" />
          <span>{error}</span>
        </div>
      )}

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.place_id}
              type="button"
              onClick={() => selectSuggestion(suggestion)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-gray-900">
                    {suggestion.structured_formatting.main_text}
                  </div>
                  <div className="text-sm text-gray-600">
                    {suggestion.structured_formatting.secondary_text}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Map Picker Modal */}
      <MapPickerModal
        isOpen={showMapPicker}
        onClose={() => setShowMapPicker(false)}
        onLocationSelect={handleMapLocationSelect}
        initialLocation={currentLocation || undefined}
        title="Select Your Shop Location"
      />
    </div>
  );
}

export default AddressInput;
