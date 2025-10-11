'use client';

import React from 'react';
import { MapPin, Navigation, Store, Wrench } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import InteractiveMap from '@/components/maps/InteractiveMap';
import { Button } from '@/components/ui/Button';
import { useLocationContext } from '@/lib/contexts/LocationContext';
import { useTranslations } from 'next-intl';

export function MapsSection() {
  const { location, setShowLocationModal } = useLocationContext();
  const t = useTranslations('common.mapsSection');
  const pathname = usePathname();
  const currentLocale = pathname?.split('/').filter(Boolean)[0] === 'ar' ? 'ar' : 'en';

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
            {t('findAutoShops')}
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            {t('discoverTrustedShops')}
          </p>

          {/* Location Status */}
          {location ? (
            <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-green-800 mb-6">
              <Navigation className="h-4 w-4" />
              <span className="text-sm font-medium">
                {t('showingShopsNear', { 
                  location: location.city && location.area 
                    ? `${location.area}, ${location.city}`
                    : location.city || t('yourLocation')
                })}
              </span>
            </div>
          ) : (
            <div className="mb-6">
              <Button
                onClick={handleRequestLocation}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Navigation className="h-4 w-4 mr-2" />
                {t('enableLocation')}
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
              {t('localAutoPartsStores')}
            </h3>
            <p className="text-gray-600 text-sm">
              {t('localAutoPartsStoresDesc')}
            </p>
          </div>

          <div className="text-center p-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
              <Wrench className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('professionalServices')}
            </h3>
            <p className="text-gray-600 text-sm">
              {t('professionalServicesDesc')}
            </p>
          </div>

          <div className="text-center p-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4">
              <Navigation className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('easyNavigation')}
            </h3>
            <p className="text-gray-600 text-sm">
              {t('easyNavigationDesc')}
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {t('cantFindWhatYouNeed')}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('browseCompleteCatalog')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                asChild
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Link href={`/${currentLocale}/products`}>
                  <Store className="h-4 w-4 mr-2" />
                  {t('browseAllProducts')}
                </Link>
              </Button>
              <Button 
                asChild
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <Link href={`/${currentLocale}/services`}>
                  <Wrench className="h-4 w-4 mr-2" />
                  {t('findServices')}
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
