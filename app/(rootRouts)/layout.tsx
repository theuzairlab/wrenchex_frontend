// app/(root)/layout.tsx
import { Footer } from '@/components/navigation/Footer';
import Navbar from '@/components/navigation/Navbar';
import '@/app/globals.css';

export default function RootRoutesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Global Navigation */}
      <Navbar />

      {/* Main Content Area */}
      <div className="mt-[-85px]">
        {children}
      </div>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}