'use client';

import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SellerOrder } from '@/types';
import { Package, ShoppingBag, Clock, CheckCircle, RefreshCw } from 'lucide-react';
import { useState } from 'react';

interface SellerOrderStatsProps {
  orders: SellerOrder[];
  onRefresh?: () => void;
}

export function SellerOrderStats({ orders, onRefresh }: SellerOrderStatsProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      await onRefresh();
      setIsRefreshing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate stats from orders
  const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter(order => order.status.toUpperCase() === 'PENDING').length,
    shippedOrders: orders.filter(order => order.status.toUpperCase() === 'SHIPPED').length,
    completedOrders: orders.filter(order => order.status.toUpperCase() === 'DELIVERED').length,
    totalRevenue: orders.reduce((sum, order) => sum + order.totalAmount, 0),
    averageOrderValue: orders.length > 0 
      ? Math.round(orders.reduce((sum, order) => sum + order.totalAmount, 0) / orders.length)
      : 0
  };

  const statsData = [
    {
      title: 'Total Orders',
      value: stats.totalOrders.toString(),
      icon: ShoppingBag,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders.toString(),
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Shipped Orders',
      value: stats.shippedOrders.toString(),
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Completed Orders',
      value: stats.completedOrders.toString(),
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    }
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <Card key={index} className="border-l-4 border-l-wrench-orange-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Total Revenue
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(stats.totalRevenue)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  From {stats.totalOrders} orders
                </p>
              </div>
              <div className="text-right">
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
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Average Order Value
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(stats.averageOrderValue)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Per order
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}