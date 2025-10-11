import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { headers } from 'next/headers';
import { apiClient } from '@/lib/api/client';
import ProductDetailView from '@/components/products/ProductDetailView';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
  locale?: 'en' | 'ar';
}

// Helper function to detect locale from the request URL using headers
async function detectLocaleFromUrl(): Promise<'en' | 'ar'> {
  try {
    const headersList = await headers();
    
    // Get the actual request URL
    const url = headersList.get('x-url') || 
                headersList.get('referer') || 
                headersList.get('x-forwarded-url') ||
                '';
    
    console.log('[detectLocale] URL:', url);
    
    // Parse the URL and check the path
    if (url) {
      // Check if URL contains /ar/
      if (url.includes('/ar/')) {
        console.log('[detectLocale] Detected Arabic from URL');
        return 'ar';
      }
      // Check if URL contains /en/
      if (url.includes('/en/')) {
        console.log('[detectLocale] Detected English from URL');
        return 'en';
      }
    }
    
    // Fallback: check all headers for any clue
    const allHeaders: Record<string, string> = {};
    headersList.forEach((value, key) => {
      allHeaders[key] = value;
      if (value.includes('/ar/')) {
        console.log(`[detectLocale] Found /ar/ in header ${key}:`, value);
      }
    });
    
    // Check if any header contains /ar/
    for (const [key, value] of Object.entries(allHeaders)) {
      if (value.includes('/ar/')) {
        console.log('[detectLocale] Detected Arabic from header:', key);
        return 'ar';
      }
    }
    
    // Default to English
    console.log('[detectLocale] Defaulting to English');
    return 'en';
  } catch (error) {
    console.error('[detectLocale] Error:', error);
    return 'en';
  }
}

// This function generates metadata for SEO
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  try {
    const { id } = await params;
    const locale = await detectLocaleFromUrl();
    
    // Direct server-side API call without auth (for public product data)
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}?lang=${locale}`, {
      cache: 'no-store', // Disable caching to ensure fresh localized content
      headers: {
        'Accept-Language': locale,
      },
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
        'product:price:currency': product.currency || 'AED',
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
async function getProductData(productId: string, locale: 'en' | 'ar') {
  try {
    // Direct server-side API calls without auth (for public product data)
    const [productResponse, relatedResponse] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${productId}?lang=${locale}`, {
        cache: 'no-store', // Disable caching to ensure fresh localized content
        headers: {
          'Accept-Language': locale,
        },
      }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${productId}/related?limit=4&lang=${locale}`, {
        cache: 'no-store', // Disable caching to ensure fresh localized content
        headers: {
          'Accept-Language': locale,
        },
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

export default async function ProductPage({ params, locale: propLocale }: ProductPageProps) {
  const { id } = await params;
  // Use prop locale if provided, otherwise detect from URL
  const locale = propLocale || await detectLocaleFromUrl();
  console.log('[ProductPage] Using locale:', locale, '(from prop:', propLocale, ')');
  const { product } = await getProductData(id, locale);

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
      priceCurrency: product.currency || 'AED',
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
      // Handle both direct array and wrapped response formats
      const productsData = Array.isArray(featuredResponse.data) ? featuredResponse.data : (featuredResponse.data as any).products;
      if (productsData && Array.isArray(productsData)) {
        return productsData.map((product) => ({
          id: product.id,
        }));
      }
    }
    
    return [];
  } catch (error) {
    console.error('Error generating static params for products:', error);
    return [];
  }
}

// This ensures the page uses SSR by default but can fall back to SSG for performance
export const dynamic = 'force-dynamic';