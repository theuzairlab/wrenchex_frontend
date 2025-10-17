'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { apiClient } from '@/lib/api/client';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.forgotPassword(email);
      toast.success('If that email exists, a reset link has been sent.');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to request password reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={submit} className="w-full max-w-md space-y-4 bg-white p-6 rounded-xl shadow">
        <h1 className="text-xl font-semibold">Forgot password</h1>
        <p className="text-sm text-gray-600">Enter your email, we will send you a reset link.</p>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
        <Button type="submit" disabled={loading} className="w-full">{loading ? 'Sending...' : 'Send reset link'}</Button>
      </form>
    </div>
  );
}


