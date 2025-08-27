import { GuestRoute } from '@/components/auth/ProtectedRoute';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GuestRoute>
      {children}
    </GuestRoute>
  );
} 