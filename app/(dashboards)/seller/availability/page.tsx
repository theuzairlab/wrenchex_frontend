'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth';
import { apiClient } from '@/lib/api/client';
import { SellerAvailability, SellerTimeOff } from '@/types';
import { WeeklySchedule } from '@/components/seller/WeeklySchedule';
import { TimeOffManager } from '@/components/seller/TimeOffManager';
import { AvailabilityCalendar } from '@/components/seller/AvailabilityCalendar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Card, CardContent } from '@/components/ui/Card';
import { Calendar, Clock, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function SellerAvailabilityPage() {
  const { user, isAuthenticated } = useAuthStore();
  const pathname = usePathname();
  const currentLocale = pathname?.split('/').filter(Boolean)[0] === 'ar' ? 'ar' : 'en';
  const t = useTranslations('sellerAvailability');
  const [schedule, setSchedule] = useState<SellerAvailability[]>([]);
  const [timeOff, setTimeOff] = useState<SellerTimeOff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'schedule' | 'timeoff' | 'calendar'>('schedule');

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'SELLER') {
      return;
    }

    fetchAvailabilityData();
  }, [isAuthenticated, user]);

  const fetchAvailabilityData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [scheduleResponse, timeOffResponse] = await Promise.all([
        apiClient.getMySchedule(),
        apiClient.getMyTimeOff()
      ]);
      
      console.log('Schedule response:', scheduleResponse);
      console.log('Time off response:', timeOffResponse);
      
      if (scheduleResponse.success) {
        setSchedule(scheduleResponse.data || []);
      }
      
      if (timeOffResponse.success) {
        setTimeOff(timeOffResponse.data || []);
      }
      
      if (!scheduleResponse.success) {
        setError(scheduleResponse.error?.message || t('failedToLoadSchedule'));
      }
    } catch (err: any) {
      console.error('Availability error:', err);
      setError(err.message || t('failedToLoadAvailabilityData'));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated || user?.role !== 'SELLER') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('accessDenied')}</h1>
          <p className="text-gray-600">{t('mustBeSellerToAccess')}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
        <div className="flex items-center justify-center min-h-96">
          <LoadingSpinner />
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
            <p className="text-lg font-medium">{t('errorLoadingAvailability')}</p>
            <p className="text-sm text-gray-600">{error}</p>
          </div>
          <button 
            onClick={fetchAvailabilityData}
            className="bg-wrench-orange-500 text-white px-4 py-2 rounded-lg hover:bg-wrench-orange-600"
          >
            {t('tryAgain')}
          </button>
        </div>
    );
  }

  return (
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t('availabilityManagement')}
          </h1>
          <p className="mt-2 text-gray-600">
            {t('manageWorkingHoursDescription')}
          </p>
        </div>

        {/* Tab Navigation */}
        <Card>
          <CardContent className="p-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('schedule')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'schedule'
                      ? 'border-wrench-orange-500 text-wrench-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {t('weeklySchedule')}
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('timeoff')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'timeoff'
                      ? 'border-wrench-orange-500 text-wrench-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    {t('timeOff')}
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('calendar')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'calendar'
                      ? 'border-wrench-orange-500 text-wrench-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {t('calendarView')}
                  </div>
                </button>
              </nav>
            </div>
          </CardContent>
        </Card>

        {/* Tab Content */}
        {activeTab === 'schedule' && (
          <WeeklySchedule
            schedule={schedule}
            onScheduleUpdate={fetchAvailabilityData}
          />
        )}

        {activeTab === 'timeoff' && (
          <TimeOffManager
            timeOff={timeOff}
            onTimeOffUpdate={fetchAvailabilityData}
          />
        )}

        {activeTab === 'calendar' && (
          <AvailabilityCalendar
            schedule={schedule}
            timeOff={timeOff}
            onRefresh={fetchAvailabilityData}
          />
        )}
      </div>
  );
}