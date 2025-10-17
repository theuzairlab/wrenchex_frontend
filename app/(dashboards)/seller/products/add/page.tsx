// app/(dashboards)/seller/products/add/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/stores/auth';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ArrowLeftIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiClient } from '@/lib/api/client';
import { Category } from '@/types';
import { useTranslations } from 'next-intl';
import CurrencySelector from '@/components/ui/CurrencySelector';
import { CurrencyService, CurrencyInfo } from '@/lib/services/currencyService';

export default function AddProductPage() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = pathname?.split('/').filter(Boolean)[0] === 'ar' ? 'ar' : 'en';
  const t = useTranslations('sellerProductsAdd');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    price: '',
    currency: 'AED',
    language: currentLocale as 'en' | 'ar',
    specifications: {
      material: '',
      compatibility: '',
      warranty: '',
      brand: '',
      condition: '',
      model: ''
    },
    images: [] as string[]
  });
  
  // Dynamic specifications state
  const [dynamicSpecs, setDynamicSpecs] = useState<Array<{key: string, value: string}>>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyInfo | null>(null);
  const { token } = useAuthStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [rootCategories, setRootCategories] = useState<Category[]>([]);
  const [childCategories, setChildCategories] = useState<Category[]>([]);
  const [selectedRootCategory, setSelectedRootCategory] = useState<string>('');
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiClient.getCategories();
        if (response.success && response.data) {
          // Handle both direct array and wrapped response formats
          const categoriesData = Array.isArray(response.data) ? response.data : (response.data as any).categories;
          setCategories(categoriesData || []);
          
          // Separate root categories (no parent) from child categories
          const roots = categoriesData.filter((cat: Category) => !cat.parentId);
          const children = categoriesData.filter((cat: Category) => cat.parentId);
          
          setRootCategories(roots);
          setChildCategories(children);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        toast.error(t('loadCategoriesFailed'));
        setCategories([]);
        setRootCategories([]);
        setChildCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // Initialize root category selection when form data changes
  useEffect(() => {
    if (formData.categoryId && !selectedRootCategory) {
      // Check if the selected category is a root category
      const rootCategory = rootCategories.find(cat => cat.id === formData.categoryId);
      if (rootCategory) {
        setSelectedRootCategory(formData.categoryId);
      } else {
        // Check if it's a child category and set its parent as root
        const childCategory = childCategories.find(cat => cat.id === formData.categoryId);
        if (childCategory) {
          setSelectedRootCategory(childCategory.parentId || '');
        }
      }
    }
  }, [formData.categoryId, rootCategories, childCategories, selectedRootCategory]);

  // Detect currency from seller's location
  useEffect(() => {
    const detectCurrency = async () => {
      try {
        // Get seller's location from auth store or API
        const sellerInfo = await apiClient.getSellerProfile();
        if (sellerInfo.success && sellerInfo.data) {
          const seller = sellerInfo.data;
          const currency = await CurrencyService.detectCurrencyFromSellerLocation({
            city: seller.city,
            area: seller.area,
            country: seller.country
          });
          
          if (currency) {
            setSelectedCurrency(currency);
            setFormData(prev => ({
              ...prev,
              currency: currency.code
            }));
          }
        }
      } catch (error) {
        console.error('Failed to detect currency:', error);
        // Set default currency
        const defaultCurrency = {
          code: 'AED',
          symbol: 'د.إ',
          name: 'UAE Dirham'
        };
        setSelectedCurrency(defaultCurrency);
      }
    };

    detectCurrency();
  }, []);



  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Handle nested specifications
    if (name.startsWith('specifications.')) {
      const specKey = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [specKey]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle dynamic specification changes
  const handleDynamicSpecChange = (index: number, field: 'key' | 'value', value: string) => {
    setDynamicSpecs(prev => prev.map((spec, i) => 
      i === index ? { ...spec, [field]: value } : spec
    ));
  };

  // Add new dynamic specification
  const addDynamicSpec = () => {
    setDynamicSpecs(prev => [...prev, { key: '', value: '' }]);
  };

  // Remove dynamic specification
  const removeDynamicSpec = (index: number) => {
    setDynamicSpecs(prev => prev.filter((_, i) => i !== index));
  };

  // Handle currency change
  const handleCurrencyChange = (currency: CurrencyInfo) => {
    setSelectedCurrency(currency);
    setFormData(prev => ({
      ...prev,
      currency: currency.code
    }));
  };

  // Handle root category change
  const handleRootCategoryChange = (rootCategoryId: string) => {
    setSelectedRootCategory(rootCategoryId);
    // Reset child category selection when root changes
    setFormData(prev => ({
      ...prev,
      categoryId: rootCategoryId
    }));
  };

  // Handle child category change
  const handleChildCategoryChange = (childCategoryId: string) => {
    setFormData(prev => ({
      ...prev,
      categoryId: childCategoryId
    }));
  };

  // Update the image upload handler in the component
  // Image upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setIsUploadingImages(true);
      try {
        // Convert files to base64
        const filePromises = Array.from(files).map(async (file) => {
          return new Promise<{ file: string; fileName: string }>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              resolve({
                file: reader.result as string,
                fileName: file.name
              });
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        });

        const processedFiles = await Promise.all(filePromises);

        // Prepare payload
        const payload = {
          files: processedFiles,
          folder: "wrenchex/products",
          tags: ["product", "wrenchex"]
        };

        // Upload images
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/images`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          // Try to get more detailed error information
          const errorText = await response.text();
          console.error('Upload Error Response:', errorText);
          throw new Error(errorText || t('imageUploadFailed'));
        }

        const result = await response.json();
        const uploadedUrls = result.data.images.map((image: any) => image.url);

        // Update form state with uploaded image URLs
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...uploadedUrls]
        }));
      } catch (error) {
        console.error('Full upload error:', error);
        toast.error(t('imageUploadFailed'), {
          description: error instanceof Error ? error.message : t('couldNotUploadImages')
        });
      } finally {
        setIsUploadingImages(false);
      }
    }
  };

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate category selection
      if (!formData.categoryId) {
        toast.error('Please select a category');
        setIsSubmitting(false);
        return;
      }

      // Merge fixed and dynamic specifications
      const mergedSpecifications: Record<string, string> = { ...formData.specifications };
      
      // Add dynamic specifications (only if both key and value are provided)
      dynamicSpecs.forEach(spec => {
        if (spec.key.trim() && spec.value.trim()) {
          mergedSpecifications[spec.key.trim()] = spec.value.trim();
        }
      });

      // Prepare product data
      const productData = {
        ...formData,
        specifications: mergedSpecifications,
        price: Number(formData.price),
        currency: formData.currency
      };

      // Submit to API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Product creation error:', errorData);
        throw new Error(errorData.error?.message || errorData.message || t('createProductFailed'));
      }

      // Success
      toast.success(t('productCreated'), {
        description: t('productSuccessfullyAdded')
      });

      // Redirect to products page
      router.push(`/${currentLocale}/seller/products`);
    } catch (error) {
      toast.error(t('productCreationFailed'), {
        description: error instanceof Error ? error.message : t('unknownErrorOccurred')
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <Link href={`/${currentLocale}/seller/products`}>
        <Button variant="outline" className="mb-4">
          <ArrowLeftIcon className="w-4 h-4" />
          {t('backToProducts')}
        </Button>
      </Link>
      <h1 className="text-2xl font-bold mb-6">{t('addNewProduct')}</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Product Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="title" className="block mb-2">{t('productTitle')}</label>
            <Input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder={t('enterProductName')}
              className="w-full px-3 py-2 border rounded-lg"
              dir={formData.language === 'ar' ? 'rtl' : 'ltr'}
              required
            />
          </div>

          <div>
            <label htmlFor="rootCategory" className="block mb-2">Main Category</label>
            <Select value={selectedRootCategory} onValueChange={handleRootCategoryChange}>
              <SelectTrigger className="w-full px-3 py-5 border rounded-lg border-wrench-accent focus:border-wrench-accent focus:ring-wrench-accent focus:ring-1 outline-none">
                <SelectValue placeholder="Select main category" />
              </SelectTrigger>
              <SelectContent>
                {rootCategories && Array.isArray(rootCategories) && rootCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id} className="py-2 px-3 rounded-lg">
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Child Category - Only show if root category has children */}
          {selectedRootCategory && childCategories.some(child => child.parentId === selectedRootCategory) && (
            <div>
              <label htmlFor="childCategory" className="block mb-2">Sub Category</label>
              <Select value={formData.categoryId} onValueChange={handleChildCategoryChange}>
                <SelectTrigger className="w-full px-3 py-5 border rounded-lg border-wrench-accent focus:border-wrench-accent focus:ring-wrench-accent focus:ring-1 outline-none">
                  <SelectValue placeholder="Select sub category (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {childCategories
                    .filter(child => child.parentId === selectedRootCategory)
                    .map((category) => (
                      <SelectItem key={category.id} value={category.id} className="py-2 px-3 rounded-lg">
                        {category.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                Choose a sub category for more specific classification
              </p>
            </div>
          )}

          <div>
            <label htmlFor="language" className="block mb-2">{t('originalLanguage')}</label>
            <Select value={formData.language} onValueChange={(value: 'en' | 'ar') => setFormData({ ...formData, language: value })}>
              <SelectTrigger className="w-full px-3 py-5 border rounded-lg border-wrench-accent focus:border-wrench-accent focus:ring-wrench-accent focus:ring-1 outline-none">
                <SelectValue placeholder={t('selectLanguage')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en" className="py-2 px-3 rounded-lg">
                  🇺🇸 English
                </SelectItem>
                <SelectItem value="ar" className="py-2 px-3 rounded-lg">
                  🇸🇦 العربية
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">{t('languageHelpText')}</p>
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block mb-2">{t('productDescription')}</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder={t('provideDescription')}
            className="w-full px-3 py-2 border rounded-lg"
            dir={formData.language === 'ar' ? 'rtl' : 'ltr'}
            rows={4}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            {t('autoTranslationNote', { targetLang: formData.language === 'en' ? 'Arabic' : 'English' })}
          </p>
        </div>

        {/* Pricing and Inventory */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="price" className="block mb-2">{t('price')}</label>
            <Input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder={t('enterPrice')}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block mb-2">Currency</label>
            <CurrencySelector
              value={formData.currency}
              onChange={handleCurrencyChange}
              placeholder="Select currency"
              showSearch={true}
              showFlag={true}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Currency is automatically detected based on your location
            </p>
          </div>
        </div>

        {/* Specifications */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className='text-xl font-semibold'>Product Specifications</h2>
          </div>
          
          {/* Fixed Specifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="specifications.material" className="block mb-2">{t('material')}</label>
              <Input
                type="text"
                id="specifications.material"
                name="specifications.material"
                value={formData.specifications.material}
                onChange={handleChange}
                placeholder={t('materialPlaceholder')}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label htmlFor="specifications.compatibility" className="block mb-2">{t('vehicleCompatibility')}</label>
              <Input
                type="text"
                id="specifications.compatibility"
                name="specifications.compatibility"
                value={formData.specifications.compatibility}
                onChange={handleChange}
                placeholder={t('compatibilityPlaceholder')}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label htmlFor="specifications.brand" className="block mb-2">{t('brand')}</label>
              <Input
                type="text"
                id="specifications.brand"
                name="specifications.brand"
                value={formData.specifications.brand}
                onChange={handleChange}
                placeholder={t('brandPlaceholder')}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label htmlFor="specifications.model" className="block mb-2">Car Model</label>
              <Input
                type="text"
                id="specifications.model"
                name="specifications.model"
                value={formData.specifications.model}
                onChange={handleChange}
                placeholder="e.g., Camry, Civic, Accord, Corolla, Altima"
                className="w-full px-3 py-2 border rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Specify the car model(s) this part is compatible with
              </p>
            </div>
            <div>
              <label htmlFor="specifications.warranty" className="block mb-2">{t('warranty')}</label>
              <Input
                type="text"
                id="specifications.warranty"
                name="specifications.warranty"
                value={formData.specifications.warranty}
                onChange={handleChange}
                placeholder={t('warrantyPlaceholder')}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label htmlFor="specifications.condition" className="block mb-2">Product Condition</label>
              <Select 
                value={formData.specifications.condition} 
                onValueChange={(value) => setFormData(prev => ({
                  ...prev,
                  specifications: {
                    ...prev.specifications,
                    condition: value
                  }
                }))}
              >
                <SelectTrigger className="w-full px-3 py-2 border rounded-lg border-wrench-accent focus:border-wrench-accent focus:ring-wrench-accent focus:ring-1 outline-none">
                  <SelectValue placeholder="Select product condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new" className="py-2 px-3 rounded-lg">
                    🆕 New
                  </SelectItem>
                  <SelectItem value="like_new" className="py-2 px-3 rounded-lg">
                    ✨ Like New
                  </SelectItem>
                  <SelectItem value="good" className="py-2 px-3 rounded-lg">
                    ✅ Good
                  </SelectItem>
                  <SelectItem value="fair" className="py-2 px-3 rounded-lg">
                    ⚠️ Fair
                  </SelectItem>
                  <SelectItem value="poor" className="py-2 px-3 rounded-lg">
                    🔧 Poor
                  </SelectItem>
                  <SelectItem value="refurbished" className="py-2 px-3 rounded-lg">
                    🔄 Refurbished
                  </SelectItem>
                  <SelectItem value="used" className="py-2 px-3 rounded-lg">
                    📦 Used
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                Select the condition of your product to help buyers make informed decisions
              </p>
            </div>
          </div>

          {/* Dynamic Specifications */}

          <div className="flex items-center justify-between mb-4">
            <h2 className='text-xl font-semibold'>Additional Specifications</h2>
            <Button
              type="button"
              onClick={addDynamicSpec}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              Add Specification
            </Button>
          </div>

          {dynamicSpecs.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700"></h3>
              {dynamicSpecs.map((spec, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                  <div>
                    <label className="block mb-2 text-sm font-medium">Specification Name</label>
                    <Input
                      type="text"
                      value={spec.key}
                      onChange={(e) => handleDynamicSpecChange(index, 'key', e.target.value)}
                      placeholder="e.g., Weight, Dimensions, Color"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block mb-2 text-sm font-medium">Value</label>
                      <Input
                        type="text"
                        value={spec.value}
                        onChange={(e) => handleDynamicSpecChange(index, 'value', e.target.value)}
                        placeholder="Enter specification value"
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={() => removeDynamicSpec(index)}
                      variant="outline"
                      size="sm"
                      className="px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Image Upload */}
        <div>
          <label htmlFor="images" className="block mb-2">{t('productImages')}</label>
          <Input
            type="file"
            id="images"
            name="images"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            disabled={isUploadingImages}
            className="w-full px-3 py-2 border rounded-lg disabled:opacity-50"
          />
          
          {/* Upload Status */}
          {isUploadingImages && (
            <div className="mt-2 flex items-center gap-2 text-blue-600">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">{t('uploadingImages')}</span>
            </div>
          )}
          
          {/* Image Previews */}
          {formData.images.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">{formData.images.length} {t('imagesUploaded')}</p>
              <div className="flex flex-wrap gap-2">
                {formData.images.map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt={t('previewImage', { index: index + 1 })}
                      className="w-20 h-20 object-cover rounded border"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          images: prev.images.filter((_, i) => i !== index)
                        }));
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting || isUploadingImages}
          variant="primary"
          className="w-full bg-wrench-accent text-white py-2 rounded-lg hover:bg-wrench-accent/80 disabled:opacity-50"
        >
          {isSubmitting ? t('creatingProduct') : isUploadingImages ? t('uploadingImagesBtn') : t('addProduct')}
        </Button>
      </form>
    </div>
  );
}