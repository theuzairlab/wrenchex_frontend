'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { apiClient } from '@/lib/api/client';
import { toast } from 'sonner';

export default function ResetPasswordPage() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get('token') || '';
  const email = params.get('email') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => password.length >= 8 && password === confirm && !!token && !!email, [password, confirm, token, email]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    try {
      await apiClient.resetPassword({ email, token, password });
      toast.success('Password has been reset. You can log in now.');
      router.push('/');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={submit} className="w-full max-w-md space-y-4 bg-white p-6 rounded-xl shadow">
        <h1 className="text-xl font-semibold">Reset password</h1>
        <p className="text-sm text-gray-600 break-all">Reset for: {email}</p>
        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password" required />
        <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm new password" required />
        <Button type="submit" disabled={loading || !canSubmit} className="w-full">{loading ? 'Resetting...' : 'Reset password'}</Button>
      </form>
    </div>
  );
}


