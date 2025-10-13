'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/lib/stores/auth';
import { Service, CreateAppointmentData } from '@/types';
import { toast } from 'sonner';
import { useAuthModal } from '@/components/auth';
import { 
  Calendar, 
  CheckCircle, 
  Shield, 
  X,
  Clock
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { formatPrice } from '@/lib/utils';
import { usePathname } from 'next/navigation';

interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface ServiceBookingModalProps {
  service: Service;
  isOpen: boolean;
  onClose: () => void;
  onBookingSuccess: () => void;
}

export default function ServiceBookingModal({ 
  service, 
  isOpen, 
  onClose, 
  onBookingSuccess 
}: ServiceBookingModalProps) {
  const { isAuthenticated } = useAuthStore();
  const { openAuthModal } = useAuthModal();
  const t = useTranslations('common.serviceBooking');
  
  // Booking form state
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [notes, setNotes] = useState('');
  const [serviceLocation, setServiceLocation] = useState('');
  const [isBooking, setIsBooking] = useState(false);

  const pathname = usePathname();
  const currentLocale = pathname?.split('/').filter(Boolean)[0] === 'ar' ? 'ar' : 'en';

  // Get minimum date (today)
  const today = new Date();
  const minDate = today.toISOString().split('T')[0];

  useEffect(() => {
    if (selectedDate) {
      loadAvailableSlots();
    }
  }, [selectedDate, service.id]);

  const loadAvailableSlots = async () => {
    try {
      setLoadingSlots(true);
      const response = await apiClient.get(`/appointments/service/${service.id}/slots?date=${selectedDate}`);
      
      if (response.success && response.data) {
        let slots: TimeSlot[] = response.data.slots || [];

        // If user selected today, hide past time slots (current local time)
        const todayStr = new Date().toISOString().split('T')[0];
        if (selectedDate === todayStr) {
          const now = new Date();
          const nowMinutes = now.getHours() * 60 + now.getMinutes();
          slots = slots.map((slot: TimeSlot) => {
            const [h, m] = slot.startTime.split(':').map(Number);
            const slotMinutes = h * 60 + m;
            // Mark as unavailable if slot is in the past
            return { ...slot, isAvailable: slot.isAvailable && slotMinutes > nowMinutes };
          });
        }

        setAvailableSlots(slots);
      }
    } catch (error) {
      console.error('Failed to load time slots:', error);
      toast.error(t('failedToLoadSlots'));
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBookAppointment = async () => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }

    if (!selectedDate || !selectedTimeSlot) {
      toast.error(t('pleaseSelectDateAndTime'));
      return;
    }

    try {
      setIsBooking(true);

      const appointmentDate = new Date(selectedDate);
      const [startHour, startMinute] = selectedTimeSlot.startTime.split(':').map(Number);
      const [endHour, endMinute] = selectedTimeSlot.endTime.split(':').map(Number);

      const scheduledTimeStart = new Date(appointmentDate);
      scheduledTimeStart.setHours(startHour, startMinute, 0, 0);

      const scheduledTimeEnd = new Date(appointmentDate);
      scheduledTimeEnd.setHours(endHour, endMinute, 0, 0);

      // Guard: if selected date is today, ensure slot is in the future
      const now = new Date();
      if (scheduledTimeStart <= now) {
        toast.error(t('pleaseSelectDateAndTime'));
        setIsBooking(false);
        return;
      }

      const appointmentData: CreateAppointmentData = {
        serviceId: service.id,
        scheduledDate: scheduledTimeStart.toISOString(),
        scheduledTimeStart: scheduledTimeStart.toISOString(),
        scheduledTimeEnd: scheduledTimeEnd.toISOString(),
        serviceLocation: service.isMobileService && serviceLocation && serviceLocation.trim().length >= 10 ? 
          { address: serviceLocation.trim(), type: 'CUSTOMER_LOCATION' as const } : undefined,
        notes: notes || undefined,
      };

      const response = await apiClient.createAppointment(appointmentData);

      if (response.success) {
        toast.success(t('appointmentBookedSuccessfully'));
        onBookingSuccess();
        onClose();
        // Reset form
        setSelectedDate('');
        setSelectedTimeSlot(null);
        setNotes('');
        setServiceLocation('');
        
        // Redirect to appointments page
        window.location.href = `/${currentLocale}/buyer/appointments`;
      } else {
        toast.error(response.error?.message || t('failedToBookAppointment'));
      }
    } catch (error: any) {
      console.error('Failed to book appointment:', error);
      const message = typeof error?.message === 'string' ? error.message : t('failedToBookAppointment');
      const friendly = message.includes('scheduledDate')
        ? t('pleaseSelectDateAndTime')
        : message;
      toast.error(friendly);
    } finally {
      setIsBooking(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-sm sm:max-w-md mx-auto overflow-y-auto max-h-[95vh] sm:max-h-[90vh]">
        <Card className="shadow-2xl border-0 bg-white overflow-y-auto">
          <CardHeader className="text-center pb-3 sm:pb-4 relative p-4 sm:p-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="absolute right-3 sm:right-4 top-3 sm:top-4 h-7 w-7 sm:h-8 sm:w-8 p-0"
            >
              <X className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            
            <div className="text-2xl sm:text-4xl font-bold mb-2 text-black">
              {formatPrice(service.price, service.currency || 'AED', currentLocale)}
            </div>
            <div className="text-sm sm:text-base text-black/70">{t('price')}</div>
          </CardHeader>
          
          <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
            {/* Date Selection */}
            <div>
              <label className="block text-black font-medium mb-2 text-sm sm:text-base">{t('selectDate')}</label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={minDate}
                className="bg-white border-gray-300 text-black placeholder-gray-500 text-sm sm:text-base"
              />
            </div>

            {/* Time Slots */}
            {selectedDate && (
              <div>
                <label className="block text-black font-medium mb-2 text-sm sm:text-base">{t('availableSlots')}</label>
                {loadingSlots ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-wrench-accent mx-auto"></div>
                  </div>
                ) : availableSlots.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {availableSlots.map((slot, index) => (
                      <Button
                        key={index}
                        variant={selectedTimeSlot === slot ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedTimeSlot(slot)}
                        disabled={!slot.isAvailable}
                        className={`text-xs sm:text-sm ${
                          selectedTimeSlot === slot
                            ? 'bg-wrench-accent text-black border-wrench-accent'
                            : 'bg-white border-gray-300 text-black hover:bg-gray-50'
                        }`}
                      >
                        {slot.startTime}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-xs sm:text-sm text-center py-4">
                    {t('noSlotsAvailable')}
                  </p>
                )}
              </div>
            )}

            {/* Mobile Service Location */}
            {service.isMobileService && (
              <div>
                <label className="block text-black font-medium mb-2 text-sm sm:text-base">{t('serviceLocation')}</label>
                <Textarea
                  placeholder={t('enterLocation')}
                  value={serviceLocation}
                  onChange={(e) => setServiceLocation(e.target.value)}
                  rows={3}
                  className="bg-white border-gray-300 text-black placeholder-gray-500 text-sm sm:text-base"
                />
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block text-black font-medium mb-2 text-sm sm:text-base">{t('notes')}</label>
              <Textarea
                placeholder={t('addNotes')}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="bg-white border-gray-300 text-black placeholder-gray-500 text-sm sm:text-base"
              />
            </div>

            {/* Booking Summary */}
            {selectedDate && selectedTimeSlot && (
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                <h4 className="font-semibold mb-2 text-black text-sm sm:text-base">{t('bookingConfirmation')}</h4>
                <div className="space-y-1 text-xs sm:text-sm text-gray-700">
                  <div className="flex justify-between">
                    <span>{t('serviceDetails')}:</span>
                    <span className="text-black font-medium break-words">{service.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('date')}:</span>
                    <span className="text-black font-medium">{new Date(selectedDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('time')}:</span>
                    <span className="text-black font-medium">{selectedTimeSlot.startTime} - {selectedTimeSlot.endTime}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-black pt-2 border-t border-gray-200">
                    <span>{t('totalAmount')}:</span>
                    <span>{formatPrice(service.price, service.currency || 'AED')}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button
                onClick={handleBookAppointment}
                disabled={!selectedDate || !selectedTimeSlot || isBooking}
                className="w-full bg-wrench-accent hover:bg-wrench-accent/90 text-black font-semibold py-2 sm:py-3 text-sm sm:text-base"
              >
                {isBooking ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-black"></div>
                    <span className="text-xs sm:text-sm">{t('booking')}</span>
                  </div>
                ) : (
                  <span className="text-sm sm:text-base">{t('bookNow')}</span>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={onClose}
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 text-sm sm:text-base"
              >
                <span className="text-sm sm:text-base">{t('close')}</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
