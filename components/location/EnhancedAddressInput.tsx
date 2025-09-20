'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { MapPin, Navigation, X, Map } from 'lucide-react';
import { useLocationContext } from '@/lib/contexts/LocationContext';
import dynamic from 'next/dynamic';
import { useMapEvents } from 'react-leaflet';

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

// useMapEvents is a hook, so we'll import it normally and use it conditionally

export interface DetailedLocationData {
  latitude: number;
  longitude: number;
  streetAddress: string;
  shopNumber?: string;
  buildingName?: string;
  market?: string;
  sector?: string;
  landmark?: string;
  city: string;
  area: string;
  fullAddress: string;
}

interface EnhancedAddressInputProps {
  onLocationChange: (locationData: DetailedLocationData | null) => void;
  initialData?: Partial<DetailedLocationData>;
  className?: string;
  required?: boolean;
}

// Map click handler component
function LocationMarker({ position, setPosition }: any) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position === null ? null : (
    <Marker position={position} />
  );
}

export function EnhancedAddressInput({
  onLocationChange,
  initialData,
  className = '',
  required = false
}: EnhancedAddressInputProps) {
  const { location } = useLocationContext();
  const [showMap, setShowMap] = useState(false);
  const [mapPosition, setMapPosition] = useState<[number, number] | null>(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  
  // Form fields
  const [streetAddress, setStreetAddress] = useState(initialData?.streetAddress || '');
  const [shopNumber, setShopNumber] = useState(initialData?.shopNumber || '');
  const [buildingName, setBuildingName] = useState(initialData?.buildingName || '');
  const [market, setMarket] = useState(initialData?.market || '');
  const [sector, setSector] = useState(initialData?.sector || '');
  const [landmark, setLandmark] = useState(initialData?.landmark || '');
  const [city, setCity] = useState(initialData?.city || '');
  const [area, setArea] = useState(initialData?.area || '');

  // Load Leaflet CSS and initialize
  useEffect(() => {
    if (showMap && !leafletLoaded) {
      const loadLeaflet = async () => {
        try {
          const leafletCss = document.createElement('link');
          leafletCss.rel = 'stylesheet';
          leafletCss.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          leafletCss.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
          leafletCss.crossOrigin = '';
          document.head.appendChild(leafletCss);

          await new Promise(resolve => {
            leafletCss.onload = resolve;
          });

          setLeafletLoaded(true);
        } catch (err) {
          console.error('Failed to load Leaflet:', err);
        }
      };

      loadLeaflet();
    }
  }, [showMap, leafletLoaded]);

  // Set initial map position
  useEffect(() => {
    if (initialData?.latitude && initialData?.longitude) {
      setMapPosition([initialData.latitude, initialData.longitude]);
    } else if (location) {
      setMapPosition([location.latitude, location.longitude]);
    }
  }, [initialData, location]);

  // Update location data when any field changes
  useEffect(() => {
    if (streetAddress && city && area && mapPosition) {
      const fullAddress = [
        shopNumber,
        streetAddress,
        buildingName,
        market,
        landmark,
        area,
        city
      ].filter(Boolean).join(', ');

      const locationData: DetailedLocationData = {
        latitude: mapPosition[0],
        longitude: mapPosition[1],
        streetAddress,
        shopNumber: shopNumber || undefined,
        buildingName: buildingName || undefined,
        market: market || undefined,
        sector: sector || undefined,
        landmark: landmark || undefined,
        city,
        area,
        fullAddress
      };

      onLocationChange(locationData);
    } else {
      onLocationChange(null);
    }
  }, [
    streetAddress, shopNumber, buildingName, market, sector, landmark, 
    city, area, mapPosition, onLocationChange
  ]);

  const handleUseCurrentLocation = async () => {
    if (location) {
      setMapPosition([location.latitude, location.longitude]);
      setCity(location.city || '');
      setArea(location.area || '');
    }
  };

  const handleClearLocation = () => {
    setMapPosition(null);
    setStreetAddress('');
    setShopNumber('');
    setBuildingName('');
    setMarket('');
    setSector('');
    setLandmark('');
    setCity('');
    setArea('');
  };

  const center = mapPosition || (location ? [location.latitude, location.longitude] : [25.2048, 55.2708]) as [number, number];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Basic Address Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Street Address {required && <span className="text-red-500">*</span>}
          </label>
          <Input
            value={streetAddress}
            onChange={(e) => setStreetAddress(e.target.value)}
            placeholder="e.g., 123 Main Street"
            required={required}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Shop/Unit Number
          </label>
          <Input
            value={shopNumber}
            onChange={(e) => setShopNumber(e.target.value)}
            placeholder="e.g., Shop 15, Unit A"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Building Name
          </label>
          <Input
            value={buildingName}
            onChange={(e) => setBuildingName(e.target.value)}
            placeholder="e.g., Al Manara Building"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Market/Mall
          </label>
          <Input
            value={market}
            onChange={(e) => setMarket(e.target.value)}
            placeholder="e.g., Central Market, Dubai Mall"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sector/District
          </label>
          <Input
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            placeholder="e.g., Sector 7, Industrial Area"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Landmark
          </label>
          <Input
            value={landmark}
            onChange={(e) => setLandmark(e.target.value)}
            placeholder="e.g., Near Metro Station"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Area {required && <span className="text-red-500">*</span>}
          </label>
          <Input
            value={area}
            onChange={(e) => setArea(e.target.value)}
            placeholder="e.g., Deira, Al Barsha"
            required={required}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            City {required && <span className="text-red-500">*</span>}
          </label>
          <Input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g., Dubai, Abu Dhabi"
            required={required}
          />
        </div>
      </div>

      {/* Location Actions */}
      <div className="flex gap-2 flex-wrap">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowMap(!showMap)}
          className="gap-2"
        >
          <Map className="h-4 w-4" />
          {showMap ? 'Hide Map' : 'Pin Location on Map'}
        </Button>

        {location && (
          <Button
            type="button"
            variant="outline" 
            size="sm"
            onClick={handleUseCurrentLocation}
            className="gap-2"
          >
            <Navigation className="h-4 w-4" />
            Use Current Location
          </Button>
        )}

        {(mapPosition || streetAddress) && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClearLocation}
            className="gap-2 text-red-600 hover:text-red-700"
          >
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Location Status */}
      {mapPosition && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
          <div className="flex items-center gap-2 text-green-800">
            <MapPin className="h-4 w-4" />
            <span className="font-medium">Location Set</span>
          </div>
          <p className="text-green-700 mt-1">
            Coordinates: {mapPosition[0].toFixed(6)}, {mapPosition[1].toFixed(6)}
          </p>
        </div>
      )}

      {/* Interactive Map */}
      {showMap && (
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <div className="bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 border-b">
            Click on the map to set your shop's exact location
          </div>
          
          {leafletLoaded ? (
            <MapContainer
              center={center}
              zoom={15}
              style={{ height: '300px', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationMarker position={mapPosition} setPosition={setMapPosition} />
            </MapContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600 text-sm">Loading map...</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default EnhancedAddressInput;
