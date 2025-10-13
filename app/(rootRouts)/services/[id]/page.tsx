'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter, usePathname } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/lib/stores/auth';
import { Service } from '@/types';
import { toast } from 'sonner';
import { useAuthModal } from '@/components/auth';
import { formatPrice } from '@/lib/utils';
import { 
  ArrowLeft, Star, Clock, MapPin, 
  Calendar, CheckCircle, Shield, Wrench, User,
  ChevronLeft, ChevronRight,
  Zap, Play,
  Award,
  Phone,
  Store
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

export default function ServiceDetailPage() {
  const t = useTranslations('serviceDetail');
  const tCurrency = useTranslations('common.currency');
  const tReviews = useTranslations('common.reviews');
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { openAuthModal } = useAuthModal();
  const serviceId = params.id as string;
  
  const pathname = usePathname();
  const currentLocale = pathname?.split('/').filter(Boolean)[0] === 'ar' ? 'ar' : 'en';

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
  }, [serviceId, currentLocale]);


  const loadService = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getServiceById(serviceId, currentLocale);
      
      if (response.success && response.data) {
        setService(response.data);
      } else {
        toast.error(t('noResults'));
        router.push(`/${currentLocale}/services`);
      }
    } catch (error) {
      console.error('Failed to load service:', error);
      toast.error(t('unableToLoad'));
      router.push(`/${currentLocale}/services`);
    } finally {
      setIsLoading(false);
    }
  };


  // use shared formatter with locale and service currency

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
          <h2 className="text-xl font-semibold text-gray-800">{t('loading')}</h2>
          <p className="text-gray-600 mt-2">{t('pleaseTryLater')}</p>
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
        
        <div className="relative pt-16 sm:pt-20 pb-8 sm:pb-16">
          <div className="container-responsive px-4 sm:px-0">
            <div className="flex items-center gap-4 mb-6 sm:mb-8">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="hover:bg-white/20 text-sm sm:text-base"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                <span className="text-xs sm:text-base">{t('browseAllServices')}</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
             

              {/* Service Image */}
              <div className="relative">
                <div className="relative aspect-square rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl">
                  <Image
                    src={primaryImage}
                    alt={service?.title || t('service')}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  
                  {/* Image Navigation */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={goToPreviousImage}
                        className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 sm:p-3 rounded-full backdrop-blur-sm transition-all"
                      >
                        <ChevronLeft className="h-4 w-4 sm:h-6 sm:w-6" />
                      </button>
                      <button
                        onClick={goToNextImage}
                        className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 sm:p-3 rounded-full backdrop-blur-sm transition-all"
                      >
                        <ChevronRight className="h-4 w-4 sm:h-6 sm:w-6" />
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
                    <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4">
                      <div className="bg-green-500 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2">
                        <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="text-xs sm:text-sm">{t('mobileBadge')}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Image Thumbnails */}
                {images.length > 1 && (
                  <div className="flex gap-2 sm:gap-3 mt-3 sm:mt-4 justify-center">
                    {images.slice(0, 4).map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImageIndex === index
                            ? "border-wrench-accent scale-110"
                            : "border-white/30 hover:border-white/60"
                        }`}
                      >
                        <Image
                          src={image}
                          alt={`${service?.title || t('service')} - ${t('image')} ${index + 1}`}
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
               <div className="space-y-6 sm:space-y-8">
                <div>
                  <div className="flex items-center gap-3 mb-3 sm:mb-4">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Wrench className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <span className="text-sm sm:text-base font-medium">{service?.category?.name || ''}</span>
                  </div>
                  
                  <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
                    {service?.title || ''}
                  </h1>
                </div>

                 {/* Service Stats */}
                 <div className="grid grid-cols-3 gap-4 sm:gap-6">
                   <div className="text-center">
                     <div className="text-xl sm:text-3xl font-bold mb-1">{formatPrice(service?.price || 0, service?.currency || 'AED', currentLocale)}</div>
                    <div className="text-xs sm:text-sm">{t('startingPrice')}</div>
                   </div>
                   <div className="text-center">
                     <div className="text-xl sm:text-3xl font-bold mb-1">{formatDuration(service?.durationMinutes || 0)}</div>
                     <div className="text-xs sm:text-sm">{t('duration')}</div>
                   </div>
                   <div className="text-center">
                     <div className="flex items-center justify-center gap-1 mb-1">
                       <Star className="h-5 w-5 sm:h-8 sm:w-8 text-wrench-accent fill-current" />
                      <span className="text-xl sm:text-3xl font-bold">{service?.ratingAverage || t('new')}</span>
                     </div>
                     <div className="text-xs sm:text-sm">{t('rating')}</div>
                   </div>
                 </div>

                 {/* Booking Section */}
                 <div className="mt-6 sm:mt-8">
                   <Card className="shadow-lg border-0 bg-white">
                     <CardHeader className="text-center pb-3 sm:pb-4 p-4 sm:p-6">
                       <div className="text-2xl sm:text-4xl font-bold mb-2 text-black">{formatPrice(service?.price || 0, service?.currency || 'AED', currentLocale)}</div>
                     <div className="text-sm sm:text-base text-gray-600">{t('perService')}</div>
                     </CardHeader>
                     <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                       <Button
                         onClick={() => setShowBookingModal(true)}
                         className="w-full bg-wrench-accent hover:bg-wrench-accent/90 text-black font-semibold py-3 sm:py-4 text-base sm:text-lg"
                         size="lg"
                       >
                         <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                         <span className="text-sm sm:text-lg">{t('bookNow')}</span>
                       </Button>
                       
                       <div className="text-center text-gray-600 text-xs sm:text-sm">
                         <div className="flex items-center justify-center gap-2 mb-2">
                           <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="text-xs sm:text-sm">{t('instantConfirmation')}</span>
                         </div>
                         <div className="flex items-center justify-center gap-2">
                           <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="text-xs sm:text-sm">{t('secureBooking')}</span>
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
      <div className="sticky top-16 sm:top-20 w-auto z-40 bg-wrench-bg-primary/60 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="container-responsive px-4 sm:px-0">
          <nav className="flex gap-2 sm:gap-6 overflow-x-auto">
            {[
              { id: 'overview', label: t('overview'), icon: Zap },
              { id: 'process', label: t('howItWorks'), icon: Play },
              { id: 'reviews', label: tReviews('customerReviews'), icon: Star },
              { id: 'provider', label: t('provider'), icon: User },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => scrollToSection(tab.id)}
                className={`flex items-center gap-1 sm:gap-2 py-3 sm:py-4 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap px-2 sm:px-0 ${
                  activeSection === tab.id
                    ? 'border-wrench-accent text-wrench-accent'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content Sections */}
      <div className="space-y-12 sm:space-y-20 py-8 sm:py-16">
        {/* Overview Section */}
        <section id="overview" className="scroll-mt-24 sm:scroll-mt-32">
          <div className="container-responsive px-4 sm:px-0">
            <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">{t('serviceOverview')}</h2>
                  <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-8 shadow-lg">
                    <p className="text-gray-700 leading-relaxed text-base sm:text-lg mb-4 sm:mb-6">
                      {service?.description || ''}
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-blue-50 rounded-lg sm:rounded-xl">
                        <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                          <Clock className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-sm sm:text-base">{t('duration')}</div>
                          <div className="text-gray-600 text-xs sm:text-sm">{formatDuration(service?.durationMinutes || 0)}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-green-50 rounded-lg sm:rounded-xl">
                        <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
                          <Award className="h-4 w-4 sm:h-6 sm:w-6 text-green-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-sm sm:text-base">{t('quality')}</div>
                          <div className="text-gray-600 text-xs sm:text-sm">{t('professionalService')}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-purple-50 rounded-lg sm:rounded-xl">
                        <div className="p-2 sm:p-3 bg-purple-100 rounded-lg">
                          <Shield className="h-4 w-4 sm:h-6 sm:w-6 text-purple-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-sm sm:text-base">{t('guarantee')}</div>
                          <div className="text-gray-600 text-xs sm:text-sm">{t('satisfaction')}</div>
                        </div>
                      </div>
                      
                      {service?.isMobileService && (
                        <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-orange-50 rounded-lg sm:rounded-xl">
                          <div className="p-2 sm:p-3 bg-orange-100 rounded-lg">
                            <MapPin className="h-4 w-4 sm:h-6 sm:w-6 text-orange-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 text-sm sm:text-base">{t('location')}</div>
                            <div className="text-gray-600 text-xs sm:text-sm">{t('mobileBadge')}</div>
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
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('howItWorks')}</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                {t('howItWorksSub')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center group">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-wrench-accent/20 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <Calendar className="h-10 w-10 " />
                  </div>
                 
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('bookYourService')}</h3>
                <p className="text-gray-600">
                  {t('serveceCompleteSubtitle')}
                </p>
              </div>

              <div className="text-center group">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-wrench-accent/20 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <User className="h-10 w-10 " />
                  </div>
                  
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('provider')}</h3>
                <p className="text-gray-600">
                  {t('serviceProviderSubtitle')}
                </p>
              </div>

              <div className="text-center group">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-wrench-accent/20 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <CheckCircle className="h-10 w-10 " />
                  </div>
                  
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('serviceComplete')}</h3>
                <p className="text-gray-600">
                  {t('serviceCompleteSubtitle')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section id="reviews" className="scroll-mt-32">
          <div className="container-responsive">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{tReviews('customerReviews')}</h2>
              <p className="text-xl text-gray-600">
                {t('discoverOurTopRatedServicesWithTheBestReviews')}
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
                      {t('shareYourExperience')}
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                      {t('helpOthersByReviewingThisService')}
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
                    {tReviews('customerReviews')}
                  </h3>
                  {selectedRatingFilter && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedRatingFilter(null)}
                    >
                      {t('clearFilter')}
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
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('serviceProvider')}</h2>
              <p className="text-xl text-gray-600">
                {t('serviceProviderSubtitle')}
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
                          <span className="font-semibold">{service?.seller?.ratingAverage || t('new')}</span>
                          <span className="text-black/70">({service?.seller?.ratingCount || 0} {t('reviews')})</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span className="text-black/70">
                            {service?.seller?.shopAddress || `${service?.seller?.area}, ${service?.seller?.city}`}
                          </span>
                        </div>
                      </div>
                      <p className="text-black/70">
                        {t('providerSubtitle')} {service?.category?.name || t('services')}
                      </p>
                    </div>
                  </div>
                </div>
                
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className={currentLocale === 'ar' ? 'ltr' : 'rtl'}>
                      <h4 className={`font-semibold text-gray-900 mb-4 ${currentLocale === 'ar' ? 'text-right' : 'text-left'}`}>{t('contactInformation')}</h4>
                      <div className="space-y-3">
                        <div className={`flex items-center gap-3 ${currentLocale === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
                          <Phone className="h-5 w-5 text-gray-400" />
                          <span className="text-gray-700">{service?.seller?.user?.phone || 'N/A'}</span>
                        </div>
                        <div className={`flex items-center gap-3 ${currentLocale === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
                          <MapPin className="h-5 w-5 text-gray-400" />
                          <span className="text-gray-700">
                            {service?.seller?.shopAddress || `${service?.seller?.area}, ${service?.seller?.city}`}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className={currentLocale === 'ar' ? 'text-right' : 'text-left'}>
                      <h4 className={`font-semibold text-gray-900 mb-4 ${currentLocale === 'ar' ? 'text-right' : 'text-left'}`}>{t('quickActions')}</h4>
                      <div className="space-y-3">
                        <Link href={`/${currentLocale}/shop/${service?.sellerId}`} className="block">
                          <Button variant="outline" className={`w-full ${currentLocale === 'ar' ? 'justify-end' : 'justify-start'}`}>
                            <Store className={`h-4 w-4 ${currentLocale === 'ar' ? 'ml-2' : 'mr-2'}`} />
                            {t('viewShop')}
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
                            className={`w-full ${currentLocale === 'ar' ? 'justify-end' : 'justify-start'}`}
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