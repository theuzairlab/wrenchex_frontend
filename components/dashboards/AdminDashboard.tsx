import { Activity, BarChart3, DollarSign, MessageSquare, Package, Users } from "lucide-react";
import { Button } from "../ui/Button";
import { Card, CardContent } from "../ui/Card";
import Link from "next/link";




// Admin Dashboard Content
export function AdminDashboard({ User }: { User: any}) {
    const user = User();
  
    return (
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-6 border border-red-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Admin Dashboard 🛡️
          </h2>
          <p className="text-gray-600 mb-4">
            Monitor platform performance, manage users, and oversee marketplace operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/admin/analytics">
              <Button variant="primary" leftIcon={<BarChart3 className="h-4 w-4" />}>
                Platform Analytics
              </Button>
            </Link>
            <Link href="/admin/users">
              <Button variant="secondary" leftIcon={<Users className="h-4 w-4" />}>
                Manage Users
              </Button>
            </Link>
          </div>
        </div>
  
        {/* Platform Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">2,847</p>
                  <p className="text-sm text-green-600">+5.2% this month</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
  
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Sellers</p>
                  <p className="text-2xl font-bold text-gray-900">312</p>
                  <p className="text-sm text-blue-600">23 pending approval</p>
                </div>
                <Activity className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
  
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Platform Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">$89,420</p>
                  <p className="text-sm text-green-600">+18.7% this month</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
  
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Support Tickets</p>
                  <p className="text-2xl font-bold text-gray-900">47</p>
                  <p className="text-sm text-orange-600">12 urgent</p>
                </div>
                <MessageSquare className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
  
        {/* Admin Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <Users className="h-12 w-12 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">User Management</h3>
              <p className="text-sm text-gray-600 mb-4">Manage users, sellers, and permissions</p>
              <Link href="/admin/users">
                <Button variant="outline" className="w-full">
                  Manage Users
                </Button>
              </Link>
            </CardContent>
          </Card>
  
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <BarChart3 className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Analytics</h3>
              <p className="text-sm text-gray-600 mb-4">View detailed platform analytics</p>
              <Link href="/admin/analytics">
                <Button variant="outline" className="w-full">
                  View Analytics
                </Button>
              </Link>
            </CardContent>
          </Card>
  
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <Package className="h-12 w-12 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Content Management</h3>
              <p className="text-sm text-gray-600 mb-4">Manage products, categories, and content</p>
              <Link href="/admin/content">
                <Button variant="outline" className="w-full">
                  Manage Content
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }