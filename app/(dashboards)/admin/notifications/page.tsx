'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/lib/stores/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { 
  Bell, 
  Mail, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  Trash2,
  Settings,
  Users,
  Package,
  CreditCard
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  category: 'system' | 'user' | 'payment' | 'security' | 'content';
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

const demoNotifications: Notification[] = [
  {
    id: '1',
    type: 'warning',
    title: 'High CPU Usage Detected',
    message: 'Server CPU usage has exceeded 80% for the last 15 minutes. Consider scaling up resources.',
    isRead: false,
    createdAt: '2025-01-10T10:30:00Z',
    category: 'system',
    priority: 'high'
  },
  {
    id: '2',
    type: 'success',
    title: 'New Seller Registration',
    message: 'Sarah Johnson has completed seller registration and is pending approval.',
    isRead: false,
    createdAt: '2025-01-10T09:15:00Z',
    actionUrl: '/admin/sellers',
    category: 'user',
    priority: 'medium'
  },
  {
    id: '3',
    type: 'error',
    title: 'Payment Processing Failed',
    message: 'Failed to process payment for transaction TXN-004-2025. Amount: AED 45.00',
    isRead: false,
    createdAt: '2025-01-10T08:45:00Z',
    actionUrl: '/admin/payments',
    category: 'payment',
    priority: 'urgent'
  },
  {
    id: '4',
    type: 'info',
    title: 'Database Backup Completed',
    message: 'Daily database backup completed successfully. Size: 2.3GB, Duration: 15 minutes.',
    isRead: true,
    createdAt: '2025-01-10T07:30:00Z',
    category: 'system',
    priority: 'low'
  },
  {
    id: '5',
    type: 'warning',
    title: 'Suspicious Login Attempt',
    message: 'Multiple failed login attempts detected from IP 192.168.1.100 for user admin@example.com',
    isRead: false,
    createdAt: '2025-01-10T06:20:00Z',
    category: 'security',
    priority: 'high'
  },
  {
    id: '6',
    type: 'success',
    title: 'Content Moderation Complete',
    message: 'All flagged products have been reviewed. 3 items removed, 2 items approved.',
    isRead: true,
    createdAt: '2025-01-10T05:45:00Z',
    actionUrl: '/admin/products',
    category: 'content',
    priority: 'medium'
  },
  {
    id: '7',
    type: 'info',
    title: 'Monthly Report Generated',
    message: 'Platform performance report for December 2024 has been generated and is ready for review.',
    isRead: true,
    createdAt: '2025-01-10T04:30:00Z',
    category: 'system',
    priority: 'low'
  },
  {
    id: '8',
    type: 'error',
    title: 'Email Service Down',
    message: 'SMTP service is not responding. User registration emails may be delayed.',
    isRead: false,
    createdAt: '2025-01-10T03:15:00Z',
    category: 'system',
    priority: 'urgent'
  }
];

export default function AdminNotificationsPage() {
  const { isLoading, isAuthenticated } = useAuthStore();

  const [notifications, setNotifications] = useState<Notification[]>(demoNotifications);
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [search, setSearch] = useState('');

  const filteredNotifications = notifications.filter(notification => {
    if (categoryFilter && notification.category !== categoryFilter) return false;
    if (priorityFilter && notification.priority !== priorityFilter) return false;
    if (typeFilter && notification.type !== typeFilter) return false;
    if (search && !notification.title.toLowerCase().includes(search.toLowerCase()) && 
        !notification.message.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const urgentCount = notifications.filter(n => n.priority === 'urgent').length;

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getTypeIcon = (type: string) => {
    const iconConfig = {
      info: { icon: Info, color: 'text-blue-600' },
      success: { icon: CheckCircle, color: 'text-green-600' },
      warning: { icon: AlertTriangle, color: 'text-yellow-600' },
      error: { icon: AlertTriangle, color: 'text-red-600' }
    };

    const config = iconConfig[type as keyof typeof iconConfig] || iconConfig.info;
    const Icon = config.icon;

    return <Icon className={`h-5 w-5 ${config.color}`} />;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { color: 'bg-gray-100 text-gray-800', text: 'Low' },
      medium: { color: 'bg-blue-100 text-blue-800', text: 'Medium' },
      high: { color: 'bg-orange-100 text-orange-800', text: 'High' },
      urgent: { color: 'bg-red-100 text-red-800', text: 'Urgent' }
    };

    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.low;

    return (
      <Badge className={config.color}>
        {config.text}
      </Badge>
    );
  };

  const getCategoryIcon = (category: string) => {
    const iconConfig = {
      system: { icon: Settings, color: 'text-gray-600' },
      user: { icon: Users, color: 'text-blue-600' },
      payment: { icon: CreditCard, color: 'text-green-600' },
      security: { icon: AlertTriangle, color: 'text-red-600' },
      content: { icon: Package, color: 'text-purple-600' }
    };

    const config = iconConfig[category as keyof typeof iconConfig] || iconConfig.system;
    const Icon = config.icon;

    return <Icon className={`h-4 w-4 ${config.color}`} />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wrench-accent"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notification Center</h1>
          <p className="text-gray-600">Monitor platform alerts and system notifications</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={markAllAsRead} 
            variant="outline" 
            leftIcon={<CheckCircle className="h-4 w-4" />}
          >
            Mark All Read
          </Button>
          <Button 
            variant="primary" 
            leftIcon={<Bell className="h-4 w-4" />}
          >
            Send Notification
          </Button>
        </div>
      </div>

      {/* Notification Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Notifications</p>
                <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
                <p className="text-sm text-gray-500">All time</p>
              </div>
              <Bell className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unread</p>
                <p className="text-2xl font-bold text-gray-900">{unreadCount}</p>
                <p className="text-sm text-yellow-600">Requires attention</p>
              </div>
              <Mail className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Urgent</p>
                <p className="text-2xl font-bold text-gray-900">{urgentCount}</p>
                <p className="text-sm text-red-600">Immediate action needed</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">System Health</p>
                <p className="text-2xl font-bold text-gray-900">Good</p>
                <p className="text-sm text-green-600">All systems operational</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <Input
                type="text"
                placeholder="Search notifications..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wrench-accent focus:border-transparent"
              >
                <option value="">All Categories</option>
                <option value="system">System</option>
                <option value="user">User</option>
                <option value="payment">Payment</option>
                <option value="security">Security</option>
                <option value="content">Content</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wrench-accent focus:border-transparent"
              >
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wrench-accent focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={() => {
                  setCategoryFilter('');
                  setPriorityFilter('');
                  setTypeFilter('');
                  setSearch('');
                }} 
                variant="outline" 
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications ({filteredNotifications.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No notifications found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border rounded-lg transition-colors ${
                    notification.isRead 
                      ? 'border-gray-200 bg-gray-50' 
                      : 'border-blue-200 bg-blue-50'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3 mb-2">
                        {getTypeIcon(notification.type)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`font-medium ${
                              notification.isRead ? 'text-gray-700' : 'text-gray-900'
                            }`}>
                              {notification.title}
                            </h3>
                            {getPriorityBadge(notification.priority)}
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              {getCategoryIcon(notification.category)}
                              <span className="capitalize">{notification.category}</span>
                            </div>
                          </div>
                          
                          <p className={`text-sm ${
                            notification.isRead ? 'text-gray-600' : 'text-gray-700'
                          }`}>
                            {notification.message}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500 ml-8">
                        <span>{formatDate(notification.createdAt)}</span>
                        {notification.actionUrl && (
                          <span className="text-blue-600 hover:underline cursor-pointer">
                            View Details →
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 min-w-fit">
                      {!notification.isRead && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => markAsRead(notification.id)}
                        >
                          Mark Read
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        leftIcon={<Trash2 className="h-4 w-4" />}
                        onClick={() => deleteNotification(notification.id)}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Demo Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Bell className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-800">Demo Mode</h4>
              <p className="text-sm text-blue-700 mt-1">
                This page displays sample notification data for demonstration purposes. In production, this would show real-time system alerts, user notifications, and platform events.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
