'use client';

import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SellerEarnings } from '@/types';
import { DollarSign, TrendingUp, Package, Calendar, RefreshCw, Download } from 'lucide-react';
import { useState } from 'react';

interface EarningsOverviewProps {
  earnings: SellerEarnings | null;
  onRefresh?: () => void;
}

export function EarningsOverview({ earnings, onRefresh }: EarningsOverviewProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      await onRefresh();
      setIsRefreshing(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'PKR') => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (!earnings) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No earnings data available</p>
      </div>
    );
  }

  const statsData = [
    {
      title: 'Total Earnings',
      value: formatCurrency(earnings.totalEarnings, earnings.currency),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'All-time total revenue'
    },
    {
      title: 'Product Sales',
      value: formatCurrency(earnings.ordersEarnings, earnings.currency),
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Revenue from product orders'
    },
    {
      title: 'Service Bookings',
      value: formatCurrency(earnings.appointmentsEarnings, earnings.currency),
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Revenue from appointments'
    },
    {
      title: 'Growth Rate',
      value: '+12.5%',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'Monthly growth trend'
    }
  ];

  const conversionRate = earnings.totalEarnings > 0 
    ? ((earnings.ordersEarnings / earnings.totalEarnings) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Earnings Overview</h2>
          <p className="text-gray-600">Your financial performance summary</p>
        </div>
        <div className="flex gap-2">
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
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

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
                  <p className="text-2xl font-bold text-gray-900 mb-1">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500">
                    {stat.description}
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Revenue Breakdown */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Breakdown</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Product Sales</span>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    {formatCurrency(earnings.ordersEarnings, earnings.currency)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {conversionRate}% of total
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Service Bookings</span>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    {formatCurrency(earnings.appointmentsEarnings, earnings.currency)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(100 - parseFloat(conversionRate)).toFixed(1)}% of total
                  </p>
                </div>
              </div>
            </div>

            {/* Visual Bar */}
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-l-full"
                  style={{ width: `${conversionRate}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Insights */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-700 bg-green-50 p-3 rounded-lg">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">Strong revenue growth this month</span>
              </div>
              
              <div className="flex items-center gap-2 text-blue-700 bg-blue-50 p-3 rounded-lg">
                <Package className="h-4 w-4" />
                <span className="text-sm">Product sales performing well</span>
              </div>

              <div className="text-xs text-gray-600 mt-4">
                <p>💡 <strong>Tip:</strong> Consider adding more service offerings to diversify your revenue streams.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}