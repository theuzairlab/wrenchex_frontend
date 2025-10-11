'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { apiClient } from '@/lib/api/client';
import { toast } from 'sonner';
import { 
  Calendar, Clock, MapPin, User, Phone, MessageCircle, 
  CheckCircle, XCircle, AlertCircle, Star,
  Navigation, Edit, MoreVertical
} from 'lucide-react';
import { Appointment } from '@/types';
import { format, formatDistanceToNow, isFuture, isPast } from 'date-fns';
import { useTranslations } from 'next-intl';
import { formatPrice } from '@/lib/utils';
import { usePathname } from 'next/navigation';

interface AppointmentCardProps {
  appointment: Appointment;
  userRole: 'buyer' | 'seller';
  onUpdate?: () => void;
  variant?: 'default' | 'compact';
}

export default function AppointmentCard({ 
  appointment, 
  userRole, 
  onUpdate,
  variant = 'default' 
}: AppointmentCardProps) {
  const t = useTranslations('appointmentCard');
  const tCurrency = useTranslations('common.currency');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const pathname = usePathname();
  const currentLocale = pathname?.split('/').filter(Boolean)[0] === 'ar' ? 'ar' : 'en';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-700 border-green-200';
      case 'PENDING': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'COMPLETED': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'CANCELLED': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return <CheckCircle className="h-4 w-4" />;
      case 'PENDING': return <AlertCircle className="h-4 w-4" />;
      case 'IN_PROGRESS': return <Clock className="h-4 w-4" />;
      case 'COMPLETED': return <CheckCircle className="h-4 w-4" />;
      case 'CANCELLED': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const appointmentDate = new Date(appointment.scheduledTimeStart);
  const isUpcoming = isFuture(appointmentDate);
  const isPastAppointment = isPast(appointmentDate);

  const canCancel = appointment.status === 'PENDING' || appointment.status === 'CONFIRMED';
  const canConfirm = appointment.status === 'PENDING' && userRole === 'seller';
  const canStartService = appointment.status === 'CONFIRMED' && userRole === 'seller' && isUpcoming;
  const canComplete = appointment.status === 'CONFIRMED' && userRole === 'seller';

  const handleStatusUpdate = async (newStatus: string, notes?: string) => {
    try {
      setIsUpdating(true);
      const response = await apiClient.put(`/appointments/${appointment.id}/status`, {
        status: newStatus,
        notes
      });

      if (response.success) {
        toast.success(`Appointment ${newStatus.toLowerCase()}`);
        onUpdate?.();
      } else {
        toast.error(response.error?.message || 'Failed to update appointment');
      }
    } catch (error) {
      console.error('Failed to update appointment:', error);
      toast.error('Failed to update appointment');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    const reason = prompt(t('prompt.cancelReasonOptional'));
    handleStatusUpdate('CANCELLED', reason || undefined);
  };

  if (variant === 'compact') {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">
                  {format(appointmentDate, 'dd')}
                </div>
                <div className="text-xs text-gray-500 uppercase">
                  {format(appointmentDate, 'MMM')}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900">{appointment.service?.title || t('serviceTitleNA')}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-3 w-3" />
                  <span>{format(appointmentDate, 'HH:mm')}</span>
                  {userRole === 'buyer' && (
                    <>
                      <span>•</span>
                      <span>{appointment.seller?.shopName || t('shopNameNA')}</span>
                    </>
                  )}
                  {userRole === 'seller' && (
                    <>
                      <span>•</span>
                      <span>{appointment.buyer?.firstName} {appointment.buyer?.lastName}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(appointment.status)}>
                {getStatusIcon(appointment.status)}
                <span className="ml-1">{appointment.status}</span>
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-1">
              {appointment.service?.title || t('serviceTitleNA')}
            </h3>
            <p className="text-gray-600 text-sm">
              {t('appointmentNumber', { num: appointment.appointmentNumber })}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(appointment.status)}>
              {getStatusIcon(appointment.status)}
              <span className="ml-1">{appointment.status}</span>
            </Badge>
            
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <div>
              <div className="font-medium">{format(appointmentDate, 'EEEE, MMMM do, yyyy')}</div>
              <div className="text-sm text-gray-600">
                {isUpcoming ? t('inDuration', { duration: formatDistanceToNow(appointmentDate) }) : 
                 isPastAppointment ? t('durationAgo', { duration: formatDistanceToNow(appointmentDate) }) : t('today')}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <div>
              <div className="font-medium">
                {format(appointmentDate, 'HH:mm')} - {format(new Date(appointment.scheduledTimeEnd), 'HH:mm')}
              </div>
              <div className="text-sm text-gray-600">{t('minutes', { count: appointment.service?.durationMinutes || 0 })}</div>
            </div>
          </div>
        </div>

        {/* Service Provider / Customer Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {userRole === 'buyer' ? (
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-medium">{appointment.seller?.shopName || t('shopNameNA')}</div>
                <div className="text-sm text-gray-600 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {t('locationNA')}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-medium">
                  {appointment.buyer?.firstName} {appointment.buyer?.lastName}
                </div>
                <div className="text-sm text-gray-600">{appointment.buyer?.email}</div>
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <div>
              <div className="font-medium">{formatPrice(appointment.totalAmount, (appointment.service as any)?.currency || 'AED', currentLocale)}</div>
              <div className="text-sm text-gray-600">{t('totalAmount')}</div>
            </div>
          </div>
        </div>

        {/* Location (for mobile services) */}
        {appointment.serviceLocation && (
          <div className="flex items-start gap-2 mb-4 p-3 bg-blue-50 rounded-lg">
            <Navigation className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <div className="font-medium text-blue-900">{t('mobileServiceLocation')}</div>
              <div className="text-sm text-blue-700">
                {typeof appointment.serviceLocation === 'object' && appointment.serviceLocation.address}
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        {appointment.notes && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="font-medium text-gray-900 mb-1">{t('notes')}</div>
            <div className="text-sm text-gray-700">{appointment.notes}</div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
          {canConfirm && (
            <Button
              size="sm"
              onClick={() => handleStatusUpdate('CONFIRMED')}
              disabled={isUpdating}
              leftIcon={<CheckCircle className="h-4 w-4" />}
            >
              {t('confirm')}
            </Button>
          )}
          
          {canStartService && (
            <Button
              size="sm"
              onClick={() => handleStatusUpdate('IN_PROGRESS')}
              disabled={isUpdating}
              leftIcon={<Clock className="h-4 w-4" />}
            >
              {t('startService')}
            </Button>
          )}
          
          {canComplete && (
            <Button
              size="sm"
              onClick={() => handleStatusUpdate('COMPLETED')}
              disabled={isUpdating}
              leftIcon={<CheckCircle className="h-4 w-4" />}
            >
              {t('markComplete')}
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            leftIcon={<MessageCircle className="h-4 w-4" />}
          >
            {t('message')}
          </Button>
          
          {userRole === 'buyer' && appointment.buyer?.phone && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Phone className="h-4 w-4" />}
              onClick={() => window.open(`tel:${appointment.buyer?.phone}`)}
            >
              {t('call')}
            </Button>
          )}
          
          {canCancel && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={isUpdating}
              leftIcon={<XCircle className="h-4 w-4" />}
              className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
            >
              {t('cancel')}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
