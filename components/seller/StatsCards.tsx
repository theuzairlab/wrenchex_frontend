'use client';

import { Card, CardContent } from '@/components/ui/Card';
import { SellerStats } from '@/types';
import { Package, ShoppingBag, Calendar, DollarSign } from 'lucide-react';

interface StatsCardsProps {
  stats: SellerStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const statsData = [
    {
      title: 'Monthly Earnings',
      value: formatCurrency(stats.monthlyEarnings),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: stats.monthlyEarnings > 0 ? '+' : ''
    },
    {
      title: 'Active Products',
      value: stats.totalProducts.toString(),
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: ''
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders.toString(),
      icon: ShoppingBag,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: ''
    },
    {
      title: 'Services & Appointments',
      value: `${stats.totalServices} / ${stats.totalAppointments}`,
      icon: Calendar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      change: ''
    }
  ];

  return (
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
                {stat.change && (
                  <p className={`text-sm ${stat.color}`}>
                    {stat.change} this month
                  </p>
                )}
              </div>
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}