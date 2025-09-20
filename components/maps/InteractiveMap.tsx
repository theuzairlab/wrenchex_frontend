'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { useLocationContext } from '@/lib/contexts/LocationContext';
import { apiClient } from '@/lib/api/client';
import { Seller } from '@/types';
import { MapPin } from 'lucide-react';
import LeafletMap from './LeafletMap';

interface InteractiveMapProps {
  height?: string;
  defaultZoom?: number;
  showControls?: boolean;
  className?: string;
}

interface ShopMarkerData {
  seller: Seller;
  position: { lat: number; lng: number };
  popularProducts?: any[];
  popularServices?: any[];
}

export function InteractiveMap({
  height = '400px',
  defaultZoom = 12,
  showControls = true,
  className = ''
}: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const userLocationMarkerRef = useRef<google.maps.Marker | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  
  const { location, loading: locationLoading, requestLocation } = useLocationContext();
  const [loading, setLoading] = useState(false); // Start with false so map div renders
  const [error, setError] = useState<string | null>(null);
  const [shops, setShops] = useState<ShopMarkerData[]>([]);
  const [useGoogleMaps, setUseGoogleMaps] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [mapInitialized, setMapInitialized] = useState(false);

  // Set mounted state
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Listen for location request messages from info window
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'REQUEST_LOCATION') {
        console.log('📍 Location request received from info window');
        console.log('📍 Current location before request:', location);
        requestLocation().then(() => {
          console.log('📍 Location request completed, new location:', location);
        }).catch((error) => {
          console.error('📍 Location request failed:', error);
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [requestLocation, location]);

  // Debug shops state changes
  useEffect(() => {
    console.log(`🔄 InteractiveMap: Shops state updated - now has ${shops.length} shops`);
    if (shops.length > 0) {
      console.log(`🏪 Shop names: ${shops.map(s => s.seller.shopName).join(', ')}`);
    }
  }, [shops]);

  // Initialize Google Maps - only after component is mounted and map div is rendered
  useEffect(() => {
    if (!isMounted) {
      console.log('🚫 InteractiveMap: Component not mounted yet');
      return;
    }
    
    // Only initialize if we're using Google Maps and component is not loading
    if (!useGoogleMaps || loading) {
      console.log('🚫 InteractiveMap: Skipping - useGoogleMaps:', useGoogleMaps, 'loading:', loading);
      return;
    }
    
    // Wait for DOM element to be available
    const initTimeout = setTimeout(() => {
      if (!mapRef.current) {
        console.error('❌ InteractiveMap: Map div not found, falling back to LeafletMap');
        setUseGoogleMaps(false);
        return;
      }
      
      console.log('✅ InteractiveMap: Map div found, initializing Google Maps...');
      initMap();
    }, 200);
    
    const initMap = async () => {
      if (mapInitialized) {
        console.log('🚫 InteractiveMap: Already initialized, skipping...');
        return;
      }
      
      console.log('🚀 InteractiveMap: Starting map initialization...');
      setLoading(true);
      
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      console.log('🔑 InteractiveMap: API Key available:', !!apiKey);
      
      if (!apiKey) {
        console.log('❌ Google Maps API key not configured, falling back to OpenStreetMap');
        setUseGoogleMaps(false);
        setLoading(false);
        return;
      }

      try {
        console.log('📡 InteractiveMap: Loading Google Maps...');
        const loader = new Loader({
          apiKey,
          version: 'weekly',
          libraries: ['places']
        });

        await loader.load();
        console.log('✅ InteractiveMap: Google Maps loaded successfully');

        // Final check for mapRef
        if (!mapRef.current) {
          console.error('❌ InteractiveMap: Map element lost during initialization');
          setUseGoogleMaps(false);
          setLoading(false);
          return;
        }

        // Default center (Dubai if no user location)
        const defaultLat = parseFloat(process.env.NEXT_PUBLIC_DEFAULT_LOCATION_LAT || '33.6844');
        const defaultLng = parseFloat(process.env.NEXT_PUBLIC_DEFAULT_LOCATION_LNG || '73.0479');
        const defaultCenter = { lat: defaultLat, lng: defaultLng };
        const center = location 
          ? { lat: location.latitude, lng: location.longitude }
          : defaultCenter;

        console.log('InteractiveMap: Initializing map with center:', center);

        // Initialize map
        const map = new google.maps.Map(mapRef.current, {
          center,
          zoom: defaultZoom,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ],
          disableDefaultUI: !showControls,
          zoomControl: showControls,
          streetViewControl: showControls,
          fullscreenControl: showControls
        });

        mapInstanceRef.current = map;
        console.log('✅ InteractiveMap: Google Maps instance created successfully');

        // Add user location marker if available
        if (location) {
          console.log('📍 Adding user location marker at:', location.latitude, location.longitude);
          new google.maps.Marker({
            position: { lat: location.latitude, lng: location.longitude },
            map,
            title: 'Your Location',
            icon: {
              url: 'data:image/svg+xml;base64,' + btoa(`
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="8" fill="#3B82F6" stroke="white" stroke-width="2"/>
                  <circle cx="12" cy="12" r="3" fill="white"/>
                </svg>
              `),
              scaledSize: new google.maps.Size(24, 24),
              anchor: new google.maps.Point(12, 12)
            }
          });
        }

        // Initialize info window
        infoWindowRef.current = new google.maps.InfoWindow();

        // Load nearby shops (don't wait for it to complete)
        console.log('🏪 Starting to load nearby shops...');
        loadNearbyShops(center).catch(error => {
          console.error('❌ Shop loading failed:', error);
        });

        // Mark as initialized and complete loading
        console.log('🎉 InteractiveMap: Map initialization completed successfully');
        setMapInitialized(true);
        setLoading(false);
      } catch (err) {
        console.error('Failed to initialize Google Maps, falling back to OpenStreetMap:', err);
        setUseGoogleMaps(false);
        setLoading(false);
      }
    };

    // Add a timeout to prevent infinite loading
    const mapTimeout = setTimeout(() => {
      console.warn('InteractiveMap: Map initialization timeout, falling back to OpenStreetMap');
      setUseGoogleMaps(false);
      setLoading(false);
    }, 15000); // 15 second timeout

    initMap().finally(() => {
      clearTimeout(mapTimeout);
    });
    
    // Cleanup function
    return () => {
      clearTimeout(initTimeout);
      clearTimeout(mapTimeout);
      if (mapInstanceRef.current) {
        // Clean up map instance if needed
        console.log('🧹 InteractiveMap: Cleaning up map instance');
      }
    };
  }, [isMounted, useGoogleMaps, loading, mapInitialized, location, defaultZoom, showControls]);

  // Update user location marker when location changes
  useEffect(() => {
    if (mapInitialized && location && mapInstanceRef.current) {
      addUserLocationMarker();
    }
  }, [location, mapInitialized]);

  // Update any open info windows when location becomes available
  useEffect(() => {
    if (location && infoWindowRef.current) {
      // If there's an open info window, refresh it to show distance
      const currentContent = infoWindowRef.current.getContent();
      if (currentContent && typeof currentContent === 'string' && currentContent.includes('Enable location for distance')) {
        console.log('🔄 Location became available, refreshing open info window');
        // Find the currently selected marker and refresh its info window
        // We need to find which marker is currently selected and refresh its info window
        const selectedMarker = markersRef.current.find(marker => {
          // Check if this marker has an open info window
          const infoWindowPosition = infoWindowRef.current?.getPosition();
          const markerPosition = marker.getPosition();
          return infoWindowPosition && markerPosition && infoWindowPosition.equals(markerPosition);
        });
        
        if (selectedMarker) {
          // Find the shop data for this marker
          const shopData = shops.find(shop => 
            shop.position.lat === selectedMarker.getPosition()?.lat() &&
            shop.position.lng === selectedMarker.getPosition()?.lng()
          );
          
          if (shopData) {
            console.log('🔄 Refreshing info window for shop:', shopData.seller.shopName);
            showShopInfoWindow(selectedMarker, shopData);
          }
        }
      }
    }
  }, [location, shops]);

  // Load nearby shops from API
  const loadNearbyShops = async (center: { lat: number; lng: number }) => {
    try {
      console.log('🏪 Loading nearby shops...');
      
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      // Get nearby sellers using public endpoint
      const response = await apiClient.get('/sellers/public?limit=50', {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      console.log('🔍 Full API response:', response);
      console.log('🔍 Response data:', response.data);
      console.log('🔍 Response data success:', response.data.success);
      console.log('🔍 Response data type:', typeof response.data);
      
      // Handle both response structures: {success: true, data: {sellers: []}} or {sellers: []}
      let sellers = [];
      if (response.data.success && response.data.data && response.data.data.sellers) {
        // Standard API response structure
        sellers = response.data.data.sellers;
        console.log(`🏪 InteractiveMap: API returned ${sellers.length} sellers (standard structure)`);
      } else if (response.data.sellers) {
        // Direct response structure
        sellers = response.data.sellers;
        console.log(`🏪 InteractiveMap: API returned ${sellers.length} sellers (direct structure)`);
      } else {
        console.error('❌ Unknown API response structure:', response.data);
        throw new Error('Unknown API response structure');
      }
      
      if (sellers && sellers.length >= 0) {
        
        // Filter sellers with coordinates and calculate distance
        const sellersWithCoords = sellers.filter((seller: any) => seller.latitude && seller.longitude);
        console.log(`📍 InteractiveMap: ${sellersWithCoords.length} sellers have coordinates`);
        
        const shopsWithLocation = sellersWithCoords.map((seller: any) => {
          const distance = location ? calculateDistance(
            location.latitude,
            location.longitude,
            seller.latitude,
            seller.longitude
          ) : 0;

          return {
            seller,
            position: { lat: seller.latitude, lng: seller.longitude },
            distance,
            popularProducts: [], // We could fetch these if needed
            popularServices: []  // We could fetch these if needed
          };
        })
        .filter((shop: any) => !location || shop.distance <= 50) // Within 50km if user location available
        .sort((a: any, b: any) => a.distance - b.distance)
        .slice(0, 20); // Limit to 20 shops for performance

        console.log(`🎯 InteractiveMap: Setting ${shopsWithLocation.length} shops on map, updating state...`);
        setShops(shopsWithLocation);
        
        // Add markers after a small delay to ensure map is ready
        setTimeout(() => {
          if (mapInstanceRef.current) {
            console.log(`✅ InteractiveMap: Map instance ready, adding ${shopsWithLocation.length} markers`);
            addShopMarkers(shopsWithLocation);
            addUserLocationMarker(); // Add user location marker
          } else {
            console.error(`❌ InteractiveMap: Map instance still not available after timeout`);
          }
        }, 500);
      }
    } catch (error) {
      console.error('Failed to load shops:', error);
      // Don't let shop loading failure prevent map from showing
      setShops([]);
    }
  };

  // Add user location marker to map
  const addUserLocationMarker = () => {
    if (!mapInstanceRef.current || !location) {
      return;
    }

    if (!window.google || !google.maps) {
      return;
    }

    // Remove existing user location marker
    if (userLocationMarkerRef.current) {
      userLocationMarkerRef.current.setMap(null);
    }

    // Create blue marker for user location
    const userMarker = new google.maps.Marker({
      position: { lat: location.latitude, lng: location.longitude },
      map: mapInstanceRef.current,
      title: 'Your Location',
      icon: {
        url: 'data:image/svg+xml;base64,' + btoa(`
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="8" fill="#3B82F6" stroke="white" stroke-width="3"/>
            <circle cx="12" cy="12" r="4" fill="white"/>
            <circle cx="12" cy="12" r="2" fill="#3B82F6"/>
          </svg>
        `),
        scaledSize: new google.maps.Size(24, 24),
        anchor: new google.maps.Point(12, 12)
      },
      zIndex: 1000 // Higher z-index to appear above shop markers
    });

    // Add click listener for user location info
    userMarker.addListener('click', () => {
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
        infoWindowRef.current.setContent(`
          <div style="padding: 10px; font-family: system-ui, sans-serif;">
            <h3 style="margin: 0 0 8px 0; color: #3B82F6; font-size: 16px;">📍 Your Location</h3>
            <p style="margin: 0; color: #64748B; font-size: 14px;">
              ${location.city ? `${location.city}${location.area ? `, ${location.area}` : ''}` : 'Current Location'}
            </p>
          </div>
        `);
        infoWindowRef.current.open(mapInstanceRef.current, userMarker);
      }
    });

    userLocationMarkerRef.current = userMarker;
    console.log('🔵 Added user location marker at', location.latitude, location.longitude);
  };

  // Add shop markers to map
  const addShopMarkers = (shops: ShopMarkerData[]) => {
    console.log(`🎨 addShopMarkers: Called with ${shops.length} shops`);
    
    if (!mapInstanceRef.current) {
      console.error('🚫 addShopMarkers: Map instance not available');
      return;
    }

    if (!window.google || !google.maps) {
      console.error('🚫 addShopMarkers: Google Maps not loaded');
      return;
    }

    // Clear existing markers
    console.log(`🧹 Clearing ${markersRef.current.length} existing markers`);
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    console.log(`🎯 Adding ${shops.length} new markers...`);
    shops.forEach((shop, index) => {
      console.log(`📍 Adding marker ${index + 1}: ${shop.seller.shopName} at [${shop.position.lat}, ${shop.position.lng}]`);
      // Note: Using legacy Marker for compatibility. AdvancedMarkerElement requires additional setup
      const marker = new google.maps.Marker({
        position: shop.position,
        map: mapInstanceRef.current!,
        title: shop.seller.shopName,
        icon: {
          url: 'data:image/svg+xml;base64,' + btoa(`
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 2C11.03 2 7 6.03 7 11c0 7.25 9 19 9 19s9-11.75 9-19c0-4.97-4.03-9-9-9z" fill="#EF4444" stroke="white" stroke-width="2"/>
              <circle cx="16" cy="11" r="4" fill="white"/>
              <path d="M14 9h4v4h-4z" fill="#EF4444"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(32, 32),
          anchor: new google.maps.Point(16, 32)
        }
      });

      // Add click listener for info window
      marker.addListener('click', () => {
        showShopInfoWindow(marker, shop);
      });

      markersRef.current.push(marker);
    });
    
    console.log(`✅ addShopMarkers: Successfully added ${markersRef.current.length} markers to map!`);
  };


  // Show info window for shop
  const showShopInfoWindow = (marker: google.maps.Marker, shop: ShopMarkerData) => {
    if (!infoWindowRef.current) return;

    const { seller } = shop;
    
    console.log('🔍 showShopInfoWindow - Location debug:', {
      location,
      hasLocation: !!location,
      locationType: typeof location,
      locationKeys: location ? Object.keys(location) : 'no location',
      shopPosition: shop.position
    });
    
    // Calculate displacement distance if location is available
    const displacementDistance = location ? calculateDistance(
      location.latitude,
      location.longitude,
      shop.position.lat,
      shop.position.lng
    ) : null;

    console.log('📏 Distance calculation:', {
      displacementDistance,
      isNull: displacementDistance === null,
      isUndefined: displacementDistance === undefined,
      isNumber: typeof displacementDistance === 'number'
    });

    // Calculate distance display text
    let distanceText = '📍 Location in area';
    if (location && displacementDistance !== null && displacementDistance !== undefined) {
      const formattedDistance = formatDistance(displacementDistance);
      distanceText = `📍 ${formattedDistance} away`;
      console.log('✅ Using calculated distance:', formattedDistance);
    } else {
      // Show fallback text when location is not available
      if (!location) {
        distanceText = '📍 Enable location for distance';
        console.log('❌ No location available');
      } else {
        console.log('❌ Location available but distance calculation failed');
        distanceText = '📍 Distance calculation failed';
      }
    }

    // Show content with calculated distance
    const initialContent = `
      <div style="max-width: 300px; padding: 16px;">
        <div style="display: flex; align-items: center; margin-bottom: 12px;">
          <div style="flex: 1;">
            <h3 style="margin: 0; font-size: 18px; font-weight: bold; color: #111827;">
              ${seller.shopName}
            </h3>
            <p style="margin: 4px 0 0 0; color: #6B7280; font-size: 14px;">
              ${seller.area}, ${seller.city}
            </p>
            <p style="margin: 4px 0 0 0; color: ${!location ? '#F59E0B' : '#6B7280'}; font-size: 12px;">
              ${distanceText}
            </p>
            ${!location ? `
              <p style="margin: 4px 0 0 0; color: #9CA3AF; font-size: 11px; font-style: italic;">
                Allow location access to see exact distance
              </p>
            ` : ''}
          </div>
        </div>
        
        ${seller.ratingAverage ? `
          <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 8px;">
            <span style="color: #F59E0B;">⭐</span>
            <span style="font-weight: 500; color: #111827;">${seller.ratingAverage.toFixed(1)}</span>
            <span style="color: #6B7280; font-size: 12px;">(Shop Rating)</span>
          </div>
        ` : ''}
        
        <div style="display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap;">
          <a href="/shop/${seller.id}" target="_blank" style="display: inline-block; background: #3B82F6; color: white; padding: 6px 12px; border-radius: 6px; text-decoration: none; font-size: 12px; font-weight: 500;">
            🏪 View Shop
          </a>
          <button onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${shop.position.lat},${shop.position.lng}', '_blank')" style="background: #10B981; color: white; padding: 6px 12px; border-radius: 6px; border: none; font-size: 12px; font-weight: 500; cursor: pointer;">
            🧭 Directions
          </button>
          ${!location ? `
            <button onclick="window.parent.postMessage({type: 'REQUEST_LOCATION'}, '*')" style="background: #F59E0B; color: white; padding: 6px 12px; border-radius: 6px; border: none; font-size: 12px; font-weight: 500; cursor: pointer;">
              📍 Enable Location
            </button>
          ` : ''}
        </div>
      </div>
    `;

    infoWindowRef.current.setContent(initialContent);
    infoWindowRef.current.open(mapInstanceRef.current, marker);
  };

  // Highlight user location
  const highlightUserLocation = () => {
    if (!userLocationMarkerRef.current || !mapInstanceRef.current) return;
    
    // Center map on user location and zoom in
    const userPosition = userLocationMarkerRef.current.getPosition();
    if (userPosition) {
      mapInstanceRef.current.setCenter(userPosition);
      mapInstanceRef.current.setZoom(15);
      
      // Open user location info window
      if (infoWindowRef.current && location) {
        infoWindowRef.current.close();
        infoWindowRef.current.setContent(`
          <div style="padding: 10px; font-family: system-ui, sans-serif;">
            <h3 style="margin: 0 0 8px 0; color: #3B82F6; font-size: 16px;">📍 Your Location</h3>
            <p style="margin: 0; color: #64748B; font-size: 14px;">
              ${location.city ? `${location.city}${location.area ? `, ${location.area}` : ''}` : 'Current Location'}
            </p>
          </div>
        `);
        infoWindowRef.current.open(mapInstanceRef.current, userLocationMarkerRef.current);
      }
    }
  };

  // Highlight all shops
  const highlightShops = () => {
    if (!mapInstanceRef.current || shops.length === 0) return;
    
    // Close any open info window
    if (infoWindowRef.current) {
      infoWindowRef.current.close();
    }
    
    // Calculate bounds to fit all shops
    const bounds = new google.maps.LatLngBounds();
    
    // Add all shop positions to bounds
    shops.forEach(shop => {
      bounds.extend(new google.maps.LatLng(shop.position.lat, shop.position.lng));
    });
    
    // Include user location if available
    if (location) {
      bounds.extend(new google.maps.LatLng(location.latitude, location.longitude));
    }
    
    // Fit map to show all shops
    mapInstanceRef.current.fitBounds(bounds, 50);
    
    // Animate markers by creating a subtle bounce effect
    markersRef.current.forEach((marker, index) => {
      setTimeout(() => {
        if (marker.getAnimation() !== google.maps.Animation.BOUNCE) {
          marker.setAnimation(google.maps.Animation.BOUNCE);
          // Stop bouncing after 2 seconds
          setTimeout(() => {
            marker.setAnimation(null);
          }, 2000);
        }
      }, index * 200); // Stagger the animations
    });
  };

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

  // Use LeafletMap fallback if Google Maps is not available
  if (!useGoogleMaps) {
    return (
      <LeafletMap 
        height={height}
        defaultZoom={defaultZoom}
        className={className}
      />
    );
  }

  // Always render the map container (Zameen.com approach)
  return (
    <div className={`relative rounded-lg overflow-hidden z-0 ${className}`}>
      {/* Map container - always rendered */}
      <div 
        ref={mapRef}
        style={{ height, width: '100%' }}
        className="rounded-lg z-0 bg-gray-100"
      />
      
      {/* Loading overlay */}
      {(loading || locationLoading) && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-90 z-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600 text-sm">Loading map...</p>
          </div>
        </div>
      )}
      
      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-90 z-20">
          <div className="text-center">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 text-sm">{error}</p>
          </div>
        </div>
      )}
      
      {/* Map overlay info - only show when map is ready */}
      {mapInitialized && !loading && !locationLoading && !error && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 max-w-xs z-10">
          <button 
            onClick={highlightUserLocation}
            className="flex items-center gap-2 text-sm w-full p-2 rounded hover:bg-blue-50 transition-colors cursor-pointer"
            disabled={!userLocationMarkerRef.current}
          >
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Your Location</span>
          </button>
          <button 
            onClick={highlightShops}
            className="flex items-center gap-2 text-sm w-full p-2 rounded hover:bg-red-50 transition-colors cursor-pointer mt-1"
            disabled={shops.length === 0}
          >
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Auto Shops ({shops.length} nearby)</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default InteractiveMap;
