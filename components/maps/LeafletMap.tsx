'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useLocationContext } from '@/lib/contexts/LocationContext';
import { apiClient } from '@/lib/api/client';
import { Seller } from '@/types';
import { MapPin, Loader2 } from 'lucide-react';

// Dynamically import Leaflet components to avoid SSR issues
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

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

interface LeafletMapProps {
  height?: string;
  defaultZoom?: number;
  className?: string;
}

interface ShopMarkerData {
  seller: Seller;
  position: { lat: number; lng: number };
  distance?: number;
}

export function LeafletMap({
  height = '400px',
  defaultZoom = 12,
  className = ''
}: LeafletMapProps) {
  const { location, loading: locationLoading } = useLocationContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shops, setShops] = useState<ShopMarkerData[]>([]);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  // Load Leaflet CSS and initialize
  useEffect(() => {
    const loadLeaflet = async () => {
      try {
        console.log('LeafletMap: Starting Leaflet initialization...');
        // Dynamically import Leaflet CSS
        const leafletCss = document.createElement('link');
        leafletCss.rel = 'stylesheet';
        leafletCss.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        leafletCss.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
        leafletCss.crossOrigin = '';
        document.head.appendChild(leafletCss);

        // Wait for CSS to load
        await new Promise(resolve => {
          leafletCss.onload = resolve;
        });

        console.log('LeafletMap: Leaflet CSS loaded successfully');
        setLeafletLoaded(true);
      } catch (err) {
        console.error('Failed to load Leaflet:', err);
        setError('Failed to load map');
      }
    };

    // Add timeout to prevent hanging
    const timeoutId = setTimeout(() => {
      console.warn('LeafletMap: CSS loading timeout');
      setError('Map loading timeout');
    }, 8000); // 8 second timeout

    loadLeaflet().finally(() => {
      clearTimeout(timeoutId);
    });
  }, []);

  // Load shops data
  useEffect(() => {
    if (!leafletLoaded) return;
    
    const loadNearbyShops = async () => {
      try {
        setLoading(true);
        
        // Default center (Dubai if no user location)
        const center = location 
          ? { lat: location.latitude, lng: location.longitude }
          : { lat: 25.2048, lng: 55.2708 };

        // Get nearby sellers using location-based endpoint
        const response = await apiClient.getNearbySellers(
          center.lat, 
          center.lng, 
          50, // 50km radius
          20  // max 20 shops
        );

        if (response.data.success) {
          const sellers = response.data.data.sellers || [];
          
          // Filter sellers with coordinates (they should already have distance from API)
          const shopsWithLocation = sellers
            .filter((seller: any) => seller.latitude && seller.longitude)
            .map((seller: any) => {
              // Use distance from API response, or calculate if not available
              const distance = seller.distance || (location ? calculateDistance(
                location.latitude,
                location.longitude,
                seller.latitude,
                seller.longitude
              ) : 0);

              return {
                seller,
                position: { lat: seller.latitude, lng: seller.longitude },
                distance
              };
            })
            .sort((a: any, b: any) => a.distance - b.distance); // Sort by distance (API already filtered by radius)

          setShops(shopsWithLocation);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Failed to load shops:', error);
        setError('Failed to load nearby shops');
        setLoading(false);
      }
    };

    loadNearbyShops();
  }, [leafletLoaded, location]);

  // Calculate distance between two points
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const toRadians = (degrees: number): number => {
    return degrees * (Math.PI / 180);
  };

  const formatDistance = (distance: number): string => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    } else if (distance < 10) {
      return `${distance.toFixed(1)}km`;
    } else {
      return `${Math.round(distance)}km`;
    }
  };

  if (!leafletLoaded || loading || locationLoading) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}
        style={{ height }}
      >
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-gray-600 text-sm">Loading map...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}
        style={{ height }}
      >
        <div className="text-center">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // Default center (Dubai if no user location)
  const center = location 
    ? [location.latitude, location.longitude] as [number, number]
    : [25.2048, 55.2708] as [number, number];

  return (
    <div className={`relative rounded-lg overflow-hidden z-0 ${className}`}>
      <MapContainer
        center={center}
        zoom={defaultZoom}
        style={{ height, width: '100%' }}
        className="rounded-lg z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* User location marker */}
        {location && (
          <Marker position={[location.latitude, location.longitude]}>
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-blue-600">Your Location</h3>
                <p className="text-sm text-gray-600">
                  {location.city && location.area 
                    ? `${location.area}, ${location.city}`
                    : location.city || 'Current Location'
                  }
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Shop markers */}
        {shops.map((shop) => (
          <Marker 
            key={shop.seller.id}
            position={[shop.position.lat, shop.position.lng]}
          >
            <Popup>
              <div className="p-3 max-w-xs">
                <h3 className="font-semibold text-gray-900 mb-1">
                  {shop.seller.shopName}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {shop.seller.area}, {shop.seller.city}
                </p>
                {shop.distance && (
                  <p className="text-xs text-gray-500 mb-2">
                    📍 {formatDistance(shop.distance)} away
                  </p>
                )}
                {shop.seller.ratingAverage && (
                  <p className="text-sm text-gray-600 mb-3">
                    ⭐ {shop.seller.ratingAverage.toFixed(1)} ({shop.seller.ratingCount} reviews)
                  </p>
                )}
                <div className="flex gap-2">
                  <a
                    href={`/shop/${shop.seller.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                  >
                    🏪 View Shop
                  </a>
                  <a
                    href={`/products?sellerId=${shop.seller.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                  >
                    📦 Products
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Map overlay info */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 max-w-xs z-10">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span>Your Location</span>
        </div>
        <div className="flex items-center gap-2 text-sm mt-1">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span>Auto Shops ({shops.length} nearby)</span>
        </div>
      </div>
    </div>
  );
}

export default LeafletMap;
