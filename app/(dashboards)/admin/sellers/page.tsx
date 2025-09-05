'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
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
  CheckCircle, 
  XCircle, 
  Eye, 
  MapPin, 
  Package, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

interface Seller {
  id: string;
  shopName: string;
  shopDescription?: string;
  shopAddress: string;
  city: string;
  area: string;
  isApproved: boolean;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  _count: {
    products: number;
    services: number;
    appointments: number;
  };
}

interface SellersResponse {
  sellers: Seller[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default function AdminSellersPage() {
  const role = useUserRole();
  const { isLoading, isAuthenticated } = useAuthStore();

  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [approvalFilter, setApprovalFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [updatingSeller, setUpdatingSeller] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && role === 'ADMIN') {
      fetchSellers();
    }
  }, [isAuthenticated, role, currentPage, search, approvalFilter]);

  const fetchSellers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.getAdminSellers({
        isApproved: approvalFilter === 'true' ? true : approvalFilter === 'false' ? false : undefined,
        search: search || undefined,
        page: currentPage,
        limit: 10
      });

      if (response.success && response.data) {
        setSellers(response.data.sellers);
        setPagination(response.data.pagination);
      } else {
        setError(response.error?.message || 'Failed to fetch sellers');
      }
    } catch (err: any) {
      console.error('Error fetching sellers:', err);
      setError(err.message || 'Failed to fetch sellers');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchSellers();
  };

  const handleApprovalFilterChange = (newFilter: string) => {
    setApprovalFilter(newFilter);
    setCurrentPage(1);
  };

  const handleSellerApproval = async (sellerId: string, isApproved: boolean) => {
    try {
      setUpdatingSeller(sellerId);
      
      const response = await apiClient.updateSellerApproval(sellerId, isApproved);
      
      if (response.success) {
        // Update the local state
        setSellers(prev => prev.map(seller => 
          seller.id === sellerId 
            ? { ...seller, isApproved } 
            : seller
        ));
      } else {
        setError(response.error?.message || 'Failed to update seller approval');
      }
    } catch (err: any) {
      console.error('Error updating seller approval:', err);
      setError(err.message || 'Failed to update seller approval');
    } finally {
      setUpdatingSeller(null);
    }
  };

  const getApprovalBadge = (isApproved: boolean) => {
    return isApproved ? (
      <Badge className="bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3 mr-1" />
        Approved
      </Badge>
    ) : (
      <Badge className="bg-yellow-100 text-yellow-800">
        <AlertCircle className="w-3 h-3 mr-1" />
        Pending Approval
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Show loading state while user data is being fetched
  if (isLoading || !isAuthenticated) {
    return (
      <DashboardLayout title="Loading..." description="Please wait...">
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wrench-accent"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

 

  return (
    
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Seller Management</h1>
            <p className="text-gray-600">Review and approve seller applications</p>
          </div>
          <Button 
            onClick={fetchSellers} 
            variant="outline" 
            leftIcon={<RefreshCw className="h-4 w-4" />}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Sellers
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="text"
                      placeholder="Search by shop name, city, or owner..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Approval Status
                  </label>
                  <select
                    value={approvalFilter}
                    onChange={(e) => handleApprovalFilterChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wrench-accent focus:border-transparent"
                  >
                    <option value="">All Sellers</option>
                    <option value="false">Pending Approval</option>
                    <option value="true">Approved</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <Button type="submit" variant="primary" className="w-full">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Sellers List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Sellers ({pagination.total})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex flex-col items-center space-y-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wrench-accent"></div>
                  <p className="text-gray-600">Loading sellers...</p>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={fetchSellers} variant="outline">
                  Try Again
                </Button>
              </div>
            ) : sellers.length === 0 ? (
              <div className="text-center py-8">
                <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No sellers found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sellers.map((seller) => (
                  <div
                    key={seller.id}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-gray-900">{seller.shopName}</h3>
                          {getApprovalBadge(seller.isApproved)}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <p className="font-medium text-gray-700">Owner</p>
                            <p>{seller.user.firstName} {seller.user.lastName}</p>
                            <p>{seller.user.email}</p>
                            {seller.user.phone && <p>{seller.user.phone}</p>}
                          </div>
                          
                          <div>
                            <p className="font-medium text-gray-700">Location</p>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <p>{seller.city}, {seller.area}</p>
                            </div>
                            <p className="text-xs">{seller.shopAddress}</p>
                          </div>
                        </div>

                        {seller.shopDescription && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-600">{seller.shopDescription}</p>
                          </div>
                        )}

                        <div className="flex items-center gap-4 mt-3 text-sm">
                          <div className="flex items-center gap-1">
                            <Package className="h-4 w-4 text-blue-600" />
                            <span>{seller._count.products} products</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Store className="h-4 w-4 text-green-600" />
                            <span>{seller._count.services} services</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-purple-600" />
                            <span>{seller._count.appointments} appointments</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-gray-600" />
                            <span>Joined {formatDate(seller.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 min-w-fit">
                        <Button variant="outline" size="sm" leftIcon={<Eye className="h-4 w-4" />}>
                          View Details
                        </Button>
                        
                        {!seller.isApproved ? (
                          <Button
                            variant="primary"
                            size="sm"
                            leftIcon={<CheckCircle className="h-4 w-4" />}
                            onClick={() => handleSellerApproval(seller.id, true)}
                            disabled={updatingSeller === seller.id}
                          >
                            {updatingSeller === seller.id ? 'Approving...' : 'Approve'}
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            leftIcon={<XCircle className="h-4 w-4" />}
                            onClick={() => handleSellerApproval(seller.id, false)}
                            disabled={updatingSeller === seller.id}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            {updatingSeller === seller.id ? 'Updating...' : 'Revoke Approval'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} sellers
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {pagination.pages}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === pagination.pages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
  );
}
