'use client';

import React, { useState, useEffect } from 'react';
import { X, MapPin, Check, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LocationService, LocationData } from '@/lib/services/locationService';
import { useTranslations } from 'next-intl';

interface MapPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (location: LocationData) => void;
  initialLocation?: { lat: number; lng: number };
  title?: string;
}

export function MapPickerModal({
  isOpen,
  onClose,
  onLocationSelect,
  initialLocation,
  title = "Select Shop Location"
}: MapPickerModalProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(
    initialLocation && initialLocation.lat && initialLocation.lng ? initialLocation : null
  );
  const [locationDetails, setLocationDetails] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [useGoogleMaps, setUseGoogleMaps] = useState(true);
  const [searchAddress, setSearchAddress] = useState('');
  const [manualCoords, setManualCoords] = useState(() => {
    // Safely initialize manual coordinates
    const lat = initialLocation?.lat;
    const lng = initialLocation?.lng;
    return {
      latitude: lat && typeof lat === 'number' ? lat.toString() : '',
      longitude: lng && typeof lng === 'number' ? lng.toString() : ''
    };
  });
  const [showManualEntry, setShowManualEntry] = useState(false);
  const t = useTranslations('common.auth');

  // Initialize map when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const initMap = async () => {
      try {
        // Check if Google Maps is available
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        console.log('Google Maps API Key available:', !!apiKey);
        console.log('API Key prefix:', apiKey ? apiKey.substring(0, 10) + '...' : 'No key');
        
        if (!apiKey) {
          console.error('No Google Maps API key found. Please check your .env.local file');
          setUseGoogleMaps(false);
          return;
        }

        // Load Google Maps using the Loader for better reliability
        if (!window.google) {
          // Create a promise-based loader for Google Maps
          const loader = new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`;
            script.async = true;
            script.defer = true;
            
            // Create global callback
            (window as any).initGoogleMaps = () => {
              console.log('Google Maps loaded successfully');
              resolve();
            };
            
            script.onerror = (error) => {
              console.error('Failed to load Google Maps script:', error);
              reject(error);
            };
            
            document.head.appendChild(script);
          });
          
          try {
            await loader;
            initializeMap();
          } catch (error) {
            console.error('Google Maps loading failed:', error);
            setUseGoogleMaps(false);
          }
        } else {
          initializeMap();
        }
      } catch (error) {
        console.error('Error loading Google Maps:', error);
        setUseGoogleMaps(false);
      }
    };

    const initializeMap = () => {
      const mapElement = document.getElementById('map-picker');
      if (!mapElement) return;

      // Default to user's current location or a default location
      const defaultLocation = (initialLocation && initialLocation.lat && initialLocation.lng) 
        ? initialLocation 
        : { lat: 33.6844, lng: 73.0479 }; // Islamabad

      const mapInstance = new google.maps.Map(mapElement, {
        center: defaultLocation,
        zoom: 15,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      // Create marker
      const markerInstance = new google.maps.Marker({
        position: defaultLocation,
        map: mapInstance,
        draggable: true,
        title: 'Select your shop location'
      });

      setMap(mapInstance);
      setMarker(markerInstance);
      setSelectedLocation(defaultLocation);

      // Get initial location details
      getLocationDetails(defaultLocation.lat, defaultLocation.lng);

      // Handle marker drag
      markerInstance.addListener('dragend', () => {
        const position = markerInstance.getPosition();
        if (position) {
          const lat = position.lat();
          const lng = position.lng();
          setSelectedLocation({ lat, lng });
          getLocationDetails(lat, lng);
        }
      });

      // Handle map click
      mapInstance.addListener('click', (event: google.maps.MapMouseEvent) => {
        const lat = event.latLng?.lat();
        const lng = event.latLng?.lng();
        if (lat && lng) {
          markerInstance.setPosition({ lat, lng });
          setSelectedLocation({ lat, lng });
          getLocationDetails(lat, lng);
        }
      });
    };

    initMap();
  }, [isOpen, initialLocation]);

  const getLocationDetails = async (lat: number, lng: number) => {
    try {
      setLoading(true);
      const details = await LocationService.reverseGeocode(lat, lng);
      setLocationDetails(details);
    } catch (error) {
      console.error('Error getting location details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      const location = await LocationService.getCurrentLocation();
      
      if (location && map && marker) {
        const newLocation = { lat: location.latitude, lng: location.longitude };
        map.setCenter(newLocation);
        marker.setPosition(newLocation);
        setSelectedLocation(newLocation);
        await getLocationDetails(location.latitude, location.longitude);
      }
    } catch (error) {
      console.error('Error getting current location:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchLocation = async () => {
    if (!searchAddress.trim() || !map || !marker) return;

    try {
      setLoading(true);
      const geocoder = new google.maps.Geocoder();
      
      geocoder.geocode({ address: searchAddress }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          const lat = location.lat();
          const lng = location.lng();
          
          map.setCenter({ lat, lng });
          marker.setPosition({ lat, lng });
          setSelectedLocation({ lat, lng });
          getLocationDetails(lat, lng);
        }
        setLoading(false);
      });
    } catch (error) {
      console.error('Error searching location:', error);
      setLoading(false);
    }
  };

  const handleManualCoordinateEntry = async () => {
    const lat = parseFloat(manualCoords.latitude);
    const lng = parseFloat(manualCoords.longitude);
    
    if (isNaN(lat) || isNaN(lng)) {
      alert(t('pleaseEnterValidCoordinates'));
      return;
    }
    
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      alert(t('pleaseEnterValidCoordinatesRange'));
      return;
    }
    
    setLoading(true);
    try {
      const newLocation = { lat, lng };
      setSelectedLocation(newLocation);
      await getLocationDetails(lat, lng);
      setShowManualEntry(false);
    } catch (error) {
      console.error('Error processing manual coordinates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (selectedLocation && locationDetails) {
      onLocationSelect({
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng,
        city: locationDetails.city || 'Unknown City',
        area: locationDetails.area || 'Unknown Area',
        address: locationDetails.address || `${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}`,
        country: locationDetails.country || 'Unknown Country'
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{title}</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="p-1"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                placeholder="Search for an address or location..."
                onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
              />
            </div>
            <Button
              onClick={searchLocation}
              disabled={loading || !searchAddress.trim()}
              variant="outline"
            >
              Search
            </Button>
            <Button
              onClick={getCurrentLocation}
              disabled={loading}
              variant="outline"
              title="Use current location"
            >
              <Navigation className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative">
          {useGoogleMaps ? (
            <div id="map-picker" className="w-full h-full" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <div className="text-center max-w-md mx-auto p-6">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Google Maps not available</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Enter your shop coordinates manually or search for your address
                </p>
                
                {!showManualEntry ? (
                  <div className="space-y-3">
                    <Button
                      onClick={() => setShowManualEntry(true)}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      Enter Coordinates Manually
                    </Button>
                    <p className="text-xs text-gray-500">
                      You can find coordinates using Google Maps web or GPS apps
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Latitude *
                        </label>
                        <Input
                          type="number"
                          step="any"
                          placeholder="e.g. 33.684400"
                          value={manualCoords.latitude}
                          onChange={(e) => setManualCoords(prev => ({ ...prev, latitude: e.target.value }))}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Longitude *
                        </label>
                        <Input
                          type="number"
                          step="any"
                          placeholder="e.g. 73.047900"
                          value={manualCoords.longitude}
                          onChange={(e) => setManualCoords(prev => ({ ...prev, longitude: e.target.value }))}
                          className="w-full"
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowManualEntry(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleManualCoordinateEntry}
                        disabled={loading || !manualCoords.latitude || !manualCoords.longitude}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        {loading ? 'Processing...' : 'Set Location'}
                      </Button>
                    </div>
                    
                    <div className="text-xs text-gray-500 text-left">
                      <p className="font-medium mb-1">How to find coordinates:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Open Google Maps on web</li>
                        <li>Right-click your shop location</li>
                        <li>Click on the coordinates to copy</li>
                        <li>Paste latitude and longitude above</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {loading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>

        {/* Location Details */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-sm text-gray-700 mb-2">Selected Location:</h3>
              {selectedLocation && (
                <div className="space-y-1">
                  <p className="text-sm">
                    <span className="text-gray-600">Coordinates:</span> {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                  </p>
                  {locationDetails && (
                    <>
                      {locationDetails.address && (
                        <p className="text-sm">
                          <span className="text-gray-600">Address:</span> {locationDetails.address}
                        </p>
                      )}
                      {locationDetails.city && locationDetails.area && (
                        <p className="text-sm">
                          <span className="text-gray-600">Area:</span> {locationDetails.area}, {locationDetails.city}
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex gap-2 ml-4">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={!selectedLocation || !locationDetails}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Check className="h-4 w-4 mr-1" />
                Confirm Location
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
