'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import TopCategories from '@/components/categories/TopCategories';
import FeaturedProducts from '@/components/products/FeaturedProducts';
import TopServices from '@/components/services/TopServices';
import WhyChooseUs from '@/components/landing/WhyChooseUs';
import { useAuthStore } from '@/lib/stores/auth';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/Card';
import {
  Search, ShoppingCart, Wrench, Star,
  ArrowRight, Quote
} from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const { isAuthenticated } = useAuthStore();
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleQuickSearch = (term: string) => {
    router.push(`/search?q=${encodeURIComponent(term)}`);
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
            Your browser does not support the video tag.
          </video>
          
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/40"></div>
          
          {/* Gradient overlay for better visual effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-wrench-bg-primary/20 via-transparent to-wrench-accent/10"></div>
        </div>

        <div className="container mx-auto px-4 py-20 relative z-10 mt-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8 text-center lg:text-left">
              <div className="space-y-6">
                <div className="inline-flex items-center px-4 py-2 bg-wrench-accent/20 backdrop-blur-sm rounded-full text-sm font-medium text-white border border-wrench-accent/30">
                  <Wrench className="h-4 w-4 mr-2" />
                  #1 Auto Parts Marketplace
                </div>

                <h1 className="text-4xl lg:text-6xl font-bold leading-tight text-white">
                  Your Trusted{' '}
                  <span className="text-wrench-accent">Auto Parts</span>{' '}
                  & Services Marketplace
                </h1>

                <p className="text-xl text-white/90 max-w-xl">
                  Connect with verified sellers, find quality parts, and book professional services.
                  Everything your vehicle needs, all in one place.
                </p>
              </div>

              {/* Enhanced CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/products">
                  <Button variant="primary" size="lg" className="group">
                    <Search className="h-5 w-5 mr-2" />
                    Browse Products
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/services">
                  <Button variant="link" size="lg" className="group text-white">
                    <Wrench className="h-5 w-5 mr-2" />
                    Find Services
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>

              {/* Quick Action Links */}
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start mt-4">
                <Link href="/search?q=brake+pads" className="text-sm text-white/80 hover:text-wrench-accent transition-colors">
                  🔧 Brake Parts
                </Link>
                <Link href="/search?q=oil+filter" className="text-sm text-white/80 hover:text-wrench-accent transition-colors">
                  🛢️ Filters & Fluids
                </Link>
                <Link href="/search?q=spark+plugs" className="text-sm text-white/80 hover:text-wrench-accent transition-colors">
                  ⚡ Engine Parts
                </Link>
                <Link href="/search?q=tires" className="text-sm text-white/80 hover:text-wrench-accent transition-colors">
                  🚗 Tires & Wheels
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-col sm:flex-row gap-8 text-center lg:text-left">
                <div>
                  <div className="text-2xl font-bold text-wrench-accent">10,000+</div>
                  <div className="text-sm text-white/80">Verified Sellers</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-wrench-accent">50,000+</div>
                  <div className="text-sm text-white/80">Auto Parts</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-wrench-accent">25,000+</div>
                  <div className="text-sm text-white/80">Happy Customers</div>
                </div>
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative">
              <div className="relative z-10 bg-white/40 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-wrench-accent rounded-xl flex items-center justify-center">
                      <Search className="h-6 w-6 text-black" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Quick Search</h3>
                      <p className="text-sm text-gray-600">Find parts instantly</p>
                    </div>
                  </div>

                  <form onSubmit={handleSearch} className="space-y-3">
                    <div className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for brake pads, oil filters..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wrench-accent focus:border-wrench-accent bg-white/40"
                      />
                      <Button
                        type="submit"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2"
                        size="sm"
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {['Brake Pads', 'Oil Filters', 'Spark Plugs', 'Tires'].map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleQuickSearch(tag)}
                          className="px-3 py-1 bg-wrench-accent/20 hover:bg-wrench-accent/30 rounded-full text-xs text-gray-600 hover:text-gray-800 transition-colors cursor-pointer"
                        >
                          {tag}
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

      

      {/* Testimonials Section */}
      <div className="py-20 bg-gray-50">
        <div className="container-responsive">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Loved by <span className="text-wrench-accent">Thousands</span>
            </h2>
            <p className="text-xl text-text-secondary">
              See what our community of car owners, mechanics, and dealers have to say
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-wrench-accent rounded-full flex items-center justify-center text-black font-semibold mr-3">
                    AH
                  </div>
                  <div>
                    <h4 className="font-semibold">Ahmed Hassan</h4>
                    <p className="text-sm text-text-secondary">Auto Mechanic</p>
                    <p className="text-xs text-text-muted">Dubai, UAE</p>
                  </div>
                </div>

                <div className="flex items-center mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                <Quote className="h-6 w-6 text-gray-300 mb-2" />
                <p className="text-sm text-text-secondary mb-4 leading-relaxed">
                  WrenchEX has transformed my business. I can now reach more customers and offer my services to a wider audience. The platform is easy to use!
                </p>

                <div className="text-xs text-wrench-accent font-medium">
                  Brake Repair Service
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-wrench-accent rounded-full flex items-center justify-center text-black font-semibold mr-3">
                    SJ
                  </div>
                  <div>
                    <h4 className="font-semibold">Sarah Johnson</h4>
                    <p className="text-sm text-text-secondary">Car Owner</p>
                    <p className="text-xs text-text-muted">Abu Dhabi, UAE</p>
                  </div>
                </div>

                <div className="flex items-center mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                <Quote className="h-6 w-6 text-gray-300 mb-2" />
                <p className="text-sm text-text-secondary mb-4 leading-relaxed">
                  I found the exact brake pads for my 2019 Honda Civic at an amazing price. The delivery was fast and the quality is exactly as described. Highly recommended!
                </p>

                <div className="text-xs text-wrench-accent font-medium">
                  Brake Pads Purchase
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-wrench-accent rounded-full flex items-center justify-center text-black font-semibold mr-3">
                    MA
                  </div>
                  <div>
                    <h4 className="font-semibold">Mohammad Ali</h4>
                    <p className="text-sm text-text-secondary">Parts Dealer</p>
                    <p className="text-xs text-text-muted">Sharjah, UAE</p>
                  </div>
                </div>

                <div className="flex items-center mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                <Quote className="h-6 w-6 text-gray-300 mb-2" />
                <p className="text-sm text-text-secondary mb-4 leading-relaxed">
                  As a parts seller, WrenchEX has given me access to customers I never could have reached before. Sales have increased by 300%!
                </p>

                <div className="text-xs text-wrench-accent font-medium">
                  Auto Parts Sales
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-wrench-accent rounded-full flex items-center justify-center text-black font-semibold mr-3">
                    LC
                  </div>
                  <div>
                    <h4 className="font-semibold">Lisa Chen</h4>
                    <p className="text-sm text-text-secondary">Fleet Manager</p>
                    <p className="text-xs text-text-muted">Ajman, UAE</p>
                  </div>
                </div>

                <div className="flex items-center mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                <Quote className="h-6 w-6 text-gray-300 mb-2" />
                <p className="text-sm text-text-secondary mb-4 leading-relaxed">
                  Managing parts for our 50+ vehicle fleet is now so much easier. The bulk ordering system has saved us both time and money.
                </p>

                <div className="text-xs text-wrench-accent font-medium">
                  Fleet Management
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <div className="flex flex-col sm:flex-row w-1/2 mx-auto justify-center items-center sm:space-x-8 bg-white rounded-xl px-6 py-4 shadow-md space-y-4 sm:space-y-0">

              <div className="text-center">
                <div className="text-2xl font-bold text-wrench-accent">4.9/5</div>
                <div className="text-sm text-text-secondary">Average Rating</div>
              </div>

              <div className="hidden sm:block w-px h-8 bg-gray-200"></div>

              <div className="text-center">
                <div className="text-2xl font-bold text-wrench-accent">25,000+</div>
                <div className="text-sm text-text-secondary">Happy Customers</div>
              </div>

              <div className="hidden sm:block w-px h-8 bg-gray-200"></div>

              <div className="text-center">
                <div className="text-2xl font-bold text-wrench-accent">98%</div>
                <div className="text-sm text-text-secondary">Satisfaction Rate</div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Role Selection CTA */}
      {!isAuthenticated && (
      <div className="container-responsive py-16">
        <div className="text-center space-y-8">
          <h2 className="text-heading-2">Get Started Today</h2>
          <p className="text-body text-text-secondary">
            Join our marketplace as a buyer or seller
          </p>

          <div className="grid-responsive-2 max-w-4xl mx-auto">
            <Card variant="interactive" className="hover:border-wrench-accent">
              <CardContent className="text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto">
                  <ShoppingCart className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle>I want to buy auto parts & services</CardTitle>
                <CardDescription>
                  Browse products, book services, manage orders
                </CardDescription>
                <Link href="/auth/register/buyer">
                  <Button variant="outline" className="w-full">
                    Register as Buyer
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card variant="interactive" className="hover:border-wrench-accent">
              <CardContent className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto">
                  <Wrench className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle>I want to sell auto parts & services</CardTitle>
                <CardDescription>
                  List products, offer services, manage business
                </CardDescription>
                <Link href="/auth/register/seller">
                  <Button variant="primary" className="w-full">
                    Register as Seller
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="pt-8">
            <p className="text-body-sm text-text-muted">
              Already have an account?{' '}
              <Link href="/auth/login">
                <Button variant="link" className="p-0 h-auto">
                  Sign in here
                </Button>
              </Link>
            </p>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
