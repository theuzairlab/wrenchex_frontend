'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/stores/auth';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { FileUpload } from '@/components/ui/FileUpload';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Save, Upload, Clock, MapPin, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiClient } from '@/lib/api/client';
import { Category, Service } from '@/types';
import { useTranslations } from 'next-intl';
import { formatPrice } from '@/lib/utils';
import CurrencySelector from '@/components/ui/CurrencySelector';
import { CurrencyService, CurrencyInfo } from '@/lib/services/currencyService';

export default function UpdateServicePage() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const currentLocale = pathname?.split('/').filter(Boolean)[0] === 'ar' ? 'ar' : 'en';
  const serviceId = params.id as string;
  const { token } = useAuthStore();
  const t = useTranslations('sellerServicesUpdate');
  
  const [service, setService] = useState<Service | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [imageToRemove, setImageToRemove] = useState<string | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyInfo | null>(null);

  useEffect(() => {
    if (serviceId) {
      fetchServiceData();
      fetchCategories();
    }
  }, [serviceId]);

  useEffect(() => {
    if (service) {
      // Set the currency from the service data
      if (service.currency) {
        const currencyInfo: CurrencyInfo = {
          code: service.currency,
          symbol: service.currency === 'AED' ? 'د.إ' : service.currency === 'PKR' ? '₨' : service.currency,
          name: service.currency === 'AED' ? 'UAE Dirham' : service.currency === 'PKR' ? 'Pakistani Rupee' : service.currency
        };
        setSelectedCurrency(currencyInfo);
      } else {
        // Default to AED if no currency is set
        const defaultCurrency: CurrencyInfo = {
          code: 'AED',
          symbol: 'د.إ',
          name: 'UAE Dirham'
        };
        setSelectedCurrency(defaultCurrency);
      }
    }
  }, [service]);

  const handleCurrencyChange = (currency: CurrencyInfo) => {
    setSelectedCurrency(currency);
    if (service) {
      setService(prev => prev ? { ...prev, currency: currency.code } : null);
    }
  };

  const fetchServiceData = async () => {
    try {
      const response = await apiClient.getServiceById(serviceId);
      if (response.success && response.data) {
        setService(response.data);
      } else {
        toast.error(t('serviceNotFound'));
        router.push(`/${currentLocale}/seller/services`);
      }
    } catch (error) {
      console.error('Failed to fetch service:', error);
      toast.error(t('failedToLoadService'));
      router.push(`/${currentLocale}/seller/services`);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      // Use the same categories endpoint as products since they share the same category system
      const response = await apiClient.getCategories();
      if (response.success && response.data) {
        // Handle both direct array and wrapped in categories property
        const categoriesData = Array.isArray(response.data) 
          ? response.data 
          : (response.data as any)?.categories || [];
        setCategories(categoriesData);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error(t('failedToLoadCategories'));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!service) return;
    
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setService(prev => ({ ...prev!, [name]: checked }));
    } else if (name === 'price' || name === 'durationMinutes') {
      const numValue = value === '' ? 0 : parseFloat(value);
      setService(prev => ({ ...prev!, [name]: numValue }));
    } else {
      setService(prev => ({ ...prev!, [name]: value }));
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    if (!service) return;
    setService(prev => ({ ...prev!, categoryId }));
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
        throw new Error(errorText || 'Image upload failed');
      }

      const result = await response.json();
      const uploadedUrls = result.data.images.map((image: any) => image.url);

      // Update service state with uploaded image URLs
      setService(prev => ({
        ...prev!,
        images: [...(prev?.images || []), ...uploadedUrls]
      }));
      
      toast.success(t('imagesUploadedSuccessfully', { count: uploadedUrls.length }));
    } catch (error) {
      console.error('Image upload failed:', error);
      toast.error(t('failedToUploadImages'));
    } finally {
      setIsUploadingImages(false);
    }
  };

  const confirmRemoveImage = (imageUrl: string) => {
    setImageToRemove(imageUrl);
  };

  const removeImage = () => {
    if (!service || !imageToRemove) return;
    
    setService(prev => ({
      ...prev!,
      images: prev!.images?.filter(img => img !== imageToRemove) || []
    }));
    setImageToRemove(null);
    toast.success(t('imageRemoved'));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!service) return;

    if (!service.title || !service.description || !service.categoryId || !service.price || !service.durationMinutes) {
      toast.error(t('fillRequiredFields'));
      return;
    }

    try {
      setIsSubmitting(true);

      const updateData = {
        id: serviceId,
        title: service.title,
        description: service.description,
        categoryId: service.categoryId,
        price: service.price,
        currency: service.currency || 'AED',
        durationMinutes: service.durationMinutes,
        isMobileService: service.isMobileService,
        images: service.images || []
      };

      const response = await apiClient.updateService(updateData);

      if (response.success) {
        toast.success(t('serviceUpdatedSuccessfully'));
        // Force a refresh of the services page to show the updated service
        router.push(`/${currentLocale}/seller/services?refresh=` + Date.now());
      } else {
        toast.error(response.error?.message || t('failedToUpdateService'));
      }
    } catch (error: any) {
      console.error('Failed to update service:', error);
      toast.error(t('failedToUpdateService'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDuration = (minutes: number) => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const remainingMins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${remainingMins}m`;
    }
    return `${minutes}m`;
  };

  if (isLoading) {
    return (
      <ProtectedRoute requiredRole="SELLER">
        <div className="min-h-screen bg-wrench-bg-primary flex items-center justify-center">
          <LoadingSpinner size="lg" text={t('loadingService')} />
        </div>
      </ProtectedRoute>
    );
  }

  if (!service) {
    return (
      <ProtectedRoute requiredRole="SELLER">
        <div className="min-h-screen bg-wrench-bg-primary flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('serviceNotFound')}</h2>
            <Button onClick={() => router.push(`/${currentLocale}/seller/services`)}>
              {t('backToServices')}
            </Button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="SELLER">
      <div className="min-h-screen bg-wrench-bg-primary">
        <div className="container-responsive py-8">
          {/* Header */}
          <div className="mb-6">
            <Button variant="outline" className="mb-4" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('backToServices')}
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">{t('updateService')}</h1>
            <p className="text-gray-600 mt-2">{t('modifyServiceDetails')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
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
                        value={service.title}
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
                        value={service.description}
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
                        <Select value={service.categoryId} onValueChange={handleCategoryChange}>
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
                          checked={service.isMobileService}
                          onChange={handleChange}
                          className="rounded"
                        />
                        <label htmlFor="isMobileService" className="text-sm font-medium text-gray-700 flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
{t('mobileServiceDescription')}
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
                    />
                    {isUploadingImages && (
                      <div className="text-center text-sm text-gray-600 mb-4">
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-wrench-accent"></div>
{t('uploadingImages')}
                        </div>
                      </div>
                    )}
                    
                    {service.images && service.images.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-600 mb-2">{t('imagesUploadedCount', { count: service.images.length })}</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {service.images.map((imageUrl, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={imageUrl}
                                alt={t('serviceImageAlt', { index: index + 1 })}
                                className="w-full h-32 object-cover rounded-lg border"
                              />
                              <button
                                type="button"
                                onClick={() => confirmRemoveImage(imageUrl)}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="w-3 h-3" />
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
              <div className="lg:col-span-1 space-y-6">
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
                          value={service.price.toString()}
                          onChange={handleChange}
                          placeholder="0"
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
                          value={service.currency || 'AED'}
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
                        value={service.durationMinutes.toString()}
                        onChange={handleChange}
                        placeholder="60"
                        min="15"
                        step="15"
                        required
                      />
                      {service.durationMinutes && (
                        <p className="text-sm text-gray-500 mt-1 flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {formatDuration(service.durationMinutes)}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">{t('preview')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <h3 className="font-medium">{service.title}</h3>
                      <p className="text-green-600 font-bold">
                        {formatPrice(service.price, service.currency || 'AED')}
                      </p>
                      <p className="text-gray-600">
{t('duration')}: {formatDuration(service.durationMinutes)}
                      </p>
                      {service.isMobileService && (
                        <p className="text-blue-600 text-xs">{t('mobileServiceAvailable')}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting || isUploadingImages}
                  className="w-full"
                  leftIcon={<Save className="w-4 h-4" />}
                >
{isSubmitting ? t('updatingService') : isUploadingImages ? t('uploadingImagesBtn') : t('updateService')}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Remove Image Confirmation Dialog */}
      <Dialog open={!!imageToRemove} onOpenChange={() => setImageToRemove(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('removeImage')}</DialogTitle>
            <DialogDescription>
              {t('removeImageConfirmation')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImageToRemove(null)}>
{t('cancel')}
            </Button>
            <Button variant="destructive" onClick={removeImage}>
{t('removeImage')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  );
}
