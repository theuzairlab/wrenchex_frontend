'use client';

import React, { useState, useEffect } from 'react';
import { useUserRole } from '@/lib/stores/auth';
import { useAuthStore } from '@/lib/stores/auth';
import { apiClient } from '@/lib/api/client';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { 
  Store, 
  Search, 
  Eye, 
  Edit, 
  Trash2,
  RefreshCw,
  MapPin,
  Clock,
} from 'lucide-react';

interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  durationMinutes: number;
  isMobileService: boolean;
  isActive: boolean;
  ratingAverage?: number;
  ratingCount: number;
  createdAt: string;
  updatedAt: string;
  seller: {
    id: string;
    shopName: string;
    city: string;
    area: string;
    ratingAverage?: number;
    ratingCount: number;
  };
  category: {
    id: string;
    name: string;
  };
  images?: string[];
}

export default function AdminServicesPage() {
  const role = useUserRole();
  const { isLoading, isAuthenticated } = useAuthStore();

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    if (isAuthenticated && role === 'ADMIN') {
      fetchServices();
    }
  }, [isAuthenticated, role, currentPage, search]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.getServices({
        search: search || undefined,
        page: currentPage,
        limit: 10
      });

      if (response.success && response.data) {
        setServices(response.data.services);
        setPagination({
          page: response.data.currentPage,
          limit: 10,
          total: response.data.totalCount,
          pages: response.data.totalPages
        });
      } else {
        setError(response.error?.message || 'Failed to fetch services');
      }
    } catch (err: any) {
      console.error('Error fetching services:', err);
      setError(err.message || 'Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchServices();
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-100 text-green-800">Active</Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wrench-accent"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Service Management</h1>
          <p className="text-gray-600">Monitor and manage all platform services</p>
        </div>
        <Button 
          onClick={fetchServices} 
          variant="outline" 
          leftIcon={<RefreshCw className="h-4 w-4" />}
          disabled={loading}
        >
          Refresh
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Services
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search by title, description..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit" variant="primary">
                Search
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Services List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Services ({services.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex flex-col items-center space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wrench-accent"></div>
                <p className="text-gray-600">Loading services...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchServices} variant="outline">
                Try Again
              </Button>
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-8">
              <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No services found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-gray-900">{service.title}</h3>
                        {getStatusBadge(service.isActive)}
                        {service.isMobileService && (
                          <Badge className="bg-blue-100 text-blue-800">Mobile Service</Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {service.description}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Store className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="font-medium text-gray-700">Provider</p>
                            <p className="text-gray-600">{service.seller.shopName}</p>
                            <p className="text-xs text-gray-500">
                              {service.seller.city}, {service.seller.area}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="font-medium text-gray-700">Category</p>
                            <p className="text-gray-600">{service.category.name}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="font-medium text-gray-700">Price</p>
                            <p className="text-gray-600">AED {formatCurrency(service.price)}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="font-medium text-gray-700">Duration</p>
                            <p className="text-gray-600">{formatDuration(service.durationMinutes)}</p>
                            <p className="text-xs text-gray-500">
                              ⭐ {service.ratingAverage?.toFixed(1) || '0'} ({service.ratingCount})
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 text-xs text-gray-500">
                        Created: {formatDate(service.createdAt)} | 
                        Updated: {formatDate(service.updatedAt)}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 min-w-fit">
                      <Button variant="outline" size="sm" leftIcon={<Eye className="h-4 w-4" />}>
                        View
                      </Button>
                      <Button variant="outline" size="sm" leftIcon={<Edit className="h-4 w-4" />}>
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        leftIcon={<Trash2 className="h-4 w-4" />}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
