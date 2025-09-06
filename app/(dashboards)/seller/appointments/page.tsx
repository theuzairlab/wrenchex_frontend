// app/(dashboards)/seller/appointments/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuthStore, useUser } from '@/lib/stores/auth';
import { apiClient } from '@/lib/api/client';
import { AppointmentFilters, AppointmentSearchResult, AppointmentStatus } from '@/types';
import { Calendar, Clock, Edit, MapPin, MessageCircle, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function SellerAppointmentsPage() {
  const user = useUser();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  // State management
  const [appointmentsData, setAppointmentsData] = useState<AppointmentSearchResult>({
    appointments: [],
    totalCount: 0,
    totalPages: 0,
    currentPage: 1,
    hasNextPage: false,
    hasPreviousPage: false
  });
  const [isLoading, setIsLoading] = useState(true);

  // State for status update modal
  const [selectedAppointment, setSelectedAppointment] = useState<{
    id: string;
    status: AppointmentStatus;
  } | null>(null);
  const [updateNote, setUpdateNote] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<AppointmentStatus | ''>('');

  // Pagination and filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Fetch appointments effect
  useEffect(() => {
    // Redirect if not authenticated or not a seller
    if (!isAuthenticated || user?.role !== 'SELLER') {
      toast.error('Unauthorized', {
        description: 'You must be a seller to view appointments'
      });
      router.push('/');
      return;
    }

    fetchAppointments();
  }, [isAuthenticated, user, currentPage, statusFilter]);

  // Fetch appointments function
  const fetchAppointments = async () => {
    try {
      setIsLoading(true);

      // Prepare filters
      const safeFilters: AppointmentFilters = {
        page: currentPage,
        limit: 10,
        // Only add status if a specific status is selected
        ...(statusFilter ? { status: statusFilter as AppointmentStatus } : {})
      };

      // Fetch appointments
      const response = await apiClient.getSellerAppointments(safeFilters);

      // Handle response
      if (response.success && response.data) {
        setAppointmentsData(response.data);
      } else {
        // Handle error scenario
        toast.error('Appointments Load Failed', {
          description: response.error?.message || 'Could not fetch appointments'
        });
      }
    } catch (err) {
      // Comprehensive error handling
      const errorMessage = err instanceof Error
        ? err.message
        : 'An unexpected error occurred';

      toast.error('Fetch Failed', { description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle status filter change
  const handleStatusFilterChange = (status: string) => {
    // Convert empty string to undefined, otherwise use the status
    setStatusFilter(status as AppointmentStatus | '');
    setCurrentPage(1); // Reset to first page when changing filter
  };

  // Handle status update
  const handleStatusUpdate = async () => {
    if (!selectedAppointment || !selectedStatus) return;

    try {
      const response = await apiClient.updateAppointmentStatus(selectedAppointment.id, selectedStatus as AppointmentStatus, updateNote.trim() || undefined);

      if (response.success && response.data) {
        toast.success('Appointment status updated successfully');
        fetchAppointments(); // Refresh appointments

        // Reset modal state
        setSelectedAppointment(null);
        setSelectedStatus('');
        setUpdateNote('');
      } else {
        toast.error('Failed to update appointment status');
      }
    } catch (err) {
      toast.error('Failed to update appointment status');
    }
  };
  // Render methods
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wrench-accent mx-auto mb-4"></div>
        <p className="text-gray-600">Loading appointments...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">My Appointments</h1>

      {/* Filters */}
      <div className="mb-4 flex items-center space-x-4">
        <select
          value={statusFilter || ''}
          onChange={(e) => handleStatusFilterChange(e.target.value)}
          className="px-3 py-2 border rounded-lg"
        >
          <option value="">All Statuses</option>
          {Object.values(AppointmentStatus).map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>

      {/* Appointments List */}
      {appointmentsData.appointments.length > 0 ? (
        <div className="space-y-4">
          {appointmentsData.appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="border rounded-lg p-6 bg-white shadow-md hover:shadow-lg transition-shadow"
            >
              {/* Appointment Header */}
              <div className="flex justify-between items-center mb-4 pb-4 border-b">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {appointment.service?.title || 'Service Title Not Available'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Appointment #{appointment.appointmentNumber}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${appointment.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                  appointment.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                    appointment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                  }`}>
                  {appointment.status}
                </span>

                  {/* Status Update Button */}
                  <Button
                    onClick={() => {
                      setSelectedAppointment({
                        id: appointment.id,
                        status: appointment.status as any
                      });
                      setSelectedStatus('');
                      setUpdateNote('');
                    }}
                    variant="primary"
                    className="text-gray-600 hover:text-gray-800 transition-colors"
                    title="Update Appointment Status"
                    size="sm"
                    >
                      <Edit className="h-5 w-5 mr-2" /> Update Status
                    </Button>
                </div>
              </div>

              {/* Appointment Details Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Left Column */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-wrench-accent" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Scheduled Date</p>
                      <p className="text-gray-900">
                        {new Date(appointment.scheduledTimeStart).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-wrench-accent" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Time Slot</p>
                      <p className="text-gray-900">
                        {new Date(appointment.scheduledTimeStart).toLocaleTimeString()} -
                        {new Date(appointment.scheduledTimeEnd).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-wrench-accent" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Location</p>
                      <p className="text-gray-900">
                        {appointment?.serviceLocation?.type === 'CUSTOMER_LOCATION'
                          ? 'Customer Location'
                          : 'Shop Location'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {appointment?.serviceLocation?.address}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-wrench-accent" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Customer</p>
                      <p className="text-gray-900">
                        {appointment.buyer?.firstName} {appointment.buyer?.lastName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {appointment.buyer?.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Total Amount</p>
                      <p className="text-gray-900 font-bold">
                        AED {appointment.totalAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Additional Notes */}
                  {appointment.notes && (
                    <div className="flex items-center space-x-3">
                      <MessageCircle className="h-5 w-5 text-wrench-accent" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Special Notes</p>
                        <p className="text-gray-600 italic">
                          "{appointment.notes}"
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-600">
          <p>
            {statusFilter
              ? `No ${statusFilter} appointments found`
              : 'No appointments found'
            }
          </p>
        </div>
      )}

      {/* Status Update Dialog */}
      <Dialog 
        open={!!selectedAppointment} 
        onOpenChange={() => {
          setSelectedAppointment(null);
          setSelectedStatus('');
          setUpdateNote('');
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Appointment Status</DialogTitle>
            <DialogDescription>
              Change the status of the appointment. You can add an optional note.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Status Selection */}
            <div className="flex flex-col gap-2 items-start w-full justify-start">
              <label htmlFor="statusSelect" className="text-right">
                Status
              </label>
              <Select 
                value={selectedStatus} 
                onValueChange={(value) => setSelectedStatus(value as AppointmentStatus)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(AppointmentStatus)
                    .filter(status => status !== selectedAppointment?.status)
                    .map(status => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>

            {/* Optional Note */}
            <div className="flex flex-col gap-2 items-start w-full justify-start">
              <label htmlFor="updateNote" className="text-right">
                Note
              </label>
              <textarea
                id="updateNote"
                value={updateNote}
                onChange={(e) => setUpdateNote(e.target.value)}
                placeholder="Optional note about status change"
                className=" border rounded-lg p-2 w-full"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button 
              type="submit" 
              onClick={handleStatusUpdate}
              disabled={!selectedStatus}
            >
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pagination */}
      {appointmentsData.totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={!appointmentsData.hasPreviousPage}
            className="px-4 py-2 border rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {appointmentsData.currentPage} of {appointmentsData.totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={!appointmentsData.hasNextPage}
            className="px-4 py-2 border rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}