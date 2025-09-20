'use client';

import React from 'react';
import { MapPin, Navigation, Store, Wrench } from 'lucide-react';
import Link from 'next/link';
import InteractiveMap from '@/components/maps/InteractiveMap';
import { Button } from '@/components/ui/Button';
import { useLocationContext } from '@/lib/contexts/LocationContext';

export function MapsSection() {
  const { location, setShowLocationModal } = useLocationContext();

  const handleRequestLocation = () => {
    setShowLocationModal(true);
  };

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
            <MapPin className="h-8 w-8 text-blue-600" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Find Auto Shops Near You
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Discover trusted auto parts stores and service providers in your area. 
            Get directions, compare services, and connect with local mechanics.
          </p>

          {/* Location Status */}
          {location ? (
            <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-green-800 mb-6">
              <Navigation className="h-4 w-4" />
              <span className="text-sm font-medium">
                Showing shops near {location.city && location.area 
                  ? `${location.area}, ${location.city}`
                  : location.city || 'your location'
                }
              </span>
            </div>
          ) : (
            <div className="mb-6">
              <Button
                onClick={handleRequestLocation}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Navigation className="h-4 w-4 mr-2" />
                Enable Location to See Nearby Shops
              </Button>
            </div>
          )}
        </div>

        {/* Interactive Map */}
        <div className="mb-12">
          <InteractiveMap 
            height="500px"
            defaultZoom={location ? 13 : 11}
            showControls={true}
            className="shadow-lg"
          />
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
              <Store className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Local Auto Parts Stores
            </h3>
            <p className="text-gray-600 text-sm">
              Find genuine and aftermarket parts from verified sellers in your neighborhood.
            </p>
          </div>

          <div className="text-center p-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
              <Wrench className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Professional Services
            </h3>
            <p className="text-gray-600 text-sm">
              Book appointments with certified mechanics and service centers near you.
            </p>
          </div>

          <div className="text-center p-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4">
              <Navigation className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Easy Navigation
            </h3>
            <p className="text-gray-600 text-sm">
              Get directions and contact information for all listed shops and services.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Can't Find What You Need?
            </h3>
            <p className="text-gray-600 mb-6">
              Browse our complete catalog of products and services, or use our advanced search 
              to find exactly what you're looking for.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                asChild
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Link href="/products">
                  <Store className="h-4 w-4 mr-2" />
                  Browse All Products
                </Link>
              </Button>
              <Button 
                asChild
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <Link href="/services">
                  <Wrench className="h-4 w-4 mr-2" />
                  Find Services
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default MapsSection;
