'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/stores/auth';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { FileUpload } from '@/components/ui/FileUpload';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import Link from 'next/link';
import { ArrowLeft, Save, Upload, Clock, MapPin } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiClient } from '@/lib/api/client';
import { Category } from '@/types';
import { useTranslations } from 'next-intl';
import { formatPrice } from '@/lib/utils';
import CurrencySelector from '@/components/ui/CurrencySelector';
import { CurrencyService, CurrencyInfo } from '@/lib/services/currencyService';

export default function AddServicePage() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = pathname?.split('/').filter(Boolean)[0] === 'ar' ? 'ar' : 'en';
  const t = useTranslations('sellerServicesAdd');
  const { token } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    price: '',
    currency: '',
    durationMinutes: '',
    isMobileService: false,
    language: currentLocale as 'en' | 'ar',
    images: [] as string[]
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyInfo | null>(null);

  useEffect(() => {
    fetchCategories();
    detectCurrencyFromSellerLocation();
  }, []);

  const detectCurrencyFromSellerLocation = async () => {
    try {
      const sellerProfile = await apiClient.getSellerProfile();
      if (sellerProfile.success && sellerProfile.data) {
        const seller = sellerProfile.data;
        const detectedCurrency = await CurrencyService.detectCurrencyFromSellerLocation({
          city: seller.city,
          area: seller.area,
          country: seller.country
        });
        
        if (detectedCurrency) {
          setSelectedCurrency(detectedCurrency);
          setFormData(prev => ({
            ...prev,
            currency: detectedCurrency.code
          }));
        } else {
          // Default to AED if detection fails
          const defaultCurrency: CurrencyInfo = {
            code: 'AED',
            symbol: 'د.إ',
            name: 'UAE Dirham'
          };
          setSelectedCurrency(defaultCurrency);
          setFormData(prev => ({
            ...prev,
            currency: 'AED'
          }));
        }
      }
    } catch (error) {
      console.error('Error detecting currency:', error);
      // Default to AED if detection fails
      const defaultCurrency: CurrencyInfo = {
        code: 'AED',
        symbol: 'د.إ',
        name: 'UAE Dirham'
      };
      setSelectedCurrency(defaultCurrency);
      setFormData(prev => ({
        ...prev,
        currency: 'AED'
      }));
    }
  };

  const handleCurrencyChange = (currency: CurrencyInfo) => {
    setSelectedCurrency(currency);
    setFormData(prev => ({
      ...prev,
      currency: currency.code
    }));
  };

  const fetchCategories = async () => {
    try {
      console.log('Fetching categories...');
      console.log('API Base URL:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');
      // Use the same categories endpoint as products since they share the same category system
      const response = await apiClient.getCategories();
      console.log('Categories response:', response);
      if (response.success && response.data) {
        // Handle both direct array and wrapped in categories property
        const categoriesData = Array.isArray(response.data) 
          ? response.data 
          : (response.data as any)?.categories || [];
        setCategories(categoriesData);
        console.log('Categories set:', categoriesData);
      } else {
        console.error('Categories response not successful:', response);
        toast.error(t('loadCategoriesFailed'));
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error(t('loadCategoriesFailed'));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageUpload = async (files: File[]) => {
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

      // Prepare payload for ImageKit upload
      const payload = {
        files: processedFiles,
        folder: "wrenchex/services",
        tags: ["service", "wrenchex"]
      };

      // Upload images using the proper backend endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/upload/images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
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
      
      toast.success(t('imagesUploadedSuccessfully', { count: uploadedUrls.length }));
    } catch (error) {
      console.error('Image upload failed:', error);
      toast.error(t('uploadImagesFailed'));
    } finally {
      setIsUploadingImages(false);
    }
  };

  const removeImage = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.categoryId || !formData.price || !formData.durationMinutes) {
      toast.error(t('fillRequiredFields'));
      return;
    }

    try {
      setIsSubmitting(true);

      const serviceData = {
        title: formData.title,
        description: formData.description,
        categoryId: formData.categoryId,
        price: parseFloat(formData.price),
        currency: formData.currency || 'AED',
        durationMinutes: parseInt(formData.durationMinutes),
        isMobileService: formData.isMobileService,
        images: formData.images
      };

      const response = await apiClient.createService(serviceData);

      if (response.success) {
        toast.success(t('serviceCreatedSuccessfully'));
        // Force a refresh of the services page to show the new service
        router.push(`/${currentLocale}/seller/services?refresh=` + Date.now());
      } else {
        toast.error(response.error?.message || t('createServiceFailed'));
      }
    } catch (error: any) {
      console.error('Failed to create service:', error);
      toast.error(t('createServiceFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDuration = (minutes: string) => {
    if (!minutes) return '';
    const mins = parseInt(minutes);
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    if (hours > 0) {
      return `${hours}h ${remainingMins}m`;
    }
    return `${mins}m`;
  };

  return (
    <ProtectedRoute requiredRole="SELLER">
      <div className="min-h-screen bg-wrench-bg-primary">
        <div className="container-responsive py-8">
          {/* Header */}
          <div className="mb-6">
            <Link href={`/${currentLocale}/seller/services`}>
              <Button variant="outline" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('backToServices')}
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">{t('addNewService')}</h1>
            <p className="text-gray-600 mt-2">{t('createServiceOffering')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-3 space-y-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>{t('basicInformation')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                        {t('serviceTitle')} *
                      </label>
                      <Input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder={t('serviceTitlePlaceholder')}
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                        {t('serviceDescription')} *
                      </label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder={t('serviceDescriptionPlaceholder')}
                        rows={4}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-2">
                          {t('category')} *
                        </label>
                        <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder={t('selectServiceCategory')} />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center space-x-2 pt-6">
                        <input
                          type="checkbox"
                          id="isMobileService"
                          name="isMobileService"
                          checked={formData.isMobileService}
                          onChange={handleChange}
                          className="rounded"
                        />
                        <label htmlFor="isMobileService" className="text-sm font-medium text-gray-700 flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {t('mobileService')}
                        </label>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Service Images */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="w-5 h-5" />
                      {t('serviceImages')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FileUpload
                      multiple
                      accept="image/*"
                      onUpload={handleImageUpload}
                      className="mb-4"
                      label={t('uploadFiles')}
                      dragDropText={t('dragDropFiles')}
                      maxFilesText={t('maxFilesText', { maxFiles: 5 })}
                      maxFileSizeText={t('maxFileSizeText', { maxSize: 5 })}
                    />
                    {isUploadingImages && (
                      <div className="text-center text-sm text-gray-600 mb-4">
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-wrench-accent"></div>
                          {t('uploadingImages')}
                        </div>
                      </div>
                    )}
                    
                    {formData.images.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-600 mb-2">{t('imagesUploadedCount', { count: formData.images.length })}</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {formData.images.map((imageUrl, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={imageUrl}
                                alt={t('serviceImageAlt', { index: index + 1 })}
                                className="w-full h-32 object-cover rounded-lg border"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-3 space-y-6">
                {/* Pricing & Duration */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {t('pricingDuration')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                          {t('servicePrice')} *
                        </label>
                        <Input
                          type="number"
                          id="price"
                          name="price"
                          value={formData.price}
                          onChange={handleChange}
                          placeholder={t('pricePlaceholder')}
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
                          {t('currency')} *
                        </label>
                        <CurrencySelector
                          value={formData.currency || 'AED'}
                          onChange={handleCurrencyChange}
                          placeholder={t('selectCurrency')}
                          className="w-full"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="durationMinutes" className="block text-sm font-medium text-gray-700 mb-2">
                        {t('durationMinutes')} *
                      </label>
                      <Input
                        type="number"
                        id="durationMinutes"
                        name="durationMinutes"
                        value={formData.durationMinutes}
                        onChange={handleChange}
placeholder={t('durationPlaceholder')}
                        min="15"
                        step="15"
                        required
                      />
                      {formData.durationMinutes && (
                        <p className="text-sm text-gray-500 mt-1 flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {formatDuration(formData.durationMinutes)}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Preview */}
                {formData.title && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">{t('preview')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <h3 className="font-medium">{formData.title}</h3>
                        {formData.price && (
                          <p className="text-green-600 font-bold">
                            {formatPrice(parseFloat(formData.price), formData.currency || 'AED')}
                          </p>
                        )}
                        {formData.durationMinutes && (
                          <p className="text-gray-600">
{t('duration')}: {formatDuration(formData.durationMinutes)}
                          </p>
                        )}
                        {formData.isMobileService && (
                          <p className="text-blue-600 text-xs">{t('mobileServiceAvailable')}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting || isUploadingImages}
                  className="w-full"
                  leftIcon={<Save className="w-4 h-4" />}
                >
                  {isSubmitting ? t('creatingService') : isUploadingImages ? t('uploadingImagesBtn') : t('createService')}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}
