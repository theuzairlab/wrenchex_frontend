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
import { useAuthModal } from '@/components/auth';
import { 
  ArrowLeft, Star, Clock, MapPin, 
  Calendar, CheckCircle, Shield, Wrench, User,
  Store, ChevronLeft, ChevronRight, Phone,
  Award, Zap, Heart, MessageCircle, 
  ArrowRight, Play, Pause, RotateCcw,
  Truck, CreditCard, Timer, Users
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { WishlistIcon } from '@/components/ui/WishlistIcon';
import { DirectionButton } from '@/components/location/DirectionButton';
import ReviewSummary from '@/components/reviews/ReviewSummary';
import ReviewsList from '@/components/reviews/ReviewsList';
import SmartReviewButton from '@/components/reviews/SmartReviewButton';
import ServiceBookingModal from '@/components/services/ServiceBookingModal';
import { useScrollSpy } from '@/hooks/useScrollSpy';

interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { openAuthModal } = useAuthModal();
  const serviceId = params.id as string;

  const [service, setService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  // Show booking modal
  const [showBookingModal, setShowBookingModal] = useState(false);
  
  // Review system state
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<number | null>(null);
  const [reviewsKey, setReviewsKey] = useState(0);

  // Scroll spy for section navigation
  const sectionIds = ['overview', 'process', 'reviews', 'provider'];
  const { activeSection, scrollToSection } = useScrollSpy({ sectionIds, offset: 120 });

  useEffect(() => {
    loadService();
  }, [serviceId]);


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

  // Image navigation functions
  const images = service?.images || [];
  const primaryImage = images[selectedImageIndex] || images[0] || '/placeholder-service.jpg';

  const goToPreviousImage = () => {
    setSelectedImageIndex((prev) => 
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const goToNextImage = () => {
    setSelectedImageIndex((prev) => 
      prev === images.length - 1 ? 0 : prev + 1
    );
  };


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold text-gray-800">Loading Service Details...</h2>
          <p className="text-gray-600 mt-2">Please wait while we fetch the information</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return null;
  }

  return (
    <div className="min-h-screen bg-wrench-bg-primary">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0"></div>
        <div className="absolute inset-0 "></div>
        
        <div className="relative pt-20 pb-16">
          <div className="container-responsive">
            <div className="flex items-center gap-4 mb-8">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="hover:bg-white/20"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Services
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
             

              {/* Service Image */}
              <div className="relative">
                <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl">
                  <Image
                    src={primaryImage}
                    alt={service?.title || 'Service'}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  
                  {/* Image Navigation */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={goToPreviousImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-sm transition-all"
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </button>
                      <button
                        onClick={goToNextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-sm transition-all"
                      >
                        <ChevronRight className="h-6 w-6" />
                      </button>
                    </>
                  )}

                  {/* Wishlist */}
                  <div className="absolute top-4 right-4">
                        <WishlistIcon
                          id={service?.id || ''}
                          type="service"
                          title={service?.title || ''}
                          price={service?.price || 0}
                          image={primaryImage}
                          category={service?.category?.name}
                          sellerName={service?.seller?.shopName || ''}
                          size="sm"
                        />
                  </div>

                  {/* Mobile Service Badge */}
                  {service?.isMobileService && (
                    <div className="absolute bottom-4 left-4">
                      <div className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Mobile Service
                      </div>
                    </div>
                  )}
                </div>

                {/* Image Thumbnails */}
                {images.length > 1 && (
                  <div className="flex gap-3 mt-4 justify-center">
                    {images.slice(0, 4).map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImageIndex === index
                            ? "border-wrench-accent scale-110"
                            : "border-white/30 hover:border-white/60"
                        }`}
                      >
                        <Image
                          src={image}
                          alt={`${service?.title || 'Service'} - Image ${index + 1}`}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}

              </div>

               {/* Service Info */}
               <div className="space-y-8">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Wrench className="h-6 w-6 " />
                    </div>
                    <span className=" font-medium">{service?.category?.name || ''}</span>
                  </div>
                  
                  <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                    {service?.title || ''}
                  </h1>
                </div>

                 {/* Service Stats */}
                 <div className="grid grid-cols-3 gap-6">
                   <div className="text-center">
                     <div className="text-3xl font-bold  mb-1">{formatPrice(service?.price || 0)}</div>
                     <div className=" text-sm">Starting Price</div>
                   </div>
                   <div className="text-center">
                     <div className="text-3xl font-bold  mb-1">{formatDuration(service?.durationMinutes || 0)}</div>
                     <div className=" text-sm">Duration</div>
                   </div>
                   <div className="text-center">
                     <div className="flex items-center justify-center gap-1 mb-1">
                       <Star className="h-8 w-8 text-wrench-accent fill-current" />
                       <span className="text-3xl font-bold ">{service?.ratingAverage || 'New'}</span>
                     </div>
                     <div className=" text-sm">Rating</div>
                   </div>
                 </div>

                 {/* Booking Section */}
                 <div className="mt-8">
                   <Card className="shadow-lg border-0 bg-white">
                     <CardHeader className="text-center pb-4">
                       <div className="text-4xl font-bold mb-2 text-black">{formatPrice(service?.price || 0)}</div>
                       <div className="text-gray-600">per service</div>
                     </CardHeader>
                     <CardContent className="space-y-4">
                       <Button
                         onClick={() => setShowBookingModal(true)}
                         className="w-full bg-wrench-accent hover:bg-wrench-accent/90 text-black font-semibold py-4 text-lg"
                         size="lg"
                       >
                         <Calendar className="h-5 w-5 mr-2" />
                         Book This Service
                       </Button>
                       
                       <div className="text-center text-gray-600 text-sm">
                         <div className="flex items-center justify-center gap-2 mb-2">
                           <CheckCircle className="h-4 w-4" />
                           <span>Instant Confirmation</span>
                         </div>
                         <div className="flex items-center justify-center gap-2">
                           <Shield className="h-4 w-4" />
                           <span>Secure Booking</span>
                         </div>
                       </div>
                     </CardContent>
                   </Card>
                 </div>

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Navigation */}
      <div className="sticky top-20 w-auto z-40 bg-wrench-bg-primary/60 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="container-responsive">
          <nav className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: Zap },
              { id: 'process', label: 'How It Works', icon: Play },
              { id: 'reviews', label: 'Reviews', icon: Star },
              { id: 'provider', label: 'Provider', icon: User },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => scrollToSection(tab.id)}
                className={`flex items-center gap-2 py-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  activeSection === tab.id
                    ? 'border-wrench-accent text-wrench-accent'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content Sections */}
      <div className="space-y-20 py-16">
        {/* Overview Section */}
        <section id="overview" className="scroll-mt-32">
          <div className="container-responsive">
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Service Overview</h2>
                  <div className="bg-white rounded-2xl p-8 shadow-lg">
                    <p className="text-gray-700 leading-relaxed text-lg mb-6">
                      {service?.description || ''}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <Clock className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">Duration</div>
                          <div className="text-gray-600">{formatDuration(service?.durationMinutes || 0)}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl">
                        <div className="p-3 bg-green-100 rounded-lg">
                          <Award className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">Quality</div>
                          <div className="text-gray-600">Professional Service</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl">
                        <div className="p-3 bg-purple-100 rounded-lg">
                          <Shield className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">Guarantee</div>
                          <div className="text-gray-600">100% Satisfaction</div>
                        </div>
                      </div>
                      
                      {service?.isMobileService && (
                        <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-xl">
                          <div className="p-3 bg-orange-100 rounded-lg">
                            <MapPin className="h-6 w-6 text-orange-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">Location</div>
                            <div className="text-gray-600">We Come to You</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section id="process" className="scroll-mt-32">
          <div className="container-responsive py-20 bg-white rounded-2xl shadow-lg">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Simple steps to get your service booked and completed
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center group">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-wrench-accent/20 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <Calendar className="h-10 w-10 " />
                  </div>
                 
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Book Your Service</h3>
                <p className="text-gray-600">
                  Select your preferred date and time slot. We'll confirm your booking instantly.
                </p>
              </div>

              <div className="text-center group">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-wrench-accent/20 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <User className="h-10 w-10 " />
                  </div>
                  
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Meet Your Expert</h3>
                <p className="text-gray-600">
                  Our professional technician arrives at your location or you visit our shop.
                </p>
              </div>

              <div className="text-center group">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-wrench-accent/20 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <CheckCircle className="h-10 w-10 " />
                  </div>
                  
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Service Complete</h3>
                <p className="text-gray-600">
                  Your service is completed with quality guarantee. Leave a review to help others.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section id="reviews" className="scroll-mt-32">
          <div className="container-responsive">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Customer Reviews</h2>
              <p className="text-xl text-gray-600">
                See what our customers say about this service
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Review Summary */}
              <div className="lg:col-span-1">
                <ReviewSummary
                  entityType="service"
                  entityId={service?.id || ''}
                  onRatingFilter={setSelectedRatingFilter}
                  selectedRating={selectedRatingFilter}
                />
                
                {/* Smart Review Button */}
                <Card className="mt-6 shadow-lg">
                  <CardContent className="p-6 text-center">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Share Your Experience
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Help others by reviewing this service
                    </p>
                    <SmartReviewButton
                      entityType="service"
                      entityId={service?.id || ''}
                      entityName={service?.title || ''}
                      entityImage={primaryImage}
                      onReviewSubmitted={() => setReviewsKey(prev => prev + 1)}
                      className="w-full bg-wrench-accent hover:bg-wrench-accent/90 text-black"
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Reviews List */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    All Reviews
                  </h3>
                  {selectedRatingFilter && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedRatingFilter(null)}
                    >
                      Clear Filter
                    </Button>
                  )}
                </div>
                
                <ReviewsList
                  key={reviewsKey}
                  entityType="service"
                  entityId={service?.id || ''}
                  ratingFilter={selectedRatingFilter || undefined}
                  sortBy="helpful"
                  limit={10}
                  showLoadMore={true}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Provider Section */}
        <section id="provider" className="scroll-mt-32 ">
          <div className="container-responsive py-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Service Provider</h2>
              <p className="text-xl text-gray-600">
                Meet the professional behind this service
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <Card className="shadow-xl border-0 p-0 overflow-hidden">
                <div className="bg-gradient-to-r from-wrench-accent to-wrench-accent/80 border-0 p-8 text-black">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="w-24 h-24 bg-white/30 rounded-full flex items-center justify-center text-3xl font-bold text-black">
                      {service?.seller?.shopName?.charAt(0).toUpperCase() || 'S'}
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <h3 className="text-2xl font-bold mb-2">{service?.seller?.shopName || ''}</h3>
                      <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                        <div className="flex items-center gap-1">
                          <Star className="h-5 w-5 text-white fill-current" />
                          <span className="font-semibold">{service?.seller?.ratingAverage || 'New'}</span>
                          <span className="text-black/70">({service?.seller?.ratingCount || 0} reviews)</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span className="text-black/70">
                            {service?.seller?.shopAddress || `${service?.seller?.area}, ${service?.seller?.city}`}
                          </span>
                        </div>
                      </div>
                      <p className="text-black/70">
                        Professional service provider with years of experience in {service?.category?.name || 'services'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-4">Contact Information</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Phone className="h-5 w-5 text-gray-400" />
                          <span className="text-gray-700">{service?.seller?.user?.phone || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <MapPin className="h-5 w-5 text-gray-400" />
                          <span className="text-gray-700">
                            {service?.seller?.shopAddress || `${service?.seller?.area}, ${service?.seller?.city}`}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-4">Quick Actions</h4>
                      <div className="space-y-3">
                        <Link href={`/shop/${service?.sellerId}`} className="block">
                          <Button variant="outline" className="w-full justify-start">
                            <Store className="h-4 w-4 mr-2" />
                            View Shop
                          </Button>
                        </Link>
                        {service?.seller?.latitude && service?.seller?.longitude && (
                          <DirectionButton
                            destination={{
                              latitude: service?.seller?.latitude || 0,
                              longitude: service?.seller?.longitude || 0,
                              name: service?.seller?.shopName || '',
                              address: service?.seller?.shopAddress || `${service?.seller?.area}, ${service?.seller?.city}`
                            }}
                            className="w-full justify-start"
                            variant="outline"
                            size="sm"
                            showText={true}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>

      {/* Booking Modal */}
      <ServiceBookingModal
        service={service}
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        onBookingSuccess={() => {
          // Refresh any data if needed
          setReviewsKey(prev => prev + 1);
        }}
      />
    </div>
  );
}