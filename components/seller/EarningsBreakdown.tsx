'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SellerEarnings } from '@/types';
import { BarChart3, Calendar, Package, DollarSign, TrendingUp } from 'lucide-react';

interface EarningsBreakdownProps {
  earnings: SellerEarnings | null;
  onRefresh?: () => void;
}

export function EarningsBreakdown({ earnings, onRefresh }: EarningsBreakdownProps) {
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
        <p className="text-gray-600">No earnings breakdown data available</p>
      </div>
    );
  }

  // Mock data for monthly earnings (in a real app, this would come from the API)
  const monthlyData = [
    { month: 'Jan', products: 15000, services: 8000 },
    { month: 'Feb', products: 18000, services: 12000 },
    { month: 'Mar', products: 22000, services: 15000 },
    { month: 'Apr', products: 25000, services: 18000 },
    { month: 'May', products: 28000, services: 20000 },
    { month: 'Jun', products: 32000, services: 22000 },
  ];

  const maxAmount = Math.max(...monthlyData.map(d => d.products + d.services));

  return (
    <div className="space-y-6">
      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Earnings Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Monthly Earnings Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyData.map((data, index) => {
                const totalAmount = data.products + data.services;
                const productPercent = (data.products / maxAmount) * 100;
                const servicePercent = (data.services / maxAmount) * 100;
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700">{data.month}</span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(totalAmount)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 relative">
                      <div 
                        className="bg-blue-500 h-3 rounded-l-full absolute"
                        style={{ width: `${productPercent}%` }}
                      ></div>
                      <div 
                        className="bg-purple-500 h-3 rounded-r-full absolute"
                        style={{ 
                          left: `${productPercent}%`, 
                          width: `${servicePercent}%` 
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Products: {formatCurrency(data.products)}</span>
                      <span>Services: {formatCurrency(data.services)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-6 flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Product Sales</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span>Service Bookings</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Sources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Revenue Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Product Sales */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-blue-500" />
                    <span className="font-medium text-gray-700">Product Sales</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(earnings.ordersEarnings, earnings.currency)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ 
                      width: `${(earnings.ordersEarnings / earnings.totalEarnings) * 100}%` 
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500">
                  {((earnings.ordersEarnings / earnings.totalEarnings) * 100).toFixed(1)}% of total earnings
                </p>
              </div>

              {/* Service Bookings */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-purple-500" />
                    <span className="font-medium text-gray-700">Service Bookings</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(earnings.appointmentsEarnings, earnings.currency)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full"
                    style={{ 
                      width: `${(earnings.appointmentsEarnings / earnings.totalEarnings) * 100}%` 
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500">
                  {((earnings.appointmentsEarnings / earnings.totalEarnings) * 100).toFixed(1)}% of total earnings
                </p>
              </div>

              {/* Total Earnings Summary */}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">Total Earnings</span>
                  <span className="text-xl font-bold text-green-600">
                    {formatCurrency(earnings.totalEarnings, earnings.currency)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  All-time cumulative revenue
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Financial Insights & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Performance Metrics */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Performance Metrics</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg. Monthly Growth:</span>
                  <span className="font-medium text-green-600">+12.5%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Best Month:</span>
                  <span className="font-medium">June 2024</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Revenue Mix:</span>
                  <span className="font-medium">60:40 Products:Services</span>
                </div>
              </div>
            </div>

            {/* Growth Opportunities */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Growth Opportunities</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Consider expanding service offerings</p>
                <p>• Peak sales in June - replicate strategies</p>
                <p>• Product sales show strong potential</p>
                <p>• Service bookings growing steadily</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Quick Actions</h4>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  View Detailed Reports
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  Export Financial Data
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  Schedule Payout
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}