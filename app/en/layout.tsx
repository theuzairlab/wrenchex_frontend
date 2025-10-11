import { Footer } from '@/components/navigation/Footer';
import Navbar from '@/components/navigation/Navbar';

export default function EnRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
        {children}
    </div>
  );
}