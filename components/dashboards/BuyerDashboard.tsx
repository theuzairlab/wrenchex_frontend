'use client';

import { useEffect, useState } from "react";
import { ArrowRight, Calendar, Heart, MessageCircle, Search, Wrench } from "lucide-react";
import { Button } from "../ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { apiClient } from "@/lib/api/client";
import { toast } from "sonner";
import { useTranslations } from 'next-intl';

interface ChatStats {
  totalChats: number;
  activeChats: number;
  unreadMessages: number;
}

interface AppointmentStats {
  totalAppointments: number;
  upcomingAppointments: any[];
}

// Buyer Dashboard Content
export function BuyerDashboard({ User }: { User: any }) {
    const user = User();
    const [chatStats, setChatStats] = useState<ChatStats>({ totalChats: 0, activeChats: 0, unreadMessages: 0 });
    const [appointmentStats, setAppointmentStats] = useState<AppointmentStats>({ totalAppointments: 0, upcomingAppointments: [] });
    const [recentChats, setRecentChats] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const t = useTranslations('buyerDashboard');
  const pathname = usePathname();
  const currentLocale = pathname?.split('/').filter(Boolean)[0] === 'ar' ? 'ar' : 'en';

    useEffect(() => {
      loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Load chat data
        const [chatsResponse, unreadResponse] = await Promise.all([
          apiClient.getUserChats(),
          apiClient.getUnreadChatCount(),
        ]);

        if (chatsResponse.success && chatsResponse.data) {
          const allChats = chatsResponse.data.chats || [];
          // Filter for buyer chats (where user is the buyer)
          const buyerChats = allChats.filter(chat => chat.buyerId === user?.id);
          
          setChatStats({
            totalChats: buyerChats.length,
            activeChats: buyerChats.filter(chat => chat.isActive).length,
            unreadMessages: unreadResponse.success && unreadResponse.data ? unreadResponse.data.count : 0
          });

          // Show recent chats (last 5)
          setRecentChats(buyerChats.slice(0, 5));
        }

        // Load appointments if available
        try {
          const appointmentsResponse = await apiClient.getAppointments({ buyerId: user?.id, limit: 5 });
          if (appointmentsResponse.success && appointmentsResponse.data) {
            const appointments = Array.isArray(appointmentsResponse.data) ? appointmentsResponse.data : [];
            setAppointmentStats({
              totalAppointments: appointments.length,
              upcomingAppointments: appointments.filter(apt => 
                new Date(apt.scheduledDate) > new Date()
              ).slice(0, 3)
            });
          } else {
            // Set empty appointments if none found
            setAppointmentStats({
              totalAppointments: 0,
              upcomingAppointments: []
            });
          }
        } catch (error: any) {
          // Appointments might not be available for this user
          console.log('No appointments data available:', error.message);
          setAppointmentStats({
            totalAppointments: 0,
            upcomingAppointments: []
          });
        }

      } catch (error: any) {
        console.error('Failed to load dashboard data:', error);
        toast.error(t('loadDashboardDataFailed'));
      } finally {
        setIsLoading(false);
      }
    };
  
    return (
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t('welcomeBack', { name: user?.firstName })}
          </h2>
          <p className="text-gray-600 mb-4">
            {t('findPerfectParts')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href={`/${currentLocale}/products`}>
              <Button variant="primary" leftIcon={<Search className="h-4 w-4" />}>
                {t('browseProducts')}
              </Button>
            </Link>
            <Link href={`/${currentLocale}/buyer/chats`}>
              <Button variant="secondary" leftIcon={<MessageCircle className="h-4 w-4" />}>
                {t('myChats')}
              </Button>
            </Link>
            <Link href={`/${currentLocale}/services`}>
              <Button variant="outline" leftIcon={<Wrench className="h-4 w-4" />}>
                {t('bookService')}
              </Button>
            </Link>
          </div>
        </div>
  
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('totalChats')}</p>
                  <p className="text-2xl font-bold text-gray-900">{isLoading ? '...' : chatStats.totalChats}</p>
                  <p className="text-sm text-blue-600">{t('withSellers')}</p>
                </div>
                <MessageCircle className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
  
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('unreadMessages')}</p>
                  <p className="text-2xl font-bold text-gray-900">{isLoading ? '...' : chatStats.unreadMessages}</p>
                  <p className="text-sm text-green-600">{t('newMessages')}</p>
                </div>
                <MessageCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
  
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('activeChats')}</p>
                  <p className="text-2xl font-bold text-gray-900">{isLoading ? '...' : chatStats.activeChats}</p>
                  <p className="text-sm text-orange-600">{t('ongoingConversations')}</p>
                </div>
                <MessageCircle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
  
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('appointments')}</p>
                  <p className="text-2xl font-bold text-gray-900">{isLoading ? '...' : appointmentStats.totalAppointments}</p>
                  <p className="text-sm text-purple-600">{t('scheduledServices')}</p>
                </div>
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
  
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Chats */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{t('recentChats')}</CardTitle>
                <Link href={`/${currentLocale}/buyer/chats`}>
                  <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                    {t('viewAll')}
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {recentChats.length > 0 ? (
                <div className="space-y-4">
                  {recentChats.map((chat: any) => (
                    <div key={chat.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{chat.product?.title || t('productChat')}</p>
                        <p className="text-sm text-gray-500">{t('with')} {chat.seller?.firstName} {chat.seller?.lastName}</p>
                        {chat.messages && chat.messages.length > 0 && (
                          <p className="text-xs text-gray-400 mt-1 truncate">
                            {chat.messages[chat.messages.length - 1]?.message}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        {chat.unreadCount > 0 && (
                          <span className="bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded-full">
                            {chat.unreadCount} {t('new')}
                          </span>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(chat.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageCircle className="mx-auto mb-4 text-gray-400" size={48} />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('noChatsYet')}</h3>
                  <p className="text-gray-600 mb-4">{t('startChattingWithSellers')}</p>
                  <Link href={`/${currentLocale}/products`}>
                    <Button variant="outline">{t('browseProducts')}</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
  
          {/* Upcoming Appointments */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{t('upcomingAppointments')}</CardTitle>
                <Link href={`/${currentLocale}/appointments`}>
                  <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                    {t('viewAll')}
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {appointmentStats.upcomingAppointments.length > 0 ? (
                <div className="space-y-4">
                  {appointmentStats.upcomingAppointments.map((appointment: any) => (
                    <div key={appointment.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        <Calendar className="h-10 w-10 text-blue-600" />
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="font-medium text-gray-900">{appointment.service?.title || t('serviceAppointment')}</p>
                        <p className="text-sm text-gray-500">{appointment.seller?.shopName || t('autoServiceCenter')}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(appointment.scheduledDate).toLocaleDateString()} at {new Date(appointment.scheduledTimeStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          appointment.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                          appointment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {t(`appointmentStatus.${appointment.status.toLowerCase()}`)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">{t('noUpcomingAppointments')}</p>
                  <Link href={`/${currentLocale}/services`}>
                    <Button variant="outline" size="sm" className="mt-3">
                      {t('bookService')}
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