'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SellerTimeOff, AddTimeOffData } from '@/types';
import { apiClient } from '@/lib/api/client';
import { Calendar, Plus, Trash2, AlertCircle, Edit, X } from 'lucide-react';

interface TimeOffManagerProps {
  timeOff: SellerTimeOff[];
  onTimeOffUpdate: () => void;
}

export function TimeOffManager({ timeOff, onTimeOffUpdate }: TimeOffManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingTimeOff, setEditingTimeOff] = useState<SellerTimeOff | null>(null);
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

  const startEditTimeOff = (timeOffPeriod: SellerTimeOff) => {
    setEditingTimeOff({
      ...timeOffPeriod,
      startDate: timeOffPeriod.startDate.split('T')[0], // Convert to date input format
      endDate: timeOffPeriod.endDate.split('T')[0]
    });
  };

  const cancelEdit = () => {
    setEditingTimeOff(null);
  };

  const updateTimeOff = async () => {
    if (!editingTimeOff || !editingTimeOff.startDate || !editingTimeOff.endDate) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const response = await apiClient.updateTimeOff(editingTimeOff.id, {
        startDate: editingTimeOff.startDate,
        endDate: editingTimeOff.endDate,
        reason: editingTimeOff.reason
      });
      
      if (response.success) {
        setEditingTimeOff(null);
        onTimeOffUpdate();
        alert('Time off updated successfully!');
      } else {
        alert('Failed to update time off: ' + (response.error?.message || 'Unknown error'));
      }
    } catch (error: any) {
      alert('Failed to update time off: ' + error.message);
    }
  };

  const removeTimeOff = async (timeOffId: string) => {
    if (confirm('Are you sure you want to remove this time off period?')) {
      try {
        const response = await apiClient.deleteTimeOff(timeOffId);
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
    const date = new Date(dateString);
    // Handle timezone issues by ensuring we get the correct date
    const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
    return utcDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Handle timezone issues
    const utcStart = new Date(start.getTime() + start.getTimezoneOffset() * 60000);
    const utcEnd = new Date(end.getTime() + end.getTimezoneOffset() * 60000);
    
    if (utcStart.toDateString() === utcEnd.toDateString()) {
      // Same day
      return formatDate(startDate);
    }
    
    return `${utcStart.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })} - ${utcEnd.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}`;
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
                    {editingTimeOff?.id === timeOffPeriod.id ? (
                      // Edit Form
                      <div className="flex-1 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Start Date
                            </label>
                            <Input
                              type="date"
                              value={editingTimeOff.startDate}
                              onChange={(e) => setEditingTimeOff(prev => prev ? { ...prev, startDate: e.target.value } : null)}
                              min={new Date().toISOString().split('T')[0]}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              End Date
                            </label>
                            <Input
                              type="date"
                              value={editingTimeOff.endDate}
                              onChange={(e) => setEditingTimeOff(prev => prev ? { ...prev, endDate: e.target.value } : null)}
                              min={editingTimeOff.startDate || new Date().toISOString().split('T')[0]}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Reason (Optional)
                          </label>
                          <Input
                            placeholder="e.g., Vacation, Medical appointment, etc."
                            value={editingTimeOff.reason || ''}
                            onChange={(e) => setEditingTimeOff(prev => prev ? { ...prev, reason: e.target.value } : null)}
                          />
                        </div>

                        <div className="flex gap-3">
                          <Button onClick={updateTimeOff} size="sm">
                            Update Time Off
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={cancelEdit}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // Display Mode
                      <>
                        <div className="flex-1">
                           <div className="flex items-center gap-2 mb-1">
                             <Calendar className="h-4 w-4 text-gray-400" />
                             <span className="font-medium text-gray-900">
                               {formatDateRange(timeOffPeriod.startDate, timeOffPeriod.endDate)}
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
                        
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEditTimeOff(timeOffPeriod)}
                            className="gap-2 text-blue-600 hover:text-blue-700"
                          >
                            <Edit className="h-3 w-3" />
                            Edit
                          </Button>
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
                      </>
                    )}
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