// app/(dashboards)/seller/appointments/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';
import { useAuthStore, useUser } from '@/lib/stores/auth';
import { apiClient } from '@/lib/api/client';
import { AppointmentFilters, AppointmentSearchResult, AppointmentStatus } from '@/types';
import { Calendar, Clock, Edit, MapPin, MessageCircle, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslations } from 'next-intl';
import { formatPrice } from '@/lib/utils';

export default function SellerAppointmentsPage() {
  const user = useUser();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = pathname?.split('/').filter(Boolean)[0] === 'ar' ? 'ar' : 'en';
  const t = useTranslations('sellerAppointments');

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
      toast.error(t('unauthorized'), {
        description: t('mustBeSellerToViewAppointments')
      });
      router.push(`/${currentLocale}`);
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
        toast.error(t('appointmentsLoadFailed'), {
          description: response.error?.message || t('couldNotFetchAppointments')
        });
      }
    } catch (err) {
      // Comprehensive error handling
      const errorMessage = err instanceof Error
        ? err.message
        : t('unexpectedErrorOccurred');

      toast.error(t('fetchFailed'), { description: errorMessage });
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
        toast.success(t('appointmentStatusUpdatedSuccessfully'));
        fetchAppointments(); // Refresh appointments

        // Reset modal state
        setSelectedAppointment(null);
        setSelectedStatus('');
        setUpdateNote('');
      } else {
        toast.error(t('failedToUpdateAppointmentStatus'));
      }
    } catch (err) {
      toast.error(t('failedToUpdateAppointmentStatus'));
    }
  };
  // Render methods
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wrench-accent mx-auto mb-4"></div>
        <p className="text-gray-600">{t('loadingAppointments')}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">{t('myAppointments')}</h1>

      {/* Filters */}
      <div className="mb-4 flex items-center space-x-4">
        <select
          value={statusFilter || ''}
          onChange={(e) => handleStatusFilterChange(e.target.value)}
          className="px-3 py-2 border rounded-lg"
        >
          <option value="">{t('allStatuses')}</option>
          {Object.values(AppointmentStatus).map(status => (
            <option key={status} value={status}>{t(`status.${status.toLowerCase()}`)}</option>
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
                    {appointment.service?.title || t('serviceTitleNotAvailable')}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t('appointmentNumber', { number: appointment.appointmentNumber })}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${appointment.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                  appointment.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                    appointment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                  }`}>
                  {t(`status.${appointment.status.toLowerCase()}`)}
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
                    title={t('updateAppointmentStatus')}
                    size="sm"
                    >
                      <Edit className="h-5 w-5 mr-2" /> {t('updateStatus')}
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
                      <p className="text-sm font-medium text-gray-700">{t('scheduledDate')}</p>
                      <p className="text-gray-900">
                        {new Date(appointment.scheduledTimeStart).toLocaleDateString(currentLocale === 'ar' ? 'ar-AE' : 'en-US', {
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
                      <p className="text-sm font-medium text-gray-700">{t('timeSlot')}</p>
                      <p className="text-gray-900">
                        {new Date(appointment.scheduledTimeStart).toLocaleTimeString(currentLocale === 'ar' ? 'ar-AE' : 'en-US')} -
                        {new Date(appointment.scheduledTimeEnd).toLocaleTimeString(currentLocale === 'ar' ? 'ar-AE' : 'en-US')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-wrench-accent" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">{t('location')}</p>
                      <p className="text-gray-900">
                        {appointment?.serviceLocation?.type === 'CUSTOMER_LOCATION'
                          ? t('customerLocation')
                          : t('shopLocation')}
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
                      <p className="text-sm font-medium text-gray-700">{t('customer')}</p>
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
                      <p className="text-sm font-medium text-gray-700">{t('totalAmount')}</p>
                      <p className="text-gray-900 font-bold">
                        {formatPrice(appointment.totalAmount, (appointment.service as any)?.currency || 'AED', currentLocale)}
                      </p>
                    </div>
                  </div>

                  {/* Additional Notes */}
                  {appointment.notes && (
                    <div className="flex items-center space-x-3">
                      <MessageCircle className="h-5 w-5 text-wrench-accent" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">{t('specialNotes')}</p>
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
              ? t('noAppointmentsFoundWithStatus', { status: t(`status.${statusFilter.toLowerCase()}`) })
              : t('noAppointmentsFound')
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
            <DialogTitle>{t('updateAppointmentStatus')}</DialogTitle>
            <DialogDescription>
              {t('changeAppointmentStatusDescription')}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Status Selection */}
            <div className="flex flex-col gap-2 items-start w-full justify-start">
              <label htmlFor="statusSelect" className="text-right">
                {t('statusLabel')}
              </label>
              <Select 
                value={selectedStatus} 
                onValueChange={(value) => setSelectedStatus(value as AppointmentStatus)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('selectNewStatus')} />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(AppointmentStatus)
                    .filter(status => status !== selectedAppointment?.status)
                    .map(status => (
                      <SelectItem key={status} value={status}>
                        {t(`status.${status.toLowerCase()}`)}
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>

            {/* Optional Note */}
            <div className="flex flex-col gap-2 items-start w-full justify-start">
              <label htmlFor="updateNote" className="text-right">
                {t('note')}
              </label>
              <textarea
                id="updateNote"
                value={updateNote}
                onChange={(e) => setUpdateNote(e.target.value)}
                placeholder={t('optionalNoteAboutStatusChange')}
                className=" border rounded-lg p-2 w-full"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                {t('cancel')}
              </Button>
            </DialogClose>
            <Button 
              type="submit" 
              onClick={handleStatusUpdate}
              disabled={!selectedStatus}
            >
              {t('updateStatus')}
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
            {t('previous')}
          </button>
          <span className="px-4 py-2">
            {t('pageOf', { current: appointmentsData.currentPage, total: appointmentsData.totalPages })}
          </span>
          <button
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={!appointmentsData.hasNextPage}
            className="px-4 py-2 border rounded-lg disabled:opacity-50"
          >
            {t('next')}
          </button>
        </div>
      )}
    </div>
  );
}