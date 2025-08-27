'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SellerAvailability, SellerTimeOff } from '@/types';
import { Calendar, RefreshCw, ChevronLeft, ChevronRight, Clock } from 'lucide-react';

interface AvailabilityCalendarProps {
  schedule: SellerAvailability[];
  timeOff: SellerTimeOff[];
  onRefresh: () => void;
}

export function AvailabilityCalendar({ schedule, timeOff, onRefresh }: AvailabilityCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setIsRefreshing(false);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getAvailabilityForDate = (date: Date) => {
    const dayOfWeek = date.getDay();
    const daySchedule = schedule.find(s => s.dayOfWeek === dayOfWeek);
    
    // Check if it's a time off day
    const isTimeOff = timeOff.some(to => {
      const start = new Date(to.startDate);
      const end = new Date(to.endDate);
      return date >= start && date <= end && to.isActive;
    });
    
    if (isTimeOff) {
      return { status: 'timeoff', hours: null };
    }
    
    if (!daySchedule || !daySchedule.isAvailable) {
      return { status: 'unavailable', hours: null };
    }
    
    return { 
      status: 'available', 
      hours: `${daySchedule.startTime} - ${daySchedule.endTime}` 
    };
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const days = getDaysInMonth(currentDate);
  const monthYear = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Availability Calendar
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Calendar Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={previousMonth}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          
          <h3 className="text-lg font-semibold text-gray-900">
            {monthYear}
          </h3>
          
          <Button
            variant="outline"
            size="sm"
            onClick={nextMonth}
            className="gap-2"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {/* Day headers */}
          {dayNames.map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {days.map((day, index) => {
            if (!day) {
              return <div key={index} className="p-2"></div>;
            }
            
            const availability = getAvailabilityForDate(day);
            const isToday = day.toDateString() === new Date().toDateString();
            
            let cellClass = 'p-2 text-center text-sm border rounded transition-colors ';
            
            if (isToday) {
              cellClass += 'border-wrench-orange-500 font-semibold ';
            } else {
              cellClass += 'border-gray-200 ';
            }
            
            switch (availability.status) {
              case 'available':
                cellClass += 'bg-green-50 text-green-800 hover:bg-green-100';
                break;
              case 'timeoff':
                cellClass += 'bg-red-50 text-red-800 hover:bg-red-100';
                break;
              case 'unavailable':
                cellClass += 'bg-gray-50 text-gray-500 hover:bg-gray-100';
                break;
            }
            
            return (
              <div
                key={index}
                className={cellClass}
                title={availability.hours || availability.status}
              >
                <div className="font-medium">{day.getDate()}</div>
                {availability.status === 'available' && availability.hours && (
                  <div className="text-xs mt-1 flex items-center justify-center">
                    <Clock className="h-2 w-2 mr-1" />
                    <span className="truncate">{availability.hours}</span>
                  </div>
                )}
                {availability.status === 'timeoff' && (
                  <div className="text-xs mt-1">Off</div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
            <span>Time Off</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-100 border border-gray-200 rounded"></div>
            <span>Not Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-wrench-orange-500 rounded"></div>
            <span>Today</span>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">This Month Summary</h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Available Days:</span>
              <div className="font-medium text-green-600">
                {days.filter(day => day && getAvailabilityForDate(day).status === 'available').length}
              </div>
            </div>
            <div>
              <span className="text-gray-600">Time Off Days:</span>
              <div className="font-medium text-red-600">
                {days.filter(day => day && getAvailabilityForDate(day).status === 'timeoff').length}
              </div>
            </div>
            <div>
              <span className="text-gray-600">Unavailable Days:</span>
              <div className="font-medium text-gray-600">
                {days.filter(day => day && getAvailabilityForDate(day).status === 'unavailable').length}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}