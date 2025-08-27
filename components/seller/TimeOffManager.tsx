'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SellerTimeOff, AddTimeOffData } from '@/types';
import { apiClient } from '@/lib/api/client';
import { Calendar, Plus, Trash2, AlertCircle } from 'lucide-react';

interface TimeOffManagerProps {
  timeOff: SellerTimeOff[];
  onTimeOffUpdate: () => void;
}

export function TimeOffManager({ timeOff, onTimeOffUpdate }: TimeOffManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTimeOff, setNewTimeOff] = useState<AddTimeOffData>({
    startDate: '',
    endDate: '',
    reason: ''
  });

  const addTimeOff = async () => {
    if (!newTimeOff.startDate || !newTimeOff.endDate) {
      alert('Please select start and end dates');
      return;
    }

    try {
      const response = await apiClient.addTimeOff(newTimeOff);
      if (response.success) {
        setNewTimeOff({ startDate: '', endDate: '', reason: '' });
        setIsAdding(false);
        onTimeOffUpdate();
        alert('Time off added successfully!');
      } else {
        alert('Failed to add time off: ' + (response.error?.message || 'Unknown error'));
      }
    } catch (error: any) {
      alert('Failed to add time off: ' + error.message);
    }
  };

  const removeTimeOff = async (timeOffId: string) => {
    if (confirm('Are you sure you want to remove this time off period?')) {
      try {
        const response = await apiClient.removeTimeOff(timeOffId);
        if (response.success) {
          onTimeOffUpdate();
          alert('Time off removed successfully!');
        } else {
          alert('Failed to remove time off: ' + (response.error?.message || 'Unknown error'));
        }
      } catch (error: any) {
        alert('Failed to remove time off: ' + error.message);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Add New Time Off */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Time Off
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isAdding ? (
            <Button
              onClick={() => setIsAdding(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Time Off Period
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <Input
                    type="date"
                    value={newTimeOff.startDate}
                    onChange={(e) => setNewTimeOff(prev => ({ ...prev, startDate: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <Input
                    type="date"
                    value={newTimeOff.endDate}
                    onChange={(e) => setNewTimeOff(prev => ({ ...prev, endDate: e.target.value }))}
                    min={newTimeOff.startDate || new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason (Optional)
                </label>
                <Input
                  placeholder="e.g., Vacation, Medical appointment, etc."
                  value={newTimeOff.reason}
                  onChange={(e) => setNewTimeOff(prev => ({ ...prev, reason: e.target.value }))}
                />
              </div>

              <div className="flex gap-3">
                <Button onClick={addTimeOff}>
                  Add Time Off
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAdding(false);
                    setNewTimeOff({ startDate: '', endDate: '', reason: '' });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Existing Time Off Periods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Scheduled Time Off ({timeOff.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {timeOff.length > 0 ? (
            <div className="space-y-3">
              {timeOff
                .filter(to => to.isActive)
                .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                .map((timeOffPeriod) => (
                  <div
                    key={timeOffPeriod.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-900">
                          {formatDate(timeOffPeriod.startDate)} - {formatDate(timeOffPeriod.endDate)}
                        </span>
                      </div>
                      {timeOffPeriod.reason && (
                        <p className="text-sm text-gray-600">
                          Reason: {timeOffPeriod.reason}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        Added on {formatDate(timeOffPeriod.createdAt)}
                      </p>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeTimeOff(timeOffPeriod.id)}
                      className="gap-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                      Remove
                    </Button>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">No time off scheduled</p>
              <p className="text-sm text-gray-500">
                Add time off periods when you won't be available for appointments.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-800">Time Off Guidelines</h4>
              <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                <li>• Time off periods block all appointment bookings during those dates</li>
                <li>• Existing appointments during time off will need to be rescheduled manually</li>
                <li>• Customers will not see available slots during your time off</li>
                <li>• You can remove time off periods if your plans change</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}