import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { apiClient } from '@/lib/api/client';
import { Product } from '@/types';
import ProductDetailView from '@/components/products/ProductDetailView';
import RelatedProducts from '@/components/products/RelatedProducts';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

// This function generates metadata for SEO
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  try {
    const { id } = await params;
    
    // Direct server-side API call without auth (for public product data)
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`, {
      cache: 'force-cache',
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      return {
        title: 'Product Not Found | WrenchEX',
        description: 'The requested product could not be found.',
      };
    }

    const data = await response.json();
    if (!data.success || !data.data) {
      return {
        title: 'Product Not Found | WrenchEX',
        description: 'The requested product could not be found.',
      };
    }

    const product = data.data.product; // Extract the actual product from the wrapper
    const primaryImage = product.images?.[0] || product.productImages?.[0]?.url || '/placeholder-product.jpg';
    
    // Generate rich metadata for SEO
    return {
      title: `${product.title} | ${product.brand || 'Auto Parts'} | WrenchEX`,
      description: product.description && product.description.length > 160 
        ? `${product.description.substring(0, 157)}...`
        : (product.description || 'Auto part available on WrenchEX'),
      keywords: [
        product.title,
        product.brand,
        product.category?.name,
        'auto parts',
        'car parts',
        product.condition?.toLowerCase(),
        ...product.tags || [],
      ].filter(Boolean).join(', '),
      
      openGraph: {
        title: `${product.title} | WrenchEX`,
        description: product.description,
        type: 'website',
        url: `https://wrenchex.com/products/${product.id}`,
        images: [
          {
            url: primaryImage,
            width: 800,
            height: 600,
            alt: product.title,
          },
        ],
        siteName: 'WrenchEX',
      },
      
      twitter: {
        card: 'summary_large_image',
        title: `${product.title} | WrenchEX`,
        description: product.description,
        images: [primaryImage],
      },
      
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
      
      // Additional product-specific metadata
      other: {
        'product:price:amount': product.price?.toString() || '0',
        'product:price:currency': 'AED',
        'product:availability': product.isActive ? 'in stock' : 'out of stock',
        'product:condition': product.condition || 'new',
        'product:brand': product.brand || '',
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Product | WrenchEX',
      description: 'Browse auto parts and accessories on WrenchEX marketplace.',
    };
  }
}

// Server-side data fetching for SSR
async function getProductData(productId: string) {
  try {
    // Direct server-side API calls without auth (for public product data)
    const [productResponse, relatedResponse] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${productId}`, {
        cache: 'force-cache',
        next: { revalidate: 3600 },
      }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${productId}/related?limit=4`, {
        cache: 'force-cache',
        next: { revalidate: 3600 },
      }).catch(() => null),
    ]);

    if (!productResponse.ok) {
      return { product: null, relatedProducts: [], error: { message: 'Product not found' } };
    }

    const productData = await productResponse.json();
    if (!productData.success) {
      return { product: null, relatedProducts: [], error: productData.error };
    }

    let relatedProducts = [];
    if (relatedResponse && relatedResponse.ok) {
      const relatedData = await relatedResponse.json();
      if (relatedData.success) {
        relatedProducts = relatedData.data || [];
      }
    }

    return {
      product: productData.data.product, // Extract the actual product from the wrapper
      relatedProducts,
      error: null,
    };
  } catch (error) {
    console.error('Error fetching product data:', error);
    return {
      product: null,
      relatedProducts: [],
      error: { message: 'Failed to load product data' },
    };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const { product, relatedProducts, error } = await getProductData(id);

  // Show 404 if product not found
  if (!product) {
    notFound();
  }

  // Generate structured data for rich snippets
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `https://wrenchex.com/products/${product.id}`,
    name: product.title,
    description: product.description,
    image: product.images || product.productImages?.map((img: any) => img.url) || ['/placeholder-product.jpg'],
    brand: {
      '@type': 'Brand',
      name: product.brand || 'Generic',
    },
    category: product.category?.name || 'Auto Parts',
    sku: product.sku || product.id,
    offers: {
      '@type': 'Offer',
      url: `https://wrenchex.com/products/${product.id}`,
      priceCurrency: 'AED',
      price: product.price,
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      availability: product.isActive 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: product.seller?.shopName || 'Auto Parts Seller',
        ...(product?.seller?.isApproved && {
          certification: 'Verified Seller',
        }),
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 30,
      },
    },
    
    // Add rating/review data if available
    ...(product.ratingAverage && product.ratingCount > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.ratingAverage,
        reviewCount: product.ratingCount,
        bestRating: 5,
        worstRating: 1,
      },
    }),

    // Product specifications
    ...(product.specifications && {
      additionalProperty: Object.entries(product.specifications).map(([name, value]) => ({
        '@type': 'PropertyValue',
        name,
        value: String(value),
      })),
    }),

    // Enhanced product specifications
    ...(product.productSpecs && {
      additionalProperty: product.productSpecs.map((spec: any) => ({
        '@type': 'PropertyValue',
        name: spec.name,
        value: spec.value,
        ...(spec.unit && { unitText: spec.unit }),
      })),
    }),

    // Product condition
    ...(product.condition && {
      itemCondition: `https://schema.org/${product.condition === 'NEW' ? 'NewCondition' : 
                                      product.condition === 'USED' ? 'UsedCondition' : 
                                      'RefurbishedCondition'}`,
    }),

    // Weight and dimensions
    ...(product.weight && {
      weight: {
        '@type': 'QuantitativeValue',
        value: product.weight,
        unitCode: 'KGM', // Kilograms
      },
    }),

    ...(product.dimensions && {
      width: {
        '@type': 'QuantitativeValue',
        value: product.dimensions.width,
        unitCode: 'CMT', // Centimeters
      },
      height: {
        '@type': 'QuantitativeValue',
        value: product.dimensions.height,
        unitCode: 'CMT',
      },
      depth: {
        '@type': 'QuantitativeValue',
        value: product.dimensions.length,
        unitCode: 'CMT',
      },
    }),

    // Warranty information
    ...(product.warranty && {
      warranty: {
        '@type': 'WarrantyPromise',
        durationOfWarranty: {
          '@type': 'QuantitativeValue',
          value: product.warranty,
        },
      },
    }),

    // Breadcrumb navigation
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://wrenchex.com',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Products',
          item: 'https://wrenchex.com/products',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: product.category?.name || 'Auto Parts',
          item: `https://wrenchex.com/products?category=${product.category?.id || ''}`,
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: product.title,
          item: `https://wrenchex.com/products/${product.id}`,
        },
      ],
    },
  };

  return (
    <>
      {/* Inject structured data for rich snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="min-h-screen bg-wrench-bg-primary">
        {/* Product Detail */}
        <Suspense fallback={<LoadingSpinner size="lg" text="Loading product details..." />}>
          <ProductDetailView product={product} />
        </Suspense>

        {/* Related Products */}
        {/* {relatedProducts.length > 0 && (
          <div className="container-responsive py-12 border-t border-gray-200">
            <Suspense fallback={<LoadingSpinner size="md" text="Loading related products..." />}>
              <RelatedProducts 
                products={relatedProducts} 
                currentProductId={product.id}
                categoryName={product.category?.name || 'Auto Parts'}
              />
            </Suspense>
          </div>
        )} */}
      </div>
    </>
  );
}

// Generate static params for popular products (for better performance)
export async function generateStaticParams() {
  try {
    // Get featured products and some popular categories for static generation
    const featuredResponse = await apiClient.getFeaturedProducts(20);
    
    if (featuredResponse.success && featuredResponse.data) {
      return featuredResponse.data.map((product) => ({
        id: product.id,
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error generating static params for products:', error);
    return [];
  }
}

// This ensures the page uses SSR by default but can fall back to SSG for performance
export const dynamic = 'force-dynamic';