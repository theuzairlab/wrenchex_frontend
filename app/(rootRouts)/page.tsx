'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import TopCategories from '@/components/categories/TopCategories';
import FeaturedProducts from '@/components/products/FeaturedProducts';
import TopServices from '@/components/services/TopServices';
import WhyChooseUs from '@/components/landing/WhyChooseUs';
import MapsSection from '@/components/landing/MapsSection';
import { useAuthStore } from '@/lib/stores/auth';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/Card';
import { useAuthModal } from '@/components/auth';
import {
  Search, ShoppingCart, Wrench, 
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { AnimatedTestimonialsDemo } from '@/components/testimonials/Testimonial';

export default function Home() {
  const t = useTranslations('common');
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = pathname?.split('/').filter(Boolean)[0] === 'ar' ? 'ar' : 'en';
  const [searchQuery, setSearchQuery] = useState('');
  const { isAuthenticated } = useAuthStore();
  const { openAuthModal } = useAuthModal();
  
  // Location state for advanced search
  const [location, setLocation] = useState('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      let searchUrl = `/${currentLocale}/search?q=${encodeURIComponent(searchQuery.trim())}`;
      
      // Add location parameters if available
      if (coordinates) {
        searchUrl += `&latitude=${coordinates.lat}&longitude=${coordinates.lng}`;
        if (location) {
          searchUrl += `&location=${encodeURIComponent(location)}`;
        }
      }
      
      router.push(searchUrl);
    }
  };

  const handleQuickSearch = (term: string) => {
    let searchUrl = `/${currentLocale}/search?q=${encodeURIComponent(term)}`;
    
    // Add location parameters if available
    if (coordinates) {
      searchUrl += `&latitude=${coordinates.lat}&longitude=${coordinates.lng}`;
      if (location) {
        searchUrl += `&location=${encodeURIComponent(location)}`;
      }
    }
    
    router.push(searchUrl);
  };

  return (
    <div className="min-h-screen">
      {/* Enhanced Hero Section */}
      <div className="relative overflow-hidden min-h-[80vh] flex items-center">
        {/* Video Background */}
        <div className="absolute inset-0 w-full h-full">
          <video
            autoPlay
            loop
            playsInline
            muted
            className="w-full h-full object-cover"
            poster="/carservice.png"
          >
            <source src="/heroVid.mp4" type="video/mp4" />
            {t('videoNotSupported')}
          </video>
          
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/40"></div>
          
          {/* Gradient overlay for better visual effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-wrench-bg-primary/20 via-transparent to-wrench-accent/10"></div>
        </div>

        <div className="container mx-auto px-4 py-20 relative z-10 mt-10">
          <div className={`grid lg:grid-cols-2 gap-12 items-center ${currentLocale === 'ar' ? 'rtl' : 'ltr'}`}>
            {/* Left Content */}
            <div className={`space-y-8 ${currentLocale === 'ar' ? ' lg:text-right' : ' lg:text-left'}`}>
              <div className="space-y-6">
                <div className={`inline-flex px-4 py-2 bg-wrench-accent/20 backdrop-blur-sm rounded-full text-sm font-medium text-white border border-wrench-accent/30 ${currentLocale === 'ar' ? 'flex-row-reverse' : ''}`}>
                  <Wrench className={`h-4 w-4 ${currentLocale === 'ar' ? 'ml-2' : 'mr-2'}`} />
                  {t('heroBadge')}
                </div>

                <h1 className={`text-4xl lg:text-6xl font-bold leading-tight text-white ${currentLocale === 'ar' ? ' lg:text-right' : ' lg:text-left'}`}>
                  {t('heroTitleBefore')}{' '}
                  <span className="text-wrench-accent">{t('heroTitleHighlighted')}</span>{' '}
                  {t('heroTitleAfter')}
                </h1>

                <p className={`text-xl text-white/90 max-w-xl ${currentLocale === 'ar' ? ' lg:text-right' : 'lg:text-left'}`}>
                  {t('heroSubtitle')}
                </p>
              </div>

              {/* Enhanced CTAs */}
              <div className={`flex flex-col sm:flex-row gap-4 ${currentLocale === 'ar' ? 'lg:justify-start' : 'lg:justify-start'}`}>
                <Link href={`/${currentLocale}/products`}>
                  <Button variant="primary" size="lg" className={`group gap-2 ${currentLocale === 'ar' ? 'flex-row-reverse' : ''}`}>
                    <Search className={`h-5 w-5 ${currentLocale === 'ar' ? 'ml-2' : 'mr-2'}`} />
                    {t('browseProducts')}
                    {currentLocale === "ar" ? <ArrowLeft className={`h-4 w-4 ${currentLocale === 'ar' ? 'mr-2 group-hover:-translate-x-1' : 'ml-2 group-hover:translate-x-1'} transition-transform`} /> : <ArrowRight className={`h-4 w-4 ${currentLocale === 'en' ? 'mr-2 group-hover:translate-x-1' : 'ml-2 group-hover:translate-x-1'} transition-transform`} />}
                  </Button>
                </Link>
                <Link href={`/${currentLocale}/services`}>
                  <Button variant="link" size="lg" className={`group gap-2 text-white ${currentLocale === 'ar' ? 'flex-row-reverse' : ''}`}>
                    <Wrench className={`h-5 w-5 ${currentLocale === 'ar' ? 'ml-2' : 'mr-2'}`} />
                    {t('findServices')}
                    {currentLocale === "ar" ? <ArrowLeft className={`h-4 w-4 ${currentLocale === 'ar' ? 'mr-2 group-hover:-translate-x-1' : 'ml-2 group-hover:translate-x-1'} transition-transform`} /> : <ArrowRight className={`h-4 w-4 ${currentLocale === 'en' ? 'mr-2 group-hover:translate-x-1' : 'ml-2 group-hover:translate-x-1'} transition-transform`} />}
                  </Button>
                </Link>
              </div>


              {/* Trust Indicators */}
              {/* <div className={`flex flex-col sm:flex-row gap-8 ${currentLocale === 'ar' ? 'text-center lg:text-right' : 'text-center lg:text-left'}`}>
                <div>
                  <div className="text-2xl font-bold text-wrench-accent">10,000+</div>
                  <div className="text-sm text-white/80">{t('trust.verifiedSellers')}</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-wrench-accent">50,000+</div>
                  <div className="text-sm text-white/80">{t('trust.autoParts')}</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-wrench-accent">25,000+</div>
                  <div className="text-sm text-white/80">{t('trust.happyCustomers')}</div>
                </div>
              </div> */}
            </div>

             {/* Right Visual */}
             <div className="relative">
               <div className="relative z-10 bg-white/40 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
                 <div className="space-y-6">
                   <div className={`flex items-center ${currentLocale === 'ar' ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
                     <div className="w-12 h-12 bg-wrench-accent rounded-xl flex items-center justify-center">
                       <Search className="h-6 w-6 text-black" />
                     </div>
                     <div className={`${currentLocale === 'ar' ? 'text-center lg:text-right' : 'text-center lg:text-left'} p-2`}>
                       <h3 className="font-semibold text-gray-900">{t('quickSearch')}</h3>
                       <p className="text-sm text-gray-600">{t('quickSearchSubtitle')}</p>
                     </div>
                   </div>

                   <form onSubmit={handleSearch} className="space-y-3">
                     {/* Product Search */}
                     <div className="relative">
                       <input
                         type="text"
                         value={searchQuery}
                         onChange={(e) => setSearchQuery(e.target.value)}
                         placeholder={t('searchPlaceholder')}
                         className={`w-full px-2 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wrench-accent focus:border-wrench-accent bg-white/40 ${currentLocale === 'ar' ? 'text-right pr-4' : 'text-left pl-3'}`}
                         dir={currentLocale === 'ar' ? 'rtl' : 'ltr'}
                       />
                       <Button
                         type="submit"
                         className={`absolute ${currentLocale === 'ar' ? 'left-2' : 'right-2'} top-1/2 transform -translate-y-1/2`}
                         size="sm"
                       >
                         <Search className="h-4 w-4" />
                       </Button>
                     </div>

                     {/* Location Status */}
                     {coordinates && (
                       <div className={`text-xs text-green-600 bg-green-50/80 px-2 py-1 rounded ${currentLocale === 'ar' ? 'text-right' : 'text-left'}`}>
                         📍 {t('locationEnabled')}
                       </div>
                     )}

                     <div className={`flex flex-wrap gap-2 ${currentLocale === 'ar' ? 'justify-end' : 'justify-start'}`}>
                       {[
                         { key: 'brakePads', query: 'brake+pads' },
                         { key: 'oilFilters', query: 'oil+filter' },
                         { key: 'sparkPlugs', query: 'spark+plugs' },
                         { key: 'tires', query: 'tires' }
                      ].map(({ key, query }) => (
                         <button
                           key={key}
                           type="button"
                           onClick={() => handleQuickSearch(t(`quickTags.${key}`))}
                           className="px-3 py-1 bg-wrench-accent/20 hover:bg-wrench-accent/30 rounded-full text-xs text-gray-600 hover:text-gray-800 transition-colors cursor-pointer"
                         >
                          {t(`quickTags.${key}`)}
                         </button>
                       ))}
                     </div>
                   </form>
                 </div>
               </div>

              {/* Background decoration */}
              <div className="absolute -top-4 -right-4 w-72 h-72 bg-wrench-accent/20 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <WhyChooseUs />

      {/* Top Categories Section */}
      <TopCategories />

      {/* Featured Products Section */}
      <FeaturedProducts />

      {/* Top Services Section */}
      <TopServices />

      {/* Maps Section */}
      <MapsSection />

      {/* Testimonials Section */}
      <div className="py-20 bg-gray-50">
        <div className="container-responsive">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              {t('testimonials.heading', { count: 'Thousands' })}
            </h2>
            <p className="text-xl text-text-secondary">
              {t('testimonials.subheading')}
            </p>
          </div>

          <AnimatedTestimonialsDemo />

          <div className="text-center mt-12 px-4">
            <div className="flex flex-row w-full max-w-4xl mx-auto justify-center items-center space-x-2 sm:space-x-4 md:space-x-8 bg-white rounded-xl px-3 sm:px-6 py-3 sm:py-4 shadow-md">

              <div className="text-center flex-1">
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-wrench-accent">4.9/5</div>
                <div className="text-xs sm:text-sm text-text-secondary">{t('testimonials.averageRating')}</div>
              </div>

              <div className="w-px h-6 sm:h-8 bg-gray-200"></div>

              <div className="text-center flex-1">
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-wrench-accent">25,000+</div>
                <div className="text-xs sm:text-sm text-text-secondary">{t('testimonials.happyCustomers')}</div>
              </div>

              <div className="w-px h-6 sm:h-8 bg-gray-200"></div>

              <div className="text-center flex-1">
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-wrench-accent">98%</div>
                <div className="text-xs sm:text-sm text-text-secondary">{t('testimonials.satisfactionRate')}</div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Role Selection CTA */}
      {!isAuthenticated && (
      <div className="container-responsive py-16">
        <div className="text-center space-y-8">
          <h2 className="text-heading-2">{t('getStartedToday')}</h2>
          <p className="text-body text-text-secondary">
            {t('getStartedSubtitle')}
          </p>

          <div className="grid-responsive-2 max-w-4xl mx-auto">
            <Card variant="interactive" className="hover:border-wrench-accent">
              <CardContent className="text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto">
                  <ShoppingCart className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle>{t('buyerCardTitle')}</CardTitle>
                <CardDescription>
                  {t('buyerCardDesc')}
                </CardDescription>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => openAuthModal('buyer-register')}
                >
                  {t('buyerRegister')}
                </Button>
              </CardContent>
            </Card>

            <Card variant="interactive" className="hover:border-wrench-accent">
              <CardContent className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto">
                  <Wrench className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle>{t('sellerCardTitle')}</CardTitle>
                <CardDescription>
                  {t('sellerCardDesc')}
                </CardDescription>
                <Button 
                  variant="primary" 
                  className="w-full"
                  onClick={() => openAuthModal('seller-register')}
                >
                  {t('sellerRegister')}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="pt-8">
            <p className="text-body-sm text-text-muted">
              {t('alreadyHaveAccount')}{' '}
              <Button 
                variant="link" 
                className="p-0 h-auto"
                onClick={() => openAuthModal('login')}
              >
                {t('signInHere')}
              </Button>
            </p>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
