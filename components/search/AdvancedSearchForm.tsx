'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Search, 
  Filter, 
  Car, 
  Package,
  Star,
  RotateCcw,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Select } from '@/components/ui_backup/Select';
import { cn } from '@/lib/utils';
import { Category, Product } from '@/types';
import { useTranslations } from 'next-intl';

interface AdvancedSearchFormProps {
  categories: Category[];
  featuredProducts: Product[];
}

interface SearchFormData {
  query: string;
  category: string;
  brand: string;
  condition: string;
  minPrice: string;
  maxPrice: string;
  minYear: string;
  maxYear: string;
  vehicleMake: string;
  vehicleModel: string;
  sortBy: string;
}

const carMakes = [
  'Toyota', 'Honda', 'Nissan', 'BMW', 'Mercedes-Benz', 'Audi', 
  'Volkswagen', 'Ford', 'Chevrolet', 'Hyundai', 'Kia', 'Mazda',
  'Mitsubishi', 'Subaru', 'Lexus', 'Infiniti', 'Porsche', 'Volvo'
];

const popularBrands = [
  'Bosch', 'Denso', 'NGK', 'Monroe', 'Bilstein', 'Brembo',
  'Castrol', 'Mobil', 'Shell', 'Fram', 'K&N', 'Hella'
];

const AdvancedSearchForm = ({ categories, featuredProducts }: AdvancedSearchFormProps) => {
  const router = useRouter();
  const t = useTranslations('common');
  const [formData, setFormData] = useState<SearchFormData>({
    query: '',
    category: '',
    brand: '',
    condition: '',
    minPrice: '',
    maxPrice: '',
    minYear: '',
    maxYear: '',
    vehicleMake: '',
    vehicleModel: '',
    sortBy: 'relevance',
  });

  const [isSearching, setIsSearching] = useState(false);

  // Handle form input changes
  const handleInputChange = (field: keyof SearchFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      query: '',
      category: '',
      brand: '',
      condition: '',
      minPrice: '',
      maxPrice: '',
      minYear: '',
      maxYear: '',
      vehicleMake: '',
      vehicleModel: '',
      sortBy: 'relevance',
    });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);

    // Build search URL with all parameters
    const params = new URLSearchParams();
    
    Object.entries(formData).forEach(([key, value]) => {
      if (value && value.trim()) {
        // Map form fields to URL parameters
        switch (key) {
          case 'query':
            params.set('q', value);
            break;
          case 'vehicleMake':
            params.set('make', value);
            break;
          case 'vehicleModel':
            params.set('model', value);
            break;
          default:
            params.set(key, value);
        }
      }
    });

    // Navigate to search results
    router.push(`/search?${params.toString()}`);
  };

  // Quick search presets
  const quickSearches = [
    { label: t('searchAdvanced.presets.brakeParts'), filters: { category: 'brake-parts', query: 'brake' } },
    { label: t('searchAdvanced.presets.engineOil'), filters: { query: 'engine oil', condition: 'NEW' } },
    { label: t('searchAdvanced.presets.toyotaParts'), filters: { vehicleMake: 'Toyota' } },
    { label: t('searchAdvanced.presets.underPrice', { currency: t('currency.aed'), price: 100 }) as string, filters: { maxPrice: '100' } },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

  return (
    <div className="space-y-8">
      {/* Advanced Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-wrench-accent" />
            <span>{t('searchAdvanced.title')}</span>
          </CardTitle>
          <CardDescription>
            {t('searchAdvanced.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Search */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Search className="h-5 w-5 mr-2 text-gray-600" />
                {t('searchAdvanced.basicSearch')}
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('searchAdvanced.searchKeywords')}
                  </label>
                  <Input
                    type="text"
                    placeholder={t('searchAdvanced.searchPlaceholder')}
                    value={formData.query}
                    onChange={(e) => handleInputChange('query', e.target.value)}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('searchAdvanced.category')}
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wrench-accent focus:border-wrench-accent"
                  >
                    <option value="">{t('searchAdvanced.allCategories')}</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Vehicle Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Car className="h-5 w-5 mr-2 text-gray-600" />
                {t('searchAdvanced.vehicleInfo')}
              </h3>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('searchAdvanced.vehicleMake')}
                  </label>
                  <select
                    value={formData.vehicleMake}
                    onChange={(e) => handleInputChange('vehicleMake', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wrench-accent focus:border-wrench-accent"
                  >
                    <option value="">{t('searchAdvanced.anyMake')}</option>
                    {carMakes.map(make => (
                      <option key={make} value={make}>{make}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('searchAdvanced.vehicleModel')}
                  </label>
                  <Input
                    type="text"
                    placeholder={t('searchAdvanced.vehicleModelPlaceholder')}
                    value={formData.vehicleModel}
                    onChange={(e) => handleInputChange('vehicleModel', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('searchAdvanced.yearFrom')}
                  </label>
                  <select
                    value={formData.minYear}
                    onChange={(e) => handleInputChange('minYear', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wrench-accent focus:border-wrench-accent"
                  >
                    <option value="">{t('searchAdvanced.anyYear')}</option>
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('searchAdvanced.yearTo')}
                  </label>
                  <select
                    value={formData.maxYear}
                    onChange={(e) => handleInputChange('maxYear', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wrench-accent focus:border-wrench-accent"
                  >
                    <option value="">{t('searchAdvanced.anyYear')}</option>
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Package className="h-5 w-5 mr-2 text-gray-600" />
                {t('searchAdvanced.productDetails')}
              </h3>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('searchAdvanced.brand')}
                  </label>
                  <select
                    value={formData.brand}
                    onChange={(e) => handleInputChange('brand', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wrench-accent focus:border-wrench-accent"
                  >
                    <option value="">{t('searchAdvanced.anyBrand')}</option>
                    {popularBrands.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('searchAdvanced.condition')}
                  </label>
                  <select
                    value={formData.condition}
                    onChange={(e) => handleInputChange('condition', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wrench-accent focus:border-wrench-accent"
                  >
                    <option value="">{t('searchAdvanced.anyCondition')}</option>
                    <option value="NEW">{t('productDetail.new')}</option>
                    <option value="USED">{t('productDetail.used')}</option>
                    <option value="REFURBISHED">{t('productDetail.refurbished')}</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('searchAdvanced.sortBy')}
                  </label>
                  <select
                    value={formData.sortBy}
                    onChange={(e) => handleInputChange('sortBy', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wrench-accent focus:border-wrench-accent"
                  >
                    <option value="relevance">{t('searchAdvanced.sort.relevance')}</option>
                    <option value="price_asc">{t('searchAdvanced.sort.priceAsc')}</option>
                    <option value="price_desc">{t('searchAdvanced.sort.priceDesc')}</option>
                    <option value="newest">{t('searchAdvanced.sort.newest')}</option>
                    <option value="rating">{t('searchAdvanced.sort.rating')}</option>
                    <option value="popularity">{t('searchAdvanced.sort.popularity')}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                {t('searchAdvanced.priceRange')}
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('searchAdvanced.minPrice', { currency: t('currency.aed') })}
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.minPrice}
                    onChange={(e) => handleInputChange('minPrice', e.target.value)}
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('searchAdvanced.maxPrice', { currency: t('currency.aed') })}
                  </label>
                  <Input
                    type="number"
                    placeholder="10000"
                    value={formData.maxPrice}
                    onChange={(e) => handleInputChange('maxPrice', e.target.value)}
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <Button
                type="submit"
                size="lg"
                disabled={isSearching}
                className="flex-1"
              >
                {isSearching ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    {t('searchAdvanced.searching')}
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5 mr-2" />
                    {t('searchAdvanced.searchProducts')}
                  </>
                )}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={resetForm}
              >
                <RotateCcw className="h-5 w-5 mr-2" />
                {t('searchAdvanced.resetFilters')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Quick Search Presets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-wrench-accent" />
            <span>{t('searchAdvanced.quickSearch')}</span>
          </CardTitle>
          <CardDescription>
            {t('searchAdvanced.quickSearchSubtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quickSearches.map((preset, index) => (
              <button
                key={index}
                onClick={() => {
                  // Apply preset filters
                  setFormData(prev => ({ ...prev, ...preset.filters }));
                }}
                className="p-4 border border-gray-200 rounded-lg hover:border-wrench-accent hover:bg-wrench-accent/5 transition-colors text-left"
              >
                <div className="font-medium text-gray-900 mb-1">{preset.label}</div>
                <div className="text-sm text-gray-600">
                  {Object.entries(preset.filters).map(([key, value]) => (
                    <span key={key} className="block">
                      {key}: {value}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-wrench-accent" />
              <span>{t('products.featuredProducts')}</span>
            </CardTitle>
            <CardDescription>
              {t('products.discoverOurTopRatedProductsWithTheBestReviews')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredProducts.slice(0, 8).map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="group"
                >
                  <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    <div className="aspect-square bg-gray-100 relative">
                      {product.images?.[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h4 className="font-medium text-sm text-gray-900 line-clamp-2 mb-1">
                        {product.title}
                      </h4>
                      <div className="text-lg font-bold text-wrench-accent">
                        {t('currency.aed')} {product.price.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdvancedSearchForm;