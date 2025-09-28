'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, User, Store, ArrowRight } from 'lucide-react';

interface AccountConflictDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginToExisting: () => void;
  onCancel: () => void;
  existingAccountRole: 'BUYER' | 'SELLER' | 'ADMIN';
  existingAccountEmail: string;
}

export function AccountConflictDialog({
  isOpen,
  onClose,
  onLoginToExisting,
  onCancel,
  existingAccountRole,
  existingAccountEmail
}: AccountConflictDialogProps) {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'SELLER':
        return <Store className="h-5 w-5 text-orange-600" />;
      case 'BUYER':
        return <User className="h-5 w-5 text-blue-600" />;
      default:
        return <User className="h-5 w-5 text-gray-600" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'SELLER':
        return 'Seller Account';
      case 'BUYER':
        return 'Buyer Account';
      case 'ADMIN':
        return 'Admin Account';
      default:
        return 'Account';
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'SELLER':
        return 'This account is set up for selling products and services';
      case 'BUYER':
        return 'This account is set up for purchasing products and services';
      case 'ADMIN':
        return 'This account has administrative privileges';
      default:
        return 'This account already exists in our system';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <DialogTitle>Account Already Exists</DialogTitle>
          </div>
          <DialogDescription>
            This Google account is already linked to another account in our system.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Existing Account Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              {getRoleIcon(existingAccountRole)}
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">
                  {getRoleLabel(existingAccountRole)}
                </h4>
                <p className="text-sm text-gray-600">
                  {existingAccountEmail}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {getRoleDescription(existingAccountRole)}
                </p>
              </div>
            </div>
          </div>

          {/* Explanation */}
          <div className="text-sm text-gray-600">
            <p>
              For security reasons, each Google account can only be linked to one account in our system. 
              You have the following options:
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={onLoginToExisting}
              className="w-full justify-start"
              variant="primary"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Log into the existing {getRoleLabel(existingAccountRole).toLowerCase()}
            </Button>

            <Button
              onClick={onCancel}
              className="w-full justify-start"
              variant="outline"
            >
              Cancel and keep accounts separate
            </Button>
          </div>

          {/* Security Note */}
          <div className="text-xs text-gray-500 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p>
              <strong>Security Note:</strong> This prevents unauthorized access to your accounts. 
              If you need to use a different Google account, please log out and try again with a different Google account.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
