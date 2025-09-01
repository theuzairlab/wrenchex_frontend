'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SellerAppointment } from '@/types';
import { Calendar, Phone, RefreshCw, Clock, User } from 'lucide-react';

interface RecentAppointmentsProps {
  appointments: SellerAppointment[];
  onRefresh?: () => void;
}

export function RecentAppointments({ appointments, onRefresh }: RecentAppointmentsProps) {
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
      case 'IN_PROGRESS':
        return 'bg-purple-100 text-purple-800';
      case 'COMPLETED':
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

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Appointments
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
        {appointments && appointments.length > 0 ? (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  {/* Service Icon */}
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>

                  {/* Appointment Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-gray-900">
                        {appointment.service.title}
                      </p>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {appointment.buyer.firstName} {appointment.buyer.lastName}
                      </div>
                      {appointment.buyer.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {appointment.buyer.phone}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(appointment.scheduledAt)} at {formatTime(appointment.scheduledAt)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDuration(appointment.service.durationMinutes)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(appointment.totalAmount)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Service: {formatCurrency(appointment.service.price)}
                  </p>
                  <Link href={`/seller/appointments/${appointment.id}`}>
                    <Button variant="outline" size="sm" className="mt-2">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            ))}

            {/* View All Appointments Link */}
            <div className="pt-4 border-t">
              <Link href="/seller/appointments">
                <Button variant="outline" className="w-full">
                  View All Appointments
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No recent appointments</p>
            <p className="text-sm text-gray-500">
              Your scheduled services will appear here.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}