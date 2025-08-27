'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Calendar,
  Clock,
  MapPin,
  Star,
  TrendingUp,
  Download,
  Upload,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { ServiceSearchResult, Service, Category } from '@/types';
import { apiClient } from '@/lib/api/client';

interface SellerServiceDashboardProps {
  services: ServiceSearchResult | null;
  categories: Category[];
  currentFilters: Record<string, string | undefined>;
}

interface ServiceStatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
}

const ServiceStatsCard = ({ title, value, change, changeType, icon }: ServiceStatsCardProps) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={cn(
              "text-sm flex items-center mt-1",
              changeType === 'positive' && "text-green-600",
              changeType === 'negative' && "text-red-600",
              changeType === 'neutral' && "text-gray-500"
            )}>
              <TrendingUp className="h-3 w-3 mr-1" />
              {change}
            </p>
          )}
        </div>
        <div className="p-3 bg-wrench-accent/10 rounded-lg">
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

interface ServiceTableRowProps {
  service: Service;
  onEdit: (service: Service) => void;
  onDelete: (service: Service) => void;
  onToggleStatus: (service: Service) => void;
}

const ServiceTableRow = ({ service, onEdit, onDelete, onToggleStatus }: ServiceTableRowProps) => {
  const primaryImage = service.images?.[0];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
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

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50">
      <td className="px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
            {primaryImage ? (
              <Image
                src={primaryImage}
                alt={service.title}
                width={48}
                height={48}
                className="object-cover"
              />
            ) : (
              <Calendar className="h-6 w-6 text-gray-400" />
            )}
          </div>
          <div>
            <p className="font-medium text-gray-900">{service.title}</p>
            <p className="text-sm text-gray-500">{service.category.name}</p>
          </div>
        </div>
      </td>

      <td className="px-6 py-4">
        <div className="text-sm">
          <p className="font-medium text-gray-900">{formatCurrency(service.price)}</p>
          <p className="text-gray-500">{formatDuration(service.durationMinutes)}</p>
        </div>
      </td>

      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          {service.isMobileService && (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
              <MapPin className="h-3 w-3" />
              Mobile
            </span>
          )}
          <span className={cn(
            "inline-flex items-center px-2 py-1 text-xs font-medium rounded-full",
            service.isActive 
              ? "bg-green-100 text-green-800" 
              : "bg-gray-100 text-gray-800"
          )}>
            {service.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </td>

      <td className="px-6 py-4">
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 text-yellow-400 fill-current" />
          <span className="text-sm font-medium text-gray-900">
            {service.ratingAverage?.toFixed(1) || 'N/A'}
          </span>
          <span className="text-sm text-gray-500">
            ({service.ratingCount})
          </span>
        </div>
      </td>

      <td className="px-6 py-4">
        <p className="text-sm text-gray-900">
          {new Date(service.createdAt).toLocaleDateString()}
        </p>
      </td>

             <td className="px-6 py-4">
         <DropdownMenu>
           <DropdownMenuTrigger asChild>
             <Button variant="ghost" size="sm">
               <MoreVertical className="h-4 w-4" />
             </Button>
           </DropdownMenuTrigger>
           <DropdownMenuContent align="end">
             <DropdownMenuItem onClick={() => window.open(`/services/${service.id}`, '_blank')}>
               <Eye className="h-4 w-4 mr-2" />
               View Service
             </DropdownMenuItem>
             <DropdownMenuItem onClick={() => onEdit(service)}>
               <Edit className="h-4 w-4 mr-2" />
               Edit Service
             </DropdownMenuItem>
             <DropdownMenuItem onClick={() => onToggleStatus(service)}>
               {service.isActive ? (
                 <>
                   <EyeOff className="h-4 w-4 mr-2" />
                   Deactivate
                 </>
               ) : (
                 <>
                   <Eye className="h-4 w-4 mr-2" />
                   Activate
                 </>
               )}
             </DropdownMenuItem>
             <DropdownMenuSeparator />
             <DropdownMenuItem 
               onClick={() => onDelete(service)}
               className="text-red-600 focus:text-red-600"
             >
               <Trash2 className="h-4 w-4 mr-2" />
               Delete Service
             </DropdownMenuItem>
           </DropdownMenuContent>
         </DropdownMenu>
       </td>
    </tr>
  );
};

const SellerServiceDashboard = ({ services, categories, currentFilters }: SellerServiceDashboardProps) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(currentFilters.search || '');
  const [selectedCategory, setSelectedCategory] = useState(currentFilters.category || '');
  const [selectedServiceType, setSelectedServiceType] = useState(currentFilters.isMobileService || '');

  // Calculate stats from services data
  // Handle both array and object with services property
  const servicesList = Array.isArray(services) ? services : (services?.services || []);
  const stats = {
    totalServices: servicesList.length,
    activeServices: servicesList.filter(s => s.isActive !== false).length, // Default to active if not specified
    mobileServices: servicesList.filter(s => s.isMobileService).length,
    averagePrice: servicesList.length > 0 
      ? Math.round(servicesList.reduce((sum, s) => sum + (s.price || 0), 0) / servicesList.length)
      : 0,
  };

  // Handle search and filters
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedServiceType) params.set('isMobileService', selectedServiceType);
    
    console.log('Searching with params:', params.toString());
    router.push(`/seller/services?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedServiceType('');
    router.push('/seller/services');
  };

  // Service actions
  const handleEditService = (service: Service) => {
    router.push(`/seller/services/update/${service.id}`);
  };

  const handleDeleteService = async (service: Service) => {
    if (confirm(`Are you sure you want to delete "${service.title}"? This action cannot be undone.`)) {
      try {
        const response = await apiClient.deleteService(service.id);
        if (response.success) {
          toast.success('Service deleted successfully');
          // Refresh the page to update the service list
          window.location.reload();
        } else {
          toast.error(response.error?.message || 'Failed to delete service');
        }
      } catch (error: any) {
        console.error('Delete service error:', error);
        toast.error('Failed to delete service');
      }
    }
  };

  const handleToggleStatus = async (service: Service) => {
    try {
      const response = await apiClient.updateService({
        id: service.id,
        title: service.title,
        description: service.description,
        categoryId: service.categoryId,
        price: service.price,
        durationMinutes: service.durationMinutes,
        isMobileService: service.isMobileService,
        images: service.images || [],
        isActive: !service.isActive
      });
      if (response.success) {
        toast.success('Service status updated successfully');
        // Refresh the page to update the service list
        window.location.reload();
      } else {
        toast.error(response.error?.message || 'Failed to update service status');
      }
    } catch (error: any) {
      console.error('Toggle status error:', error);
      toast.error('Failed to update service status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ServiceStatsCard
          title="Total Services"
          value={stats.totalServices}
          icon={<Calendar className="h-6 w-6 text-wrench-accent" />}
        />
        <ServiceStatsCard
          title="Active Services"
          value={stats.activeServices}
          change="+3 this month"
          changeType="positive"
          icon={<Eye className="h-6 w-6 text-green-600" />}
        />
        <ServiceStatsCard
          title="Mobile Services"
          value={stats.mobileServices}
          icon={<MapPin className="h-6 w-6 text-blue-600" />}
        />
        <ServiceStatsCard
          title="Average Price"
          value={`PKR ${stats.averagePrice.toLocaleString()}`}
          icon={<TrendingUp className="h-6 w-6 text-purple-600" />}
        />
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <Link href="/seller/services/add">
            <Button className="whitespace-nowrap">
              <Plus className="h-4 w-4 mr-2" />
              Add New Service
            </Button>
          </Link>
          
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Import Services
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Bulk Actions
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wrench-orange-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <select
              value={selectedServiceType}
              onChange={(e) => setSelectedServiceType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wrench-orange-500 focus:border-transparent"
            >
              <option value="">All Service Types</option>
              <option value="true">Mobile Services</option>
              <option value="false">In-Shop Services</option>
            </select>

            <div className="flex space-x-2">
              <Button onClick={handleSearch} className="flex-1">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              <Button variant="outline" onClick={clearFilters}>
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services Table */}
      <Card>
        <CardHeader>
          <CardTitle>Services ({servicesList.length})</CardTitle>
          <CardDescription>
            Manage your automotive services and track their performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          {services && servicesList.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price & Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {servicesList.map((service) => (
                    <ServiceTableRow
                      key={service.id}
                      service={service}
                      onEdit={handleEditService}
                      onDelete={handleDeleteService}
                      onToggleStatus={handleToggleStatus}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No services found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || selectedCategory || selectedServiceType
                  ? 'No services match your current filters. Try adjusting your search criteria.'
                  : 'Get started by adding your first automotive service offering.'}
              </p>
              <Link href="/seller/services/add">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Service
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SellerServiceDashboard;