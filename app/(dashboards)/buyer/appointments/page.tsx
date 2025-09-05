'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { apiClient } from '@/lib/api/client';
import { toast } from 'sonner';
import { Calendar, Plus } from 'lucide-react';
import Link from 'next/link';
import AppointmentCard from '@/components/appointments/AppointmentCard';

export default function BuyerAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    loadAppointments();
  }, [filter]);

  const loadAppointments = async () => {
    try {
      setIsLoading(true);
      
      const filters: any = {
        limit: 100 // Increase limit to get more appointments
      };
      
      if (filter === 'upcoming') {
        // Don't use status filter - let frontend filter upcoming appointments
        filters.startDate = new Date().toISOString();
      } else if (filter === 'past') {
        filters.endDate = new Date().toISOString();
      }
      
      console.log('Loading appointments with filters:', filters);
      const response = await apiClient.getAppointments(filters);
      console.log('Appointments response:', response);
      
      if (response.success && response.data) {
        // Handle both direct array and wrapped response formats
        const appointmentsData = Array.isArray(response.data) ? response.data : (response.data as any).appointments;
        console.log('Appointments data:', appointmentsData);
        setAppointments(appointmentsData || []);
      }
    } catch (error: any) {
      console.error('Failed to load appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-700';
      case 'PENDING': return 'bg-yellow-100 text-yellow-700';
      case 'CANCELLED': return 'bg-red-100 text-red-700';
      case 'COMPLETED': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredAppointments = appointments && Array.isArray(appointments) ? appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.scheduledDate);
    const now = new Date();
    
    if (filter === 'upcoming') {
      return appointmentDate >= now && ['CONFIRMED', 'PENDING'].includes(appointment.status);
    } else if (filter === 'past') {
      return appointmentDate < now || ['CANCELLED', 'COMPLETED'].includes(appointment.status);
    }
    return true;
  }) : [];

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="text-blue-600" />
              My Appointments
            </h1>
            <p className="text-gray-600">
              Manage your service appointments and bookings
            </p>
          </div>
          <Link href="/services">
            <Button leftIcon={<Plus className="h-4 w-4" />}>
              Book Service
            </Button>
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          {[
            { key: 'upcoming', label: 'Upcoming' },
            { key: 'past', label: 'Past' },
            { key: 'all', label: 'All' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === tab.key
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Appointments List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">Loading appointments...</div>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="mx-auto mb-4 text-gray-400" size={48} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No {filter === 'all' ? '' : filter} appointments
              </h3>
              <p className="text-gray-600 mb-4">
                {filter === 'upcoming' 
                  ? "You don't have any upcoming appointments."
                  : filter === 'past'
                  ? "You don't have any past appointments."
                  : "You haven't booked any services yet."
                }
              </p>
              <Link href="/services">
                <Button>Book Your First Service</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                userRole="buyer"
                onUpdate={loadAppointments}
              />
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
