'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  TrendingUp,
  Package,
  AlertCircle,
  CheckCircle,
  BarChart3,
  Download,
  Upload,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { cn, formatPrice } from '@/lib/utils';
import { ProductSearchResult, Product, Category, UpdateProductData } from '@/types';
import { apiClient } from '@/lib/api/client';
import { useTranslations } from 'next-intl';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface SellerProductDashboardProps {
  products: ProductSearchResult | null;
  categories: Category[];
  currentFilters: Record<string, string | undefined>;
  onProductsUpdate: (products: ProductSearchResult | null) => void;
}

interface ProductStatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
}

const ProductStatsCard = ({ title, value, change, changeType, icon }: ProductStatsCardProps) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={cn(
              "text-sm flex items-center mt-1",
              changeType === 'positive' && "text-green-600",
              changeType === 'negative' && "text-red-600",
              changeType === 'neutral' && "text-gray-500"
            )}>
              <TrendingUp className="h-3 w-3 mr-1" />
              {change}
            </p>
          )}
        </div>
        <div className="p-3 bg-wrench-accent/10 rounded-lg">
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

interface ProductTableRowProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onToggleStatus: (product: Product) => void;
}

const ProductTableRow = ({ product, onEdit, onDelete, onToggleStatus }: ProductTableRowProps) => {
  const primaryImage = product.images?.[0] || product.productImages?.[0]?.url;
  const pathname = usePathname();
  const currentLocale = pathname?.split('/').filter(Boolean)[0] === 'ar' ? 'ar' : 'en';
  const t = useTranslations('sellerProductDashboard');
  const dropdownItems = [
    {
      id: 'view',
      label: t('viewProduct'),
      icon: <Eye className="h-4 w-4" />,
      onClick: () => window.open(`/${currentLocale}/products/${product.id}`, '_blank'),
    },
    {
      id: 'edit',
      label: t('editProduct'),
      icon: <Edit className="h-4 w-4" />,
      onClick: () => onEdit(product),
    },
    {
      id: 'toggle',
      label: product.isActive ? t('deactivate') : t('activate'),
      icon: product.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />,
      onClick: () => onToggleStatus(product),
    },
    {
      id: 'separator',
      label: '',
      separator: true,
    },
    {
      id: 'delete',
      label: t('deleteProduct'),
      icon: <Trash2 className="h-4 w-4" />,
      onClick: () => onDelete(product),
      danger: true,
    },
  ];

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50">
      <td className="px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
            {primaryImage ? (
              <Image
                src={primaryImage}
                alt={product.title}
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="h-6 w-6 text-gray-400" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">
              {product.title}
            </p>
            <p className="text-sm text-gray-500 truncate">
              SKU: {product.sku || product.id}
            </p>
          </div>
        </div>
      </td>
      
      <td className="px-6 py-4 text-sm text-gray-900">
        {product.category.name}
      </td>
      
      <td className="px-6 py-4 text-sm font-medium text-gray-900">
        {formatPrice(product.price, product.currency || 'AED')}
      </td>
      
      <td className="px-6 py-4 text-sm text-gray-900">
        <span className={cn(
          "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
          product.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
        )}>
          {product.isActive ? (
            <>
              <CheckCircle className="h-3 w-3 mr-1" />
              Active
            </>
          ) : (
            <>
              <AlertCircle className="h-3 w-3 mr-1" />
              Inactive
            </>
          )}
        </span>
      </td>
      
      <td className="px-6 py-4 text-sm text-gray-500">
        {new Date(product.createdAt).toLocaleDateString()}
      </td>
      
      <td className="px-6 py-4 text-right text-sm font-medium">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {dropdownItems.map((item) => (
              <DropdownMenuItem key={item.id} onClick={item.onClick}>
                {item.icon}
                {item.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
};

const SellerProductDashboard = ({ products, categories, currentFilters, onProductsUpdate }: SellerProductDashboardProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = pathname?.split('/').filter(Boolean)[0] === 'ar' ? 'ar' : 'en';
  const t = useTranslations('sellerProductDashboard');
  const [searchQuery, setSearchQuery] = useState(currentFilters.search || '');
  const [selectedCategory, setSelectedCategory] = useState(currentFilters.category || '');
  const [selectedStatus, setSelectedStatus] = useState(currentFilters.status || '');
  const [updatedProducts, setUpdatedProducts] = useState<Product[]>([]);

  // Calculate stats from products data
  const stats = products && products.products ? {
    totalProducts: products.pagination.total,
    activeProducts: products.products.filter(p => p.isActive).length,
    averagePrice: products.products.length > 0 
      ? Math.round(products.products.reduce((sum, p) => sum + p.price, 0) / products.products.length)
      : 0,
  } : {
    totalProducts: 0,
    activeProducts: 0,
    averagePrice: 0,
  };

  // Handle search and filters
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedStatus) params.set('status', selectedStatus);
    
    router.push(`/${currentLocale}/seller/products?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedStatus('');
    router.push(`/${currentLocale}/seller/products`);
  };

  // Product actions
  const handleEditProduct = (product: Product) => {
    router.push(`/${currentLocale}/seller/products/update/${product.id}`);
  };

  const handleDeleteProduct = async (product: Product) => {
    if (confirm(`⚠️ WARNING: This action cannot be undone!\n\nAre you sure you want to PERMANENTLY DELETE "${product.title}" from the database?\n\nThis will remove the product completely and cannot be recovered.`)) {
      try {
        const response = await apiClient.deleteProduct(product.id);
        if (response.success) {
          // Update local state to remove the deleted product
          if (products) {
            const updatedProducts = {
              ...products,
              products: products.products.filter(p => p.id !== product.id),
              pagination: {
                ...products.pagination,
                total: products.pagination.total - 1
              }
            };
            onProductsUpdate(updatedProducts);
          }
          
          toast.success(t('productPermanentlyDeleted'), {
            description: `"${product.title}" has been completely removed from the database`
          });
        } else {
          toast.error(t('deleteProductFailed'), {
            description: response.error?.message || t('unknownErrorOccurred')
          });
        }
      } catch (error: any) {
        toast.error(t('deleteProductFailed'), {
          description: error.message || t('unexpectedErrorOccurred')
        });
      }
    }
  };

// In your product list or dashboard component
const handleToggleStatus = async (product: Product) => {
  try {
    const response = await apiClient.toggleProductStatus(product.id);
    
    if (response.success) {
      // Update local state to reflect the status change
      if (products) {
        const updatedProducts = {
          ...products,
          products: products.products?.map(p => 
            p.id === product.id 
              ? { ...p, isActive: !p.isActive } 
              : p
          ) || []
        };
        onProductsUpdate(updatedProducts);
      }

      // Show success toast
      toast.success(t('productStatusUpdated'), {
        description: response.data?.message || `"${product.title}" is now ${!product.isActive ? 'active' : 'inactive'}`
      });
    } else {
      // Handle API error
      toast.error(t('updateProductStatusFailed'), {
        description: response.error?.message || t('unknownErrorOccurred')
      });
    }
  } catch (error: any) {
    // Handle unexpected errors
    toast.error(t('updateFailed'), {
      description: error.message || t('unexpectedErrorOccurred')
    });
  }
};

  const handleBulkAction = (action: string, selectedProducts: string[]) => {
    // Implement bulk actions
    console.log('Bulk action:', action, selectedProducts);
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ProductStatsCard
          title={t('totalProducts')}
          value={stats.totalProducts}
          icon={<Package className="h-6 w-6 text-wrench-accent" />}
        />
        <ProductStatsCard
          title={t('activeProducts')}
          value={stats.activeProducts}
change={t('changeFromLastMonth')}
          changeType="positive"
          icon={<CheckCircle className="h-6 w-6 text-green-600" />}
        />
        <ProductStatsCard
          title={t('inactiveProducts')}
          value={stats.totalProducts - stats.activeProducts}
          icon={<AlertCircle className="h-6 w-6 text-red-600" />}
        />
        <ProductStatsCard
          title={t('averagePrice')}
          value={formatPrice(stats.averagePrice, 'AED')}
          icon={<BarChart3 className="h-6 w-6 text-blue-600" />}
        />
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>{t('searchFilterProducts')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('searchProducts')}</label>
              <Input
                type="text"
                placeholder={t('searchByNameSkuDesc')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('category')}</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wrench-accent focus:border-wrench-accent"
              >
                <option value="">{t('allCategories')}</option>
                {categories && Array.isArray(categories) && categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('status')}</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wrench-accent focus:border-wrench-accent"
              >
                <option value="">{t('allStatus')}</option>
                <option value="active">{t('active')}</option>
                <option value="inactive">{t('inactive')}</option>

              </select>
            </div>
            
            <div className="flex items-end space-x-2">
              <Button onClick={handleSearch} className="flex-1">
                <Search className="h-4 w-4 mr-2" />
                {t('search')}
              </Button>
              <Button variant="outline" onClick={clearFilters}>
                {t('clear')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{t('yourProducts')}</CardTitle>
              <CardDescription>
                {products ? t('productsFound', {count: products.pagination.total}) : t('loadingProducts')}
              </CardDescription>
            </div>
            <Link href={`/${currentLocale}/seller/products/add`}>
            <Button className="whitespace-nowrap">
              <Plus className="h-4 w-4 mr-2" />
{t('addNewProduct')}
            </Button>
          </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {products && products.products && products.products.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('product')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('category')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('price')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('status')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('created')}</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.products && Array.isArray(products.products) && products.products.map((product) => (
                    <ProductTableRow
                      key={product.id}
                      product={product}
                      onEdit={handleEditProduct}
                      onDelete={handleDeleteProduct}
                      onToggleStatus={handleToggleStatus}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          ) : products ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('noProductsFound')}</h3>
              <p className="text-gray-600 mb-6">
                {Object.values(currentFilters).some(Boolean) 
                  ? t('tryAdjustingFilters')
                  : t('startByAddingFirstProduct')
                }
              </p>
              <div className="flex justify-center space-x-3">
            <Link href={`/${currentLocale}/seller/products/add`}>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    {t('addYourFirstProduct')}
                  </Button>
                </Link>
                {Object.values(currentFilters).some(Boolean) && (
                  <Button variant="outline" onClick={clearFilters}>
                    {t('clearFilters')}
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="animate-spin h-8 w-8 border-2 border-wrench-accent border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">{t('loadingYourProducts')}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {products && products.pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {t('paginationSummary', {page: products.pagination.page, pages: products.pagination.pages, total: products.pagination.total})}
          </div>
          
          <div className="flex space-x-2">
            {products.pagination.page > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const params = new URLSearchParams(window.location.search);
                  params.set('page', (products.pagination.page - 1).toString());
                  router.push(`/seller/products?${params.toString()}`);
                }}
              >
                {t('previous')}
              </Button>
            )}
            
            {products.pagination.page < products.pagination.pages && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const params = new URLSearchParams(window.location.search);
                  params.set('page', (products.pagination.page + 1).toString());
                  router.push(`/seller/products?${params.toString()}`);
                }}
              >
                {t('next')}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerProductDashboard;