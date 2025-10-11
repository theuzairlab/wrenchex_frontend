import ProductPage from '@/app/(rootRouts)/products/[id]/page';
import { Metadata } from 'next';

// English product page wrapper that explicitly passes locale
export default async function EnglishProductPage(props: any) {
  return <ProductPage {...props} locale="en" />;
}

// Wrapper for generateMetadata that ensures proper typing
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  // Import the original generateMetadata function dynamically to avoid circular imports
  const { generateMetadata: originalGenerateMetadata } = await import('@/app/(rootRouts)/products/[id]/page');
  return originalGenerateMetadata({ params });
}