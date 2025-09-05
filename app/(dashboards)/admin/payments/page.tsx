'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/lib/stores/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  CreditCard, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Download,
  RefreshCw
} from 'lucide-react';

interface PaymentTransaction {
  id: string;
  transactionId: string;
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  type: 'commission' | 'withdrawal' | 'subscription' | 'refund';
  userId: string;
  userName: string;
  userEmail: string;
  description: string;
  createdAt: string;
  processedAt?: string;
}

const demoTransactions: PaymentTransaction[] = [
  {
    id: '1',
    transactionId: 'TXN-001-2025',
    amount: 25.50,
    currency: 'USD',
    status: 'completed',
    type: 'commission',
    userId: 'user-1',
    userName: 'John Smith',
    userEmail: 'john@example.com',
    description: 'Platform commission from order #ORD-123',
    createdAt: '2025-01-10T10:30:00Z',
    processedAt: '2025-01-10T10:35:00Z'
  },
  {
    id: '2',
    transactionId: 'TXN-002-2025',
    amount: 150.00,
    currency: 'USD',
    status: 'pending',
    type: 'withdrawal',
    userId: 'user-2',
    userName: 'Sarah Johnson',
    userEmail: 'sarah@example.com',
    description: 'Seller withdrawal request',
    createdAt: '2025-01-10T09:15:00Z'
  },
  {
    id: '3',
    transactionId: 'TXN-003-2025',
    amount: 99.99,
    currency: 'USD',
    status: 'completed',
    type: 'subscription',
    userId: 'user-3',
    userName: 'Mike Wilson',
    userEmail: 'mike@example.com',
    description: 'Premium seller subscription',
    createdAt: '2025-01-10T08:45:00Z',
    processedAt: '2025-01-10T08:50:00Z'
  },
  {
    id: '4',
    transactionId: 'TXN-004-2025',
    amount: 45.00,
    currency: 'USD',
    status: 'failed',
    type: 'commission',
    userId: 'user-4',
    userName: 'Lisa Brown',
    userEmail: 'lisa@example.com',
    description: 'Platform commission from order #ORD-124',
    createdAt: '2025-01-10T07:20:00Z'
  },
  {
    id: '5',
    transactionId: 'TXN-005-2025',
    amount: 75.00,
    currency: 'USD',
    status: 'refunded',
    type: 'refund',
    userId: 'user-5',
    userName: 'David Lee',
    userEmail: 'david@example.com',
    description: 'Refund for cancelled service',
    createdAt: '2025-01-10T06:30:00Z',
    processedAt: '2025-01-10T06:45:00Z'
  }
];

export default function AdminPaymentsPage() {
  const { isLoading, isAuthenticated } = useAuthStore();

  const [transactions, setTransactions] = useState<PaymentTransaction[]>(demoTransactions);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');

  const filteredTransactions = transactions.filter(transaction => {
    if (statusFilter && transaction.status !== statusFilter) return false;
    if (typeFilter && transaction.type !== typeFilter) return false;
    return true;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      failed: { color: 'bg-red-100 text-red-800', icon: XCircle },
      refunded: { color: 'bg-blue-100 text-blue-800', icon: AlertCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      commission: { color: 'bg-purple-100 text-purple-800', text: 'Commission' },
      withdrawal: { color: 'bg-blue-100 text-blue-800', text: 'Withdrawal' },
      subscription: { color: 'bg-green-100 text-green-800', text: 'Subscription' },
      refund: { color: 'bg-orange-100 text-orange-800', text: 'Refund' }
    };

    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.commission;

    return (
      <Badge className={config.color}>
        {config.text}
      </Badge>
    );
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

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getTotalAmount = (status?: string) => {
    const filtered = status 
      ? transactions.filter(t => t.status === status)
      : transactions;
    
    return filtered.reduce((sum, t) => sum + t.amount, 0);
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
          <h1 className="text-2xl font-bold text-gray-900">Payment Management</h1>
          <p className="text-gray-600">Monitor platform payments, commissions, and withdrawals</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>
            Export Data
          </Button>
          <Button variant="outline" leftIcon={<RefreshCw className="h-4 w-4" />}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Payment Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(getTotalAmount(), 'USD')}
                </p>
                <p className="text-sm text-green-600">+12.5% this month</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                AED
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(getTotalAmount('pending'), 'USD')}
                </p>
                <p className="text-sm text-yellow-600">3 transactions</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Failed Transactions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(getTotalAmount('failed'), 'USD')}
                </p>
                <p className="text-sm text-red-600">1 transaction</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">80%</p>
                <p className="text-sm text-blue-600">4 of 5 successful</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status Filter
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wrench-accent focus:border-transparent"
              >
                <option value="">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type Filter
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wrench-accent focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="commission">Commission</option>
                <option value="withdrawal">Withdrawal</option>
                <option value="subscription">Subscription</option>
                <option value="refund">Refund</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={() => {
                  setStatusFilter('');
                  setTypeFilter('');
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

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Transactions ({filteredTransactions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No transactions found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-gray-900">
                          {transaction.transactionId}
                        </h3>
                        {getStatusBadge(transaction.status)}
                        {getTypeBadge(transaction.type)}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">
                        {transaction.description}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-gray-700">Amount</p>
                          <p className="text-gray-600 font-semibold">
                            {formatCurrency(transaction.amount, transaction.currency)}
                          </p>
                        </div>
                        
                        <div>
                          <p className="font-medium text-gray-700">User</p>
                          <p className="text-gray-600">{transaction.userName}</p>
                          <p className="text-xs text-gray-500">{transaction.userEmail}</p>
                        </div>
                        
                        <div>
                          <p className="font-medium text-gray-700">Created</p>
                          <p className="text-gray-600">{formatDate(transaction.createdAt)}</p>
                        </div>
                        
                        <div>
                          <p className="font-medium text-gray-700">Processed</p>
                          <p className="text-gray-600">
                            {transaction.processedAt 
                              ? formatDate(transaction.processedAt)
                              : 'Not processed'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 min-w-fit">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      {transaction.status === 'pending' && (
                        <Button variant="primary" size="sm">
                          Process Payment
                        </Button>
                      )}
                      {transaction.status === 'failed' && (
                        <Button variant="outline" size="sm" className="text-red-600 border-red-200">
                          Retry
                        </Button>
                      )}
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
            <CreditCard className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-800">Demo Mode</h4>
              <p className="text-sm text-blue-700 mt-1">
                This page displays sample payment data for demonstration purposes. In production, this would show real-time payment transactions from your payment processor.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
