'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SellerAvailability, SetAvailabilityData } from '@/types';
import { apiClient } from '@/lib/api/client';
import { Clock, Save, RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface WeeklyScheduleProps {
  schedule: SellerAvailability[];
  onScheduleUpdate: () => void;
}

export function WeeklySchedule({ schedule, onScheduleUpdate }: WeeklyScheduleProps) {
  const pathname = usePathname();
  const currentLocale = pathname?.split('/').filter(Boolean)[0] === 'ar' ? 'ar' : 'en';
  const t = useTranslations('weeklySchedule');
  const [isLoading, setIsLoading] = useState(false);
  const [localSchedule, setLocalSchedule] = useState<SetAvailabilityData[]>(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days.map((_, dayOfWeek) => {
      const existing = schedule.find(s => s.dayOfWeek === dayOfWeek);
      return {
        dayOfWeek,
        startTime: existing?.startTime || '09:00',
        endTime: existing?.endTime || '17:00',
        isAvailable: existing?.isAvailable ?? true
      };
    });
  });

  const dayNames = [
    t('days.sunday'),
    t('days.monday'),
    t('days.tuesday'),
    t('days.wednesday'),
    t('days.thursday'),
    t('days.friday'),
    t('days.saturday')
  ];

  const updateDaySchedule = (dayOfWeek: number, field: keyof SetAvailabilityData, value: any) => {
    setLocalSchedule(prev => prev.map(day => 
      day.dayOfWeek === dayOfWeek ? { ...day, [field]: value } : day
    ));
  };

  const saveSchedule = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.setWeeklyAvailability({ weeklySchedule: localSchedule });
      if (response.success) {
        onScheduleUpdate();
        alert(t('scheduleUpdatedSuccessfully'));
      } else {
        alert(t('failedToUpdateSchedule') + ': ' + (response.error?.message || t('unknownError')));
      }
    } catch (error: any) {
      alert(t('failedToUpdateSchedule') + ': ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {t('weeklySchedule')}
          </CardTitle>
          <Button
            onClick={saveSchedule}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {t('saveSchedule')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {localSchedule.map((day, index) => (
            <div key={day.dayOfWeek} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
              <div className="w-24">
                <label className="font-medium text-gray-900">
                  {dayNames[day.dayOfWeek]}
                </label>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={day.isAvailable}
                  onChange={(e) => updateDaySchedule(day.dayOfWeek, 'isAvailable', e.target.checked)}
                  className="w-4 h-4 text-wrench-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-wrench-orange-500"
                />
                <span className="text-sm text-gray-600">{t('available')}</span>
              </div>

              {day.isAvailable && (
                <>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">{t('from')}:</label>
                    <Input
                      type="time"
                      value={day.startTime}
                      onChange={(e) => updateDaySchedule(day.dayOfWeek, 'startTime', e.target.value)}
                      className="w-32"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">{t('to')}:</label>
                    <Input
                      type="time"
                      value={day.endTime}
                      onChange={(e) => updateDaySchedule(day.dayOfWeek, 'endTime', e.target.value)}
                      className="w-32"
                    />
                  </div>
                </>
              )}

              {!day.isAvailable && (
                <span className="text-sm text-gray-500 italic">{t('notAvailableOnThisDay')}</span>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">{t('scheduleTips')}</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• {t('tip1')}</li>
            <li>• {t('tip2')}</li>
            <li>• {t('tip3')}</li>
            <li>• {t('tip4')}</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}