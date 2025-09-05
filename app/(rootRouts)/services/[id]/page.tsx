'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/lib/stores/auth';
import { Service, CreateAppointmentData } from '@/types';
import { toast } from 'sonner';
import { 
  ArrowLeft, Star, Clock, MapPin, 
  Calendar, CheckCircle, Shield, Wrench, User,
  Store
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { WishlistIcon } from '@/components/ui/WishlistIcon';

interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const serviceId = params.id as string;

  const [service, setService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  
  // Booking form state
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [notes, setNotes] = useState('');
  const [serviceLocation, setServiceLocation] = useState('');
  
  // Show booking form
  const [showBookingForm, setShowBookingForm] = useState(false);

  useEffect(() => {
    loadService();
  }, [serviceId]);

  useEffect(() => {
    if (selectedDate) {
      loadAvailableSlots();
    }
  }, [selectedDate, serviceId]);

  const loadService = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getServiceById(serviceId);
      
      if (response.success && response.data) {
        setService(response.data);
      } else {
        toast.error('Service not found');
        router.push('/services');
      }
    } catch (error) {
      console.error('Failed to load service:', error);
      toast.error('Failed to load service');
      router.push('/services');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAvailableSlots = async () => {
    try {
      setLoadingSlots(true);
      const response = await apiClient.get(`/appointments/service/${serviceId}/slots?date=${selectedDate}`);
      
      if (response.success && response.data) {
        setAvailableSlots(response.data.slots || []);
      }
    } catch (error) {
      console.error('Failed to load time slots:', error);
      toast.error('Failed to load available time slots');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBookAppointment = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to book appointments');
      router.push('/auth/login');
      return;
    }

    if (!selectedDate || !selectedTimeSlot) {
      toast.error('Please select date and time');
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

      const appointmentData: CreateAppointmentData = {
        serviceId,
        scheduledDate: appointmentDate.toISOString(),
        scheduledTimeStart: scheduledTimeStart.toISOString(),
        scheduledTimeEnd: scheduledTimeEnd.toISOString(),
        serviceLocation: service?.isMobileService && serviceLocation && serviceLocation.trim().length >= 10 ? 
          { address: serviceLocation.trim(), type: 'CUSTOMER_LOCATION' as const } : undefined,
        notes: notes || undefined,
      };

      const response = await apiClient.createAppointment(appointmentData);

      if (response.success) {
        toast.success('Appointment booked successfully!');
        router.push('/buyer/appointments');
      } else {
        toast.error(response.error?.message || 'Failed to book appointment');
      }
    } catch (error: any) {
      console.error('Failed to book appointment:', error);
      toast.error('Failed to book appointment');
    } finally {
      setIsBooking(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // Get minimum date (today)
  const today = new Date();
  const minDate = today.toISOString().split('T')[0];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-wrench-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading service details...</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return null;
  }

  return (
    <div className="min-h-screen bg-wrench-bg-primary pb-10">
      {/* Header */}
      <div className="pt-20">
        <div className="container-responsive py-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
            className=""
          >
            Back to Services
          </Button>
        </div>
      </div>

      <div className="container-responsive">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Service Details */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <Card className="mb-6">
              <CardContent className="p-0">
                <div className="aspect-video relative">
                  {service.images?.[0] ? (
                    <Image
                      src={service.images[0]}
                      alt={service.title}
                      fill
                      className="object-cover rounded-t-lg"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 rounded-t-lg flex items-center justify-center">
                      <Wrench className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Wishlist Icon */}
                  <WishlistIcon
                    id={service.id}
                    type="service"
                    title={service.title}
                    price={service.price}
                    image={service.images?.[0] || ''}
                    category={service.category?.name}
                    sellerName={service.seller.shopName}
                  />
                  
                  {service.isMobileService && (
                    <div className="absolute top-4 left-4">
                      <span className="bg-green-700 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Mobile Service Available
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Service Info */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">{service.title}</CardTitle>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-5 w-5 text-yellow-400 fill-current" />
                        <span className="font-medium">{service.ratingAverage || 'New'}</span>
                        <span className="text-gray-500">({service.ratingCount || 0} reviews)</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{formatDuration(service.durationMinutes)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600">{formatPrice(service.price)}</div>
                    <div className="text-sm text-gray-500">per service</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-gray-600">{service.description}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Service Category</h3>
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                      {service.category.name}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span>Professional Service</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-green-600" />
                      <span>Quality Guaranteed</span>
                    </div>
                    {service.isMobileService && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-green-600" />
                        <span>Mobile Service Available</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Seller Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Service Provider
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{service.seller.shopName}</h3>
                    <div className="flex items-center gap-1 text-gray-600 mt-1">
                      <MapPin className="h-4 w-4" />
                      <span>{service.seller.shopAddress}, {service.seller.city}, {service.seller.area}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="font-medium">{service.seller.ratingAverage || 'New'}</span>
                    <span className="text-gray-500">seller rating</span>
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <Link href={`/shop/${service.seller.id}`}>
                    <Button 
                      variant="outline" 
                      leftIcon={<Store className="h-4 w-4" />}
                      className="flex-1"
                    >
                      Seller's Shop
                    </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Panel */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Book This Service
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!showBookingForm ? (
                  <div className="space-y-4">
                    <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
                      
                      <h3 className="font-semibold text-lg mb-2">AED {formatPrice(service.price)}</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        Duration: {formatDuration(service.durationMinutes)}
                      </p>
                      <Button 
                        onClick={() => setShowBookingForm(true)}
                        className="w-full"
                        disabled={!isAuthenticated}
                      >
                        {isAuthenticated ? 'Select Date & Time' : 'Login to Book'}
                      </Button>
                      {!isAuthenticated && (
                        <p className="text-sm text-gray-500 mt-2">
                          <Link href="/auth/login" className="text-blue-600 hover:underline">
                            Login
                          </Link> or <Link href="/auth/register" className="text-blue-600 hover:underline">
                            register
                          </Link> to book this service
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Date Selection */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Select Date</label>
                      <Input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={minDate}
                      />
                    </div>

                    {/* Time Slots */}
                    {selectedDate && (
                      <div>
                        <label className="block text-sm font-medium mb-2">Available Time Slots</label>
                        {loadingSlots ? (
                          <div className="text-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
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
                                className="text-xs"
                              >
                                {slot.startTime}
                              </Button>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 text-center py-4">
                            No available slots for this date
                          </p>
                        )}
                      </div>
                    )}

                    {/* Mobile Service Location */}
                    {service.isMobileService && (
                      <div>
                        <label className="block text-sm font-medium mb-2">Service Location</label>
                        <Textarea
                          placeholder="Enter your address for mobile service"
                          value={serviceLocation}
                          onChange={(e) => setServiceLocation(e.target.value)}
                          rows={3}
                        />
                      </div>
                    )}

                    {/* Notes */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Additional Notes (Optional)</label>
                      <Textarea
                        placeholder="Any specific requirements or notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                      />
                    </div>

                    {/* Booking Summary */}
                    {selectedDate && selectedTimeSlot && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Booking Summary</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Service:</span>
                            <span>{service.title}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Date:</span>
                            <span>{new Date(selectedDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Time:</span>
                            <span>{selectedTimeSlot.startTime} - {selectedTimeSlot.endTime}</span>
                          </div>
                          <div className="flex justify-between font-semibold">
                            <span>Total:</span>
                            <span>{formatPrice(service.price)}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <Button
                        onClick={handleBookAppointment}
                        disabled={!selectedDate || !selectedTimeSlot || isBooking}
                        className="w-full"
                      >
                        {isBooking ? 'Booking...' : 'Confirm Booking'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowBookingForm(false)}
                        className="w-full"
                      >
                        Back
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
