'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SellerOrder } from '@/types';
import { ExternalLink, Package, RefreshCw } from 'lucide-react';

interface RecentOrdersProps {
  orders: SellerOrder[];
  onRefresh?: () => void;
}

export function RecentOrders({ orders, onRefresh }: RecentOrdersProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      await onRefresh();
      setIsRefreshing(false);
    }
  };

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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Recent Orders
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {orders && orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  {/* Order Items Preview */}
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

                  {/* Order Info */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-gray-900">
                        {order.buyer.firstName} {order.buyer.lastName}
                      </p>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{order.buyer.email}</p>
                    <p className="text-sm text-gray-500">
                      {formatDate(order.createdAt)} • {order.orderItems.length} items
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(order.totalAmount)}
                  </p>
                  <Link href={`/seller/orders/${order.id}`}>
                    <Button variant="outline" size="sm" className="mt-2 gap-2">
                      <ExternalLink className="h-3 w-3" />
                      View
                    </Button>
                  </Link>
                </div>
              </div>
            ))}

            {/* View All Orders Link */}
            <div className="pt-4 border-t">
              <Link href="/seller/orders">
                <Button variant="outline" className="w-full">
                  View All Orders
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No recent orders</p>
            <p className="text-sm text-gray-500">
              Your orders will appear here once customers start purchasing.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}