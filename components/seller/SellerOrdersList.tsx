'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui_backup/Select';
import { SellerOrder } from '@/types';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Package, 
  User, 
  Calendar,
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SellerOrdersListProps {
  orders: SellerOrder[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  statusFilter: string;
  onPageChange: (page: number) => void;
  onStatusFilterChange: (status: string) => void;
  onStatusUpdate: (orderId: string, newStatus: string) => void;
  onRefresh?: () => void;
}

export function SellerOrdersList({
  orders,
  isLoading,
  currentPage,
  totalPages,
  statusFilter,
  onPageChange,
  onStatusFilterChange,
  onStatusUpdate,
  onRefresh
}: SellerOrdersListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleStatusChange = (orderId: string, newStatus: string) => {
    if (confirm(`Are you sure you want to update this order status to ${newStatus}?`)) {
      onStatusUpdate(orderId, newStatus);
    }
  };

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'CONFIRMED', label: 'Confirmed' },
    { value: 'SHIPPED', label: 'Shipped' },
    { value: 'DELIVERED', label: 'Delivered' },
    { value: 'CANCELLED', label: 'Cancelled' }
  ];

  const orderStatusOptions = [
    { value: 'PENDING', label: 'Pending' },
    { value: 'CONFIRMED', label: 'Confirmed' },
    { value: 'SHIPPED', label: 'Shipped' },
    { value: 'DELIVERED', label: 'Delivered' },
    { value: 'CANCELLED', label: 'Cancelled' }
  ];

  // Filter orders based on search query
  const filteredOrders = orders.filter(order => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      order.buyer.firstName.toLowerCase().includes(query) ||
      order.buyer.lastName.toLowerCase().includes(query) ||
      order.buyer.email.toLowerCase().includes(query) ||
      order.id.toLowerCase().includes(query)
    );
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Orders ({filteredOrders.length})
          </CardTitle>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search orders by customer name, email, or order ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select
              value={statusFilter}
              onValueChange={onStatusFilterChange}
              placeholder="Filter by status"
            >
              {statusOptions.map(option => (
                <Select.Option key={option.value} value={option.value}>
                  {option.label}
                </Select.Option>
              ))}
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wrench-orange-500 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading orders...</p>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  {/* Order Header */}
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">
                          Order #{order.id.slice(-8).toUpperCase()}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {order.buyer.firstName} {order.buyer.lastName}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(order.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Actions */}
                  <div className="flex items-center gap-2">
                    <div className="text-right mr-4">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(order.totalAmount)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.orderItems.length} items
                      </p>
                    </div>
                    <Link href={`/seller/orders/${order.id}`}>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Eye className="h-3 w-3" />
                        View
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Order Items Preview */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {order.orderItems.slice(0, 3).map((item, index) => (
                        <div
                          key={index}
                          className="w-10 h-10 bg-white border-2 border-white rounded-lg flex items-center justify-center"
                        >
                          {item.product.images && item.product.images.length > 0 ? (
                            <Image
                              src={item.product.images[0]}
                              alt={item.product.title}
                              width={32}
                              height={32}
                              className="rounded object-cover"
                            />
                          ) : (
                            <Package className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                      ))}
                      {order.orderItems.length > 3 && (
                        <div className="w-10 h-10 bg-gray-200 border-2 border-white rounded-lg flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-600">
                            +{order.orderItems.length - 3}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {order.orderItems.map(item => item.product.title).join(', ')}
                    </div>
                  </div>

                  {/* Status Update */}
                  <div className="flex items-center gap-2">
                    <Select
                      value={order.status}
                      onValueChange={(newStatus) => handleStatusChange(order.id, newStatus)}
                      placeholder="Update status"
                    >
                      {orderStatusOptions.map(option => (
                        <Select.Option key={option.value} value={option.value}>
                          {option.label}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-6 border-t">
                <p className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="gap-2"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No orders found</p>
            <p className="text-sm text-gray-500">
              {searchQuery || statusFilter ? 'Try adjusting your filters' : 'Your orders will appear here once customers start purchasing.'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}