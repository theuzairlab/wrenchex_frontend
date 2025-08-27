'use client';

import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Appointment, AppointmentStatus } from '@/types';
import { Calendar, CheckCircle, Clock, XCircle, RefreshCw, TrendingUp } from 'lucide-react';
import { useState } from 'react';

interface SellerAppointmentStatsProps {
  appointments: Appointment[];
  onRefresh?: () => void;
}

export function SellerAppointmentStats({ appointments, onRefresh }: SellerAppointmentStatsProps) {
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

  // Calculate stats from appointments
  const stats = {
    totalAppointments: appointments.length,
    pendingAppointments: appointments.filter(apt => apt.status === 'PENDING').length,
    confirmedAppointments: appointments.filter(apt => apt.status === 'CONFIRMED').length,
    completedAppointments: appointments.filter(apt => apt.status === 'COMPLETED').length,
    cancelledAppointments: appointments.filter(apt => apt.status === 'CANCELLED').length,
    totalRevenue: appointments
      .filter(apt => apt.status === 'COMPLETED')
      .reduce((sum, apt) => sum + apt.totalAmount, 0),
    averageBookingValue: appointments.length > 0 
      ? Math.round(appointments.reduce((sum, apt) => sum + apt.totalAmount, 0) / appointments.length)
      : 0
  };

  const completionRate = stats.totalAppointments > 0 
    ? ((stats.completedAppointments / stats.totalAppointments) * 100).toFixed(1)
    : '0.0';

  const statsData = [
    {
      title: 'Total Appointments',
      value: stats.totalAppointments.toString(),
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'All time bookings'
    },
    {
      title: 'Pending Approval',
      value: stats.pendingAppointments.toString(),
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      description: 'Awaiting confirmation'
    },
    {
      title: 'Confirmed Today',
      value: stats.confirmedAppointments.toString(),
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Ready to serve'
    },
    {
      title: 'Completed',
      value: stats.completedAppointments.toString(),
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: `${completionRate}% completion rate`
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Appointment Overview</h2>
          <p className="text-gray-600">Your booking performance summary</p>
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

      {/* Revenue and Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Revenue Card */}
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
                  From completed appointments
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Average Booking Value */}
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Average Booking Value
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(stats.averageBookingValue)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Per appointment
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Completion Rate */}
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Completion Rate
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {completionRate}%
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Success rate
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Insights */}
      {stats.totalAppointments > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-blue-700 bg-blue-50 p-3 rounded-lg">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">
                    {stats.pendingAppointments > 0 
                      ? `${stats.pendingAppointments} appointments awaiting your confirmation`
                      : 'All appointments are up to date!'}
                  </span>
                </div>
                
                {stats.completedAppointments > 0 && (
                  <div className="flex items-center gap-2 text-green-700 bg-green-50 p-3 rounded-lg">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">
                      Great job! {stats.completedAppointments} successful services completed
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {stats.cancelledAppointments > 0 && (
                  <div className="flex items-center gap-2 text-red-700 bg-red-50 p-3 rounded-lg">
                    <XCircle className="h-4 w-4" />
                    <span className="text-sm">
                      {stats.cancelledAppointments} appointments were cancelled
                    </span>
                  </div>
                )}

                <div className="text-xs text-gray-600">
                  <p>💡 <strong>Tip:</strong> Respond quickly to pending appointments to improve customer satisfaction.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}