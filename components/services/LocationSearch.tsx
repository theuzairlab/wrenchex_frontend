'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { MapPin, Navigation, Search, X } from 'lucide-react';

interface LocationSuggestion {
  id: string;
  name: string;
  type: 'city' | 'area' | 'current';
  latitude?: number;
  longitude?: number;
}

interface LocationSearchProps {
  value: string;
  onChange: (location: string, coordinates?: { lat: number; lng: number }) => void;
  placeholder?: string;
  className?: string;
  showCurrentLocation?: boolean;
}

export default function LocationSearch({
  value,
  onChange,
  placeholder = "Enter city or area",
  className,
  showCurrentLocation = true
}: LocationSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Pakistani cities and areas for suggestions
  const pakistaniLocations = [
    // Major cities
    { id: 'karachi', name: 'Karachi', type: 'city' as const },
    { id: 'lahore', name: 'Lahore', type: 'city' as const },
    { id: 'islamabad', name: 'Islamabad', type: 'city' as const },
    { id: 'rawalpindi', name: 'Rawalpindi', type: 'city' as const },
    { id: 'faisalabad', name: 'Faisalabad', type: 'city' as const },
    { id: 'multan', name: 'Multan', type: 'city' as const },
    { id: 'peshawar', name: 'Peshawar', type: 'city' as const },
    { id: 'quetta', name: 'Quetta', type: 'city' as const },
    { id: 'sialkot', name: 'Sialkot', type: 'city' as const },
    { id: 'gujranwala', name: 'Gujranwala', type: 'city' as const },
    { id: 'hyderabad', name: 'Hyderabad', type: 'city' as const },
    { id: 'sargodha', name: 'Sargodha', type: 'city' as const },
    
    // Karachi areas
    { id: 'dha-karachi', name: 'DHA, Karachi', type: 'area' as const },
    { id: 'clifton', name: 'Clifton, Karachi', type: 'area' as const },
    { id: 'gulshan-iqbal', name: 'Gulshan-e-Iqbal, Karachi', type: 'area' as const },
    { id: 'nazimabad', name: 'Nazimabad, Karachi', type: 'area' as const },
    { id: 'north-nazimabad', name: 'North Nazimabad, Karachi', type: 'area' as const },
    { id: 'malir', name: 'Malir, Karachi', type: 'area' as const },
    { id: 'korangi', name: 'Korangi, Karachi', type: 'area' as const },
    
    // Lahore areas
    { id: 'dha-lahore', name: 'DHA, Lahore', type: 'area' as const },
    { id: 'gulberg', name: 'Gulberg, Lahore', type: 'area' as const },
    { id: 'model-town', name: 'Model Town, Lahore', type: 'area' as const },
    { id: 'johar-town', name: 'Johar Town, Lahore', type: 'area' as const },
    { id: 'cantt-lahore', name: 'Cantt, Lahore', type: 'area' as const },
    
    // Islamabad areas
    { id: 'blue-area', name: 'Blue Area, Islamabad', type: 'area' as const },
    { id: 'f-6', name: 'F-6, Islamabad', type: 'area' as const },
    { id: 'f-7', name: 'F-7, Islamabad', type: 'area' as const },
    { id: 'f-8', name: 'F-8, Islamabad', type: 'area' as const },
    { id: 'g-9', name: 'G-9, Islamabad', type: 'area' as const },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const searchLocations = (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    const filtered = pakistaniLocations
      .filter(location => 
        location.name.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 8);

    setSuggestions(filtered);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setIsOpen(true);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      searchLocations(newValue);
    }, 200);
  };

  const handleSuggestionClick = (suggestion: LocationSuggestion) => {
    onChange(suggestion.name, suggestion.latitude && suggestion.longitude ? {
      lat: suggestion.latitude,
      lng: suggestion.longitude
    } : undefined);
    setIsOpen(false);
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Try to get address from coordinates using a reverse geocoding service
          // For now, just use the coordinates
          onChange(`Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`, {
            lat: latitude,
            lng: longitude
          });
        } catch (error) {
          console.error('Error getting address:', error);
          onChange(`Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`, {
            lat: latitude,
            lng: longitude
          });
        } finally {
          setIsGettingLocation(false);
          setIsOpen(false);
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to get your current location. Please check your location permissions.');
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 60000
      }
    );
  };

  const clearLocation = () => {
    onChange('');
    setIsOpen(false);
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        
        <Input
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />

        {value && (
          <button
            onClick={clearLocation}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && (
        <Card className="absolute z-50 w-full mt-1 shadow-lg">
          <CardContent className="p-0 max-h-64 overflow-y-auto">
            {showCurrentLocation && (
              <button
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                className="w-full flex items-center px-4 py-3 hover:bg-gray-50 text-left border-b border-gray-100"
              >
                <Navigation className={`h-5 w-5 mr-3 ${isGettingLocation ? 'animate-spin' : 'text-blue-600'}`} />
                <div>
                  <div className="font-medium text-blue-600">
                    {isGettingLocation ? 'Getting location...' : 'Use current location'}
                  </div>
                  <div className="text-sm text-gray-500">
                    Find services near you
                  </div>
                </div>
              </button>
            )}

            {suggestions.length > 0 ? (
              suggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full flex items-center px-4 py-3 hover:bg-gray-50 text-left border-b border-gray-100 last:border-b-0"
                >
                  <MapPin className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                  <div>
                    <div className="font-medium">{suggestion.name}</div>
                    <div className="text-sm text-gray-500 capitalize">
                      {suggestion.type}
                    </div>
                  </div>
                </button>
              ))
            ) : value && !isLoading ? (
              <div className="px-4 py-3 text-gray-500 text-center">
                <Search className="h-5 w-5 mx-auto mb-2" />
                <div>No locations found</div>
                <div className="text-sm">Try a different search term</div>
              </div>
            ) : !value ? (
              <div className="px-4 py-6 text-center">
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Popular Locations</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {pakistaniLocations.filter(loc => loc.type === 'city').slice(0, 6).map((city) => (
                      <button
                        key={city.id}
                        onClick={() => handleSuggestionClick(city)}
                        className="text-sm text-blue-600 hover:text-blue-800 text-left"
                      >
                        {city.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
