import { ArrowRight, BarChart3, Calendar, Plus, MessageCircle, Star, Package } from "lucide-react";
import { Button } from "../ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { useState } from "react";
import Link from "next/link";



// Seller Dashboard Content  
export function ShopDashboard({ User, Loading, dashboardData, error, formatDateTime, formatCurrency }: { User: any, Loading: any, dashboardData: any, error: any, formatDateTime: any, formatCurrency: any }) {
    const user = User();
    
  
    
  
    if (Loading) {
      return (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wrench-accent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Shop Dashboard...</p>
        </div>
      );
    }
  
    if (error) {
      return (
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-lg font-medium">Error loading dashboard</p>
            <p className="text-sm text-gray-600">{error}</p>
          </div>
        </div>
      );
    }
  
    if (!dashboardData) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-600">No dashboard data available</p>
        </div>
      );
    }
  
    return (
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {dashboardData.seller.shopName}! 🚀
          </h2>
          <p className="text-gray-600 mb-4">
            Manage your business, track performance, and grow your sales on WrenchEX.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/seller/products/add">
              <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />}>
                Add Product
              </Button>
            </Link>

          </div>
        </div>
  
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Products</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardData.stats.products || 0}
                  </p>
                  <p className="text-sm text-green-600">
                    {dashboardData.stats.products > 0 
                      ? 'Products available for sale' 
                      : 'No active products'}
                  </p>
                </div>
                <Package className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
  
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Chats</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardData.stats.chats || 0}
                  </p>
                  <p className="text-sm text-blue-600">
                    {dashboardData.stats.unreadMessages || 0} unread messages
                  </p>
                </div>
                <MessageCircle className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
  
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Appointments</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardData.stats.appointments || 0}
                  </p>
                  <p className="text-sm text-purple-600">
                    Upcoming bookings
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
  
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Shop Rating</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardData.seller.ratingAverage?.toFixed(1) || 'N/A'}
                  </p>
                  <p className="text-sm text-yellow-600">
                    {dashboardData.seller.ratingCount} reviews
                  </p>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>
  
        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Chats */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Chats</CardTitle>
                <Link href="/seller/chats">
                  <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {dashboardData.recentChats && dashboardData.recentChats.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.recentChats.map((chat: any) => (
                    <div 
                      key={chat.id} 
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {chat.product?.title || 'Product Chat'}
                        </p>
                        <p className="text-sm text-gray-500">
                          with {chat.buyer?.firstName} {chat.buyer?.lastName}
                        </p>
                        {chat.lastMessage && (
                          <p className="text-xs text-gray-400 mt-1 truncate">
                            {chat.lastMessage}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        {chat.unreadCount > 0 && (
                          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                            {chat.unreadCount}
                          </span>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDateTime ? formatDateTime(chat.updatedAt) : 'Recent'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No recent chats</p>
                  <Link href="/seller/products/add">
                    <Button variant="outline" size="sm" className="mt-3">
                      Add Products
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
  
          {/* Recent Appointments */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Appointments</CardTitle>
                <Link href="/seller/appointments">
                  <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {dashboardData.recentAppointments.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.recentAppointments.map((appointment: any) => (
                    <div 
                      key={appointment.id} 
                      className="flex items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-shrink-0">
                        <Calendar className="h-10 w-10 text-blue-600" />
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="font-medium text-gray-900">
                          {appointment.service.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDateTime(appointment.scheduledTimeStart)}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        appointment.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                        appointment.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {appointment.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No recent appointments</p>
                  <Link href="/seller/services">
                    <Button variant="outline" size="sm" className="mt-3">
                      Add Services
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }