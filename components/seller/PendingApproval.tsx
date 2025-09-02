import React from 'react';
import { Clock, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';

interface PendingApprovalProps {
  shopName?: string;
  email?: string;
}

export function PendingApproval({ shopName, email }: PendingApprovalProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-full flex items-center justify-center shadow-lg">
              <Clock className="w-12 h-12 text-yellow-600" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center shadow-md">
              <Mail className="w-4 h-4 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            Account Pending Approval
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {shopName ? `Your shop "${shopName}" is currently under review.` : 'Your seller account is currently under review.'} 
            We'll notify you via email once the approval process is complete.
          </p>
        </div>
        
        {/* Progress Indicator */}
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
            <span>Application Submitted</span>
            <span>Under Review</span>
            <span>Approved</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-yellow-500 h-2 rounded-full w-1/2 transition-all duration-500 ease-in-out animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-yellow-200 bg-yellow-50 hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <CardTitle className="text-yellow-800 text-sm">Current Status</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-700 font-medium">Under Review</p>
            <p className="text-yellow-600 text-sm mt-1">Our team is evaluating your application</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50 hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Mail className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-blue-800 text-sm">Email Updates</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-blue-700 font-medium">Status Notifications</p>
            <p className="text-blue-600 text-sm mt-1">You'll receive email updates about your approval status</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50 hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <CardTitle className="text-green-800 text-sm">Next Steps</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-green-700 font-medium">Get Started</p>
            <p className="text-green-600 text-sm mt-1">Once approved, you can start selling immediately</p>
          </CardContent>
        </Card>
      </div>

      {/* What Happens Next */}
      <Card className="hover:shadow-md transition-shadow duration-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-gray-600" />
            <span>What Happens Next?</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 group hover:bg-gray-50 p-2 rounded-lg transition-colors duration-200">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-blue-200 transition-colors duration-200">
                <span className="text-blue-600 text-sm font-medium">1</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Application Review</h4>
                <p className="text-gray-600 text-sm">Our team reviews your shop details and business information</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 group hover:bg-gray-50 p-2 rounded-lg transition-colors duration-200">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-blue-200 transition-colors duration-200">
                <span className="text-blue-600 text-sm font-medium">2</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Email Notification</h4>
                <p className="text-gray-600 text-sm">You'll receive an email with your approval status and next steps</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 group hover:bg-gray-50 p-2 rounded-lg transition-colors duration-200">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-blue-200 transition-colors duration-200">
                <span className="text-blue-600 text-sm font-medium">3</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Start Selling</h4>
                <p className="text-gray-600 text-sm">Once approved, you can immediately start adding products and services</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card className="hover:shadow-md transition-shadow duration-200">
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600">
              If you have any questions about your application or need to provide additional information, 
              please don't hesitate to contact our support team.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" className="flex-1 hover:bg-gray-50 transition-colors duration-200">
                Contact Support
              </Button>
              <Button variant="outline" className="flex-1 hover:bg-gray-50 transition-colors duration-200">
                Update Application
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Verification Reminder */}
      {email && (
        <Card className="border-orange-200 bg-orange-50 hover:shadow-md transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="text-orange-800 text-lg">Email Verification</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start space-x-3">
              <Mail className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-orange-700">
                  Make sure your email address <strong>{email}</strong> is verified and active. 
                  All approval notifications will be sent to this email.
                </p>
                <Button variant="outline" size="sm" className="mt-3 hover:bg-orange-100 transition-colors duration-200">
                  Verify Email
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
