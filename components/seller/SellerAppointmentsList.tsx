'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui_backup/Select';
import { AppointmentSearchResult, AppointmentStatus } from '@/types';
import { 
  Calendar, 
  Search, 
  User, 
  Clock,
  MapPin,
  Phone,
  Mail,
  Eye,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw
} from 'lucide-react';

interface SellerAppointmentsListProps {
  appointmentsData: AppointmentSearchResult | null;
  isLoading: boolean;
  currentPage: number;
  statusFilter: string;
  onPageChange: (page: number) => void;
  onStatusFilterChange: (status: string) => void;
  onStatusUpdate: (appointmentId: string, newStatus: string) => void;
  onCancelAppointment: (appointmentId: string, reason?: string) => void;
  onRefresh?: () => void;
}

export function SellerAppointmentsList({
  appointmentsData,
  isLoading,
  currentPage,
  statusFilter,
  onPageChange,
  onStatusFilterChange,
  onStatusUpdate,
  onCancelAppointment,
  onRefresh
}: SellerAppointmentsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      await onRefresh();
      setIsRefreshing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
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
      case 'NO_SHOW':
        return 'bg-gray-100 text-gray-800';
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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
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

  const handleStatusChange = (appointmentId: string, newStatus: string) => {
    if (confirm(`Are you sure you want to update this appointment status to ${newStatus}?`)) {
      onStatusUpdate(appointmentId, newStatus);
    }
  };

  const handleCancelAppointment = (appointmentId: string) => {
    const reason = prompt('Please provide a reason for cancellation (optional):');
    if (confirm('Are you sure you want to cancel this appointment?')) {
      onCancelAppointment(appointmentId, reason || undefined);
    }
  };

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'CONFIRMED', label: 'Confirmed' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' },
    { value: 'NO_SHOW', label: 'No Show' }
  ];

  const appointmentStatusOptions = [
    { value: 'PENDING', label: 'Pending' },
    { value: 'CONFIRMED', label: 'Confirmed' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'NO_SHOW', label: 'No Show' }
  ];

  // Filter appointments based on search query
  const appointments = appointmentsData?.appointments || [];
  const filteredAppointments = appointments.filter(appointment => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      appointment.buyer?.firstName?.toLowerCase().includes(query) ||
      appointment.buyer?.lastName?.toLowerCase().includes(query) ||
      appointment.buyer?.email?.toLowerCase().includes(query) ||
      appointment.service?.title?.toLowerCase().includes(query) ||
      appointment.appointmentNumber.toLowerCase().includes(query)
    );
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Appointments ({filteredAppointments.length})
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

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search appointments by customer, service, or appointment number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-wrench-orange-500"
            >
              <option value="">All Statuses</option>
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wrench-orange-500 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading appointments...</p>
          </div>
        ) : filteredAppointments.length > 0 ? (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  {/* Appointment Header */}
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">
                          #{appointment.appointmentNumber}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {appointment.buyer?.firstName} {appointment.buyer?.lastName}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDateTime(appointment.scheduledTimeStart)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Appointment Actions */}
                  <div className="flex items-center gap-2">
                    <div className="text-right mr-4">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(appointment.totalAmount)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDuration(appointment.service?.durationMinutes || 0)}
                      </p>
                    </div>
                    <Link href={`/seller/appointments/${appointment.id}`}>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Eye className="h-3 w-3" />
                        View
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Service and Customer Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Service Info */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">{appointment.service?.title || 'Service Title Not Available'}</h4>
                    <p className="text-sm text-gray-600">Service description not available</p>
                    {false && (
                      <div className="flex items-center gap-1 text-sm text-blue-600">
                        <MapPin className="h-3 w-3" />
                        Mobile Service
                      </div>
                    )}
                  </div>

                  {/* Customer Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Mail className="h-3 w-3" />
                      {appointment.buyer?.email || 'Email not available'}
                    </div>
                                          {appointment.buyer?.phone && (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Phone className="h-3 w-3" />
                        {appointment.buyer.phone}
                      </div>
                    )}
                    {appointment.notes && (
                      <div className="text-sm text-gray-600">
                        <strong>Notes:</strong> {appointment.notes}
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Management */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Scheduled: {formatDateTime(appointment.scheduledTimeStart)} - {formatDateTime(appointment.scheduledTimeEnd)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {appointment.status !== 'CANCELLED' && appointment.status !== 'COMPLETED' && (
                      <>
                        <select
                          value={appointment.status}
                          onChange={(e) => handleStatusChange(appointment.id, e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-wrench-orange-500"
                        >
                          {appointmentStatusOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelAppointment(appointment.id)}
                          className="gap-2 text-red-600 hover:text-red-700"
                        >
                          <XCircle className="h-3 w-3" />
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {appointmentsData && appointmentsData.totalPages > 1 && (
              <div className="flex items-center justify-between pt-6 border-t">
                <p className="text-sm text-gray-600">
                  Page {currentPage} of {appointmentsData.totalPages}
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
                    disabled={currentPage >= appointmentsData.totalPages}
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
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No appointments found</p>
            <p className="text-sm text-gray-500">
              {searchQuery || statusFilter 
                ? 'Try adjusting your filters' 
                : 'Your service appointments will appear here once customers start booking.'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}