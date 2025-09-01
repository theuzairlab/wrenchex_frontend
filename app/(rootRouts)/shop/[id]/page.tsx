import { Metadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Seller, Product, Service } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { SellerProfileCard } from '@/components/seller/SellerProfileCard';
import ProductCard from '@/components/products/ProductCard';
import ServiceCard from '@/components/services/ServiceCard';

interface SellerPageProps {
  params: Promise<{ id: string }>;
}

async function getSellerData(sellerId: string) {
  try {
    const [sellerResponse, productsResponse, servicesResponse] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/sellers/${sellerId}`, {
        cache: 'no-store',
      }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?sellerId=${sellerId}&isActive=true&limit=50`, {
        cache: 'no-store',
      }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/services?sellerId=${sellerId}&isActive=true&limit=50`, {
        cache: 'no-store',
      }),
    ]);

    const sellerData = sellerResponse.ok ? await sellerResponse.json() : { success: false };
    const productsData = productsResponse.ok ? await productsResponse.json() : { success: false };
    const servicesData = servicesResponse.ok ? await servicesResponse.json() : { success: false };

    if (!sellerData.success) {
      return null;
    }

    return {
      seller: sellerData.data,
      products: productsData.success ? productsData.data.products || [] : [],
      services: servicesData.success ? servicesData.data.services || [] : [],
    };
  } catch (error) {
    console.error('Error fetching seller data:', error);
    return null;
  }
}

export async function generateMetadata({ params }: SellerPageProps): Promise<Metadata> {
  const { id } = await params;
  const data = await getSellerData(id);
  
  if (!data) {
    return {
      title: 'Seller Not Found | WrenchEX',
    };
  }

  const { seller } = data;
  
  return {
    title: `${seller.shopName} - Auto Parts & Services | WrenchEX`,
    description: `Browse ${seller.shopName}'s auto parts and services. ${seller.description || 'Professional automotive services and parts.'}`,
    keywords: `auto parts, car services, ${seller.shopName}, automotive, mechanic, ${seller.city}`,
    openGraph: {
      title: `${seller.shopName} - Auto Parts & Services`,
      description: seller.description || 'Professional automotive services and parts.',
      type: 'website',
      url: `https://wrenchex.com/shop/${id}`,
    },
  };
}

export default async function SellerPage({ params }: SellerPageProps) {
  const { id } = await params;
  const data = await getSellerData(id);

  if (!data) {
    notFound();
  }

  const { seller, products, services } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Seller Profile Header */}
        <div className="mb-8">
          <Suspense fallback={<LoadingSpinner />}>
            <SellerProfileCard seller={seller} showActions={false} />
          </Suspense>
        </div>

        {/* Content Tabs */}
        <div className="bg-white rounded-lg border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <div className="flex items-center space-x-2 py-4 border-b-2 border-wrench-accent">
                <span className="text-wrench-accent font-medium">Products</span>
                <span className="bg-wrench-accent text-black text-xs px-2 py-1 rounded-full">
                  {products.length}
                </span>
              </div>
              <div className="flex items-center space-x-2 py-4 border-b-2 border-transparent text-gray-500 hover:text-gray-700">
                <span>Services</span>
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                  {services.length}
                </span>
              </div>
            </nav>
          </div>

          {/* Products Section */}
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Products ({products.length})
              </h2>
              <p className="text-gray-600">
                Browse {seller.shopName}'s available auto parts and accessories
              </p>
            </div>

            {products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product: Product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products available</h3>
                <p className="text-gray-500">This seller hasn't added any products yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Services Section */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Services ({services.length})
              </h2>
              <p className="text-gray-600">
                Professional automotive services offered by {seller.shopName}
              </p>
            </div>

            {services.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service: Service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No services available</h3>
                <p className="text-gray-500">This seller hasn't added any services yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
