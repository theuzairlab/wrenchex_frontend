'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { apiClient } from '@/lib/api/client';
import { toast } from 'sonner';
import { 
  Wrench, Car, Settings, Zap, Gauge, Shield, 
  Grid3X3, List, Search, Filter 
} from 'lucide-react';

interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  _count: {
    services: number;
  };
}

interface ServiceCategoriesProps {
  selectedCategory?: string;
  onCategoryChange?: (categoryId: string) => void;
  layout?: 'grid' | 'list' | 'compact';
  showHeader?: boolean;
}

const categoryIcons = {
  'Engine Repair': Car,
  'Brake Service': Shield,
  'Oil Change': Settings,
  'Electrical': Zap,
  'Diagnostic': Gauge,
  'Maintenance': Wrench,
  'Inspection': Search,
  'Tune-up': Settings,
  'Transmission': Settings,
  'Suspension': Car,
  'Cooling System': Settings,
  'Exhaust': Settings,
  'default': Wrench
};

export default function ServiceCategories({
  selectedCategory,
  onCategoryChange,
  layout = 'grid',
  showHeader = true
}: ServiceCategoriesProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(layout === 'compact' ? 'list' : layout);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getServiceCategories();
      
      if (response.success && response.data) {
        setCategories(response.data);
      } else {
        toast.error('Failed to load service categories');
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
      toast.error('Failed to load service categories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    if (onCategoryChange) {
      onCategoryChange(categoryId);
    } else {
      router.push(`/services?category=${categoryId}`);
    }
  };

  const getIcon = (categoryName: string) => {
    const IconComponent = categoryIcons[categoryName as keyof typeof categoryIcons] || categoryIcons.default;
    return IconComponent;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {showHeader && (
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Service Categories</h2>
            <div className="animate-pulse h-8 w-16 bg-gray-200 rounded"></div>
          </div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-12 w-12 bg-gray-200 rounded-lg mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (layout === 'compact') {
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          variant={!selectedCategory ? 'primary' : 'outline'}
          size="sm"
          onClick={() => handleCategorySelect('')}
        >
          All Services
        </Button>
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? 'primary' : 'outline'}
            size="sm"
            onClick={() => handleCategorySelect(category.id)}
          >
            {category.name} ({category._count.services})
          </Button>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showHeader && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Service Categories</h2>
            <p className="text-gray-600 mt-1">Browse services by category</p>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* All Services Option */}
      <Card 
        className={`cursor-pointer transition-all ${
          !selectedCategory ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-lg'
        }`}
        onClick={() => handleCategorySelect('')}
      >
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${
              !selectedCategory ? 'bg-blue-100' : 'bg-gray-100'
            }`}>
              <Search className={`h-6 w-6 ${
                !selectedCategory ? 'text-blue-600' : 'text-gray-600'
              }`} />
            </div>
            <div>
              <h3 className="font-semibold text-lg">All Services</h3>
              <p className="text-gray-600">Browse all available automotive services</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <div className={
        viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
          : 'space-y-4'
      }>
        {categories.map((category) => {
          const IconComponent = getIcon(category.name);
          const isSelected = selectedCategory === category.id;
          
          if (viewMode === 'list') {
            return (
              <Card
                key={category.id}
                className={`cursor-pointer transition-all ${
                  isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-lg'
                }`}
                onClick={() => handleCategorySelect(category.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg flex-shrink-0 ${
                      isSelected ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <IconComponent className={`h-6 w-6 ${
                        isSelected ? 'text-blue-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{category.name}</h3>
                      {category.description && (
                        <p className="text-gray-600 text-sm line-clamp-1">{category.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {category._count.services}
                      </div>
                      <div className="text-xs text-gray-500">services</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          }

          return (
            <Card
              key={category.id}
              className={`cursor-pointer transition-all ${
                isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-lg'
              }`}
              onClick={() => handleCategorySelect(category.id)}
            >
              <CardContent className="p-6 text-center">
                <div className={`inline-flex p-4 rounded-xl mb-4 ${
                  isSelected ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <IconComponent className={`h-8 w-8 ${
                    isSelected ? 'text-blue-600' : 'text-gray-600'
                  }`} />
                </div>
                
                <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
                
                {category.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {category.description}
                  </p>
                )}
                
                <div className="text-blue-600 font-medium">
                  {category._count.services} service{category._count.services !== 1 ? 's' : ''}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {categories.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Filter className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No categories found</h3>
          <p className="text-gray-600">Service categories will appear here once they are created.</p>
        </div>
      )}
    </div>
  );
}
