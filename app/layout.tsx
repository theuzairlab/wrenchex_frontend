import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { AuthModalProvider } from '@/components/auth/AuthModalProvider';
import { CriticalErrorBoundary } from '@/components/error/ErrorBoundary';
import { LocationProvider } from '@/lib/contexts/LocationContext';
import { Toaster } from 'sonner';
import { GoogleOAuthProvider } from '@react-oauth/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'WrenchEX - Automotive Parts & Services Marketplace',
    template: '%s | WrenchEX',
  },
  description: 'Find the best automotive parts and professional services in your area. Connect with verified sellers and mechanics.',
  keywords: ['automotive', 'auto parts', 'car repair', 'mechanic', 'marketplace'],
  authors: [{ name: 'WrenchEX Team' }],
  creator: 'WrenchEX',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'WrenchEX - Automotive Parts & Services Marketplace',
    description: 'Find the best automotive parts and professional services in your area.',
    siteName: 'WrenchEX',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WrenchEX - Automotive Parts & Services Marketplace',
    description: 'Find the best automotive parts and professional services in your area.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  return (
    <html lang="en" className="scroll-smooth" data-scroll-behavior="smooth">
      <body className={inter.className}>
        <CriticalErrorBoundary>
          <GoogleOAuthProvider clientId={googleClientId || ''}>
            <AuthProvider>
              <LocationProvider requestOnMount={true}>
                <AuthModalProvider>
                  <main>
                    {children}
                  </main>
                  <Toaster />
                </AuthModalProvider>
              </LocationProvider>
            </AuthProvider>
          </GoogleOAuthProvider>
        </CriticalErrorBoundary>
      </body>
    </html>
  );
}
