'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, MapPin, Search, Target, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LocationService, LocationData } from '@/lib/services/locationService';
import { MapPickerModal } from './MapPickerModal';

interface HierarchicalLocationPickerProps {
  onLocationSelect: (location: LocationData & { address: string }) => void;
  defaultCity?: string;
  defaultArea?: string;
  defaultAddress?: string;
  placeholder?: string;
  className?: string;
}

// Pakistani Cities Data (expandable)
const CITIES_DATA = {
  'Islamabad': {
    areas: ['I-8', 'I-9', 'I-10', 'G-9', 'G-10', 'G-11', 'F-7', 'F-8', 'F-10', 'F-11', 'E-7', 'E-8', 'Blue Area', 'Sector H-8', 'Margalla Town'],
    coordinates: { lat: 33.6844, lng: 73.0479 }
  },
  'Karachi': {
    areas: ['Defence', 'Clifton', 'Gulshan-e-Iqbal', 'North Nazimabad', 'Saddar', 'Korangi', 'Malir', 'Gadap Town', 'Bin Qasim', 'Kemari'],
    coordinates: { lat: 24.8607, lng: 67.0011 }
  },
  'Lahore': {
    areas: ['DHA', 'Model Town', 'Gulberg', 'Johar Town', 'Allama Iqbal Town', 'Garden Town', 'Faisal Town', 'Valencia Town', 'Wapda Town'],
    coordinates: { lat: 31.5204, lng: 74.3587 }
  },
  'Rawalpindi': {
    areas: ['Saddar', 'Commercial Market', 'Satellite Town', 'Chaklala', 'Westridge', 'Bahria Town', 'DHA Phase I', 'DHA Phase II'],
    coordinates: { lat: 33.5651, lng: 73.0169 }
  },
  'Faisalabad': {
    areas: ['Jhang Road', 'Susan Road', 'Civil Lines', 'Peoples Colony', 'Madina Town', 'Eden Gardens', 'Government Colony'],
    coordinates: { lat: 31.4504, lng: 73.1350 }
  },
  'Multan': {
    areas: ['Cantonment', 'City Center', 'New Multan', 'Gulgasht Colony', 'Bosan Road', 'Delhi Gate'],
    coordinates: { lat: 30.1575, lng: 71.5249 }
  }
};

const CITIES = Object.keys(CITIES_DATA);

interface LocationStep {
  city: string;
  area: string;
  addressDetails: string;
  coordinates?: { lat: number; lng: number };
}

export function HierarchicalLocationPicker({
  onLocationSelect,
  defaultCity = '',
  defaultArea = '',
  defaultAddress = '',
  placeholder = 'Select location',
  className = ''
}: HierarchicalLocationPickerProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [locationData, setLocationData] = useState<LocationStep>({
    city: defaultCity,
    area: defaultArea,
    addressDetails: defaultAddress
  });
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [areaSearch, setAreaSearch] = useState('');
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Filter cities based on search; if no match, allow free-text entry
  const filteredCities = CITIES.filter(city =>
    city.toLowerCase().includes(citySearch.toLowerCase())
  );

  // Filter areas based on selected city and search
  const filteredAreas = locationData.city && CITIES_DATA[locationData.city as keyof typeof CITIES_DATA]
    ? CITIES_DATA[locationData.city as keyof typeof CITIES_DATA].areas.filter(area =>
        area.toLowerCase().includes(areaSearch.toLowerCase())
      )
    : [];

  // Handle city selection
  const handleCitySelect = (city: string) => {
    setLocationData(prev => ({
      ...prev,
      city,
      area: '', // Reset area when city changes
      addressDetails: ''
    }));
    setShowCityDropdown(false);
    setCitySearch('');
    setCurrentStep(2);
  };

  // Handle area selection
  const handleAreaSelect = (area: string) => {
    setLocationData(prev => ({
      ...prev,
      area
    }));
    setShowAreaDropdown(false);
    setAreaSearch('');
    setCurrentStep(3);
  };

  // Handle address details input
  const handleAddressChange = (value: string) => {
    setLocationData(prev => ({
      ...prev,
      addressDetails: value
    }));

    // Generate address suggestions
    if (value.length > 2) {
      generateAddressSuggestions(value);
    } else {
      setSuggestions([]);
    }
  };

  // Generate smart address suggestions
  const generateAddressSuggestions = (input: string) => {
    const commonPrefixes = ['House #', 'Plot #', 'Shop #', 'Office #'];
    const commonSuffixes = ['Street', 'Road', 'Avenue', 'Block', 'Phase'];
    
    const suggestions = [];
    
    // If user typed numbers, suggest house/plot formats
    if (/\d/.test(input)) {
      const numbers = input.match(/\d+/g);
      if (numbers) {
        const num = numbers[0];
        suggestions.push(`House # ${num}, ${locationData.area}`);
        suggestions.push(`Plot # ${num}, ${locationData.area}`);
        suggestions.push(`Shop # ${num}, ${locationData.area}`);
      }
    }
    
    // Add area-specific suggestions
    if (locationData.area) {
      suggestions.push(`${input}, ${locationData.area}, ${locationData.city}`);
    }
    
    setSuggestions(suggestions.slice(0, 5));
  };

  // Handle map location selection
  const handleMapLocationSelect = (mapLocation: LocationData) => {
    setLocationData(prev => ({
      ...prev,
      coordinates: {
        lat: mapLocation.latitude,
        lng: mapLocation.longitude
      }
    }));

    // Create final address string
    const fullAddress = `${locationData.addressDetails}, ${locationData.area}, ${locationData.city}`;
    
    onLocationSelect({
      ...mapLocation,
      address: fullAddress
    });

    setShowMapPicker(false);
    // Mark all steps as completed
    setCurrentStep(5);
  };

  // Handle final confirmation
  const handleConfirm = async () => {
    if (!locationData.city || !locationData.area || !locationData.addressDetails) {
      return;
    }

    setLoading(true);
    
    try {
      // Get coordinates for the selected city if not available
      let coordinates = locationData.coordinates;
      
      if (!coordinates) {
        const cityData = CITIES_DATA[locationData.city as keyof typeof CITIES_DATA];
        coordinates = cityData?.coordinates || { lat: 33.6844, lng: 73.0479 };
      }

      const fullAddress = `${locationData.addressDetails}, ${locationData.area}, ${locationData.city}`;

      const finalLocation: LocationData & { address: string } = {
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        city: locationData.city,
        area: locationData.area,
        country: 'Pakistan',
        address: fullAddress
      };

      onLocationSelect(finalLocation);
      // Mark all steps as completed so all ticks show
      setCurrentStep(5);
      // Visual feedback will be provided by parent via toast; emit a custom event as well
      try { window.dispatchEvent(new CustomEvent('seller-location-confirmed')); } catch {}
    } catch (error) {
      console.error('Error confirming location:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Progress Indicator */}
      <div className="flex items-center justify-between mb-4">
        {[1, 2, 3, 4].map((step, index) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= step
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {currentStep > step ? <Check className="w-4 h-4" /> : step}
            </div>
            {step < 4 && (
              <div
                className={`mx-2 w-16 h-0.5 ${
                  currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Labels */}
      <div className="flex justify-between text-xs text-gray-600 mb-6">
        <span>City</span>
        <span>Area</span>
        <span>Address</span>
        <span>Confirm</span>
      </div>

      {/* Step 1: City Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Select City *
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowCityDropdown(!showCityDropdown)}
            className="w-full p-3 border border-gray-300 rounded-lg text-left bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <div className="flex items-center justify-between">
              <span className={locationData.city ? 'text-gray-900' : 'text-gray-500'}>
                {locationData.city || 'Select your city'}
              </span>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </div>
          </button>

          {showCityDropdown && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
              <div className="p-2">
                <Input
                  placeholder="Search cities..."
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                  className="mb-2"
                />
              </div>
            <div className="max-h-60 overflow-y-auto">
                {filteredCities.length === 0 && citySearch && (
                  <button
                    onClick={() => handleCitySelect(citySearch)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100"
                  >
                    Use "{citySearch}"
                  </button>
                )}
                {filteredCities.map((city) => (
                  <button
                    key={city}
                    onClick={() => handleCitySelect(city)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100"
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Step 2: Area Selection */}
      {locationData.city && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Select Area/Location *
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowAreaDropdown(!showAreaDropdown)}
              className="w-full p-3 border border-gray-300 rounded-lg text-left bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <div className="flex items-center justify-between">
                <span className={locationData.area ? 'text-gray-900' : 'text-gray-500'}>
                  {locationData.area || 'Select area/location'}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
            </button>

            {showAreaDropdown && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                <div className="p-2">
                  <Input
                    placeholder="Search areas..."
                    value={areaSearch}
                    onChange={(e) => setAreaSearch(e.target.value)}
                    className="mb-2"
                  />
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {filteredAreas.length === 0 && areaSearch && (
                    <button
                      onClick={() => handleAreaSelect(areaSearch)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100"
                    >
                      Use "{areaSearch}"
                    </button>
                  )}
                  {filteredAreas.map((area) => (
                    <button
                      key={area}
                      onClick={() => handleAreaSelect(area)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100"
                    >
                      {area}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Address Details */}
      {locationData.area && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            House/Plot/Shop Number and Street *
          </label>
          <div className="relative">
            <Input
              placeholder="e.g. House # 487, Street 48"
              value={locationData.addressDetails}
              onChange={(e) => handleAddressChange(e.target.value)}
              className="w-full"
            />
            
            {/* Address Suggestions */}
            {suggestions.length > 0 && (
              <div className="absolute z-40 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setLocationData(prev => ({
                        ...prev,
                        addressDetails: suggestion.split(',')[0] // Take only the first part
                      }));
                      setSuggestions([]);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 text-sm"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 4: Map Confirmation & Actions */}
      {locationData.addressDetails && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900">Confirm Your Location</h4>
          <div className="text-sm text-gray-600">
            <p><strong>Address:</strong> {locationData.addressDetails}</p>
            <p><strong>Area:</strong> {locationData.area}</p>
            <p><strong>City:</strong> {locationData.city}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowMapPicker(true)}
              className="flex items-center gap-2"
            >
              <Target className="h-4 w-4" />
              Select Exact Location on Map
            </Button>
            
            <Button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <Check className="h-4 w-4" />
              {loading ? 'Confirming...' : 'Confirm Location'}
            </Button>
          </div>
        </div>
      )}

      {/* Map Picker Modal */}
      <MapPickerModal
        isOpen={showMapPicker}
        onClose={() => setShowMapPicker(false)}
        onLocationSelect={handleMapLocationSelect}
        initialLocation={
          locationData.coordinates || 
          (locationData.city && CITIES_DATA[locationData.city as keyof typeof CITIES_DATA]?.coordinates) ||
          undefined
        }
        title="Confirm Your Exact Shop Location"
      />
    </div>
  );
}
