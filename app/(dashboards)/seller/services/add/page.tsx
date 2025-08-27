'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/stores/auth';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { FileUpload } from '@/components/ui/FileUpload';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import Link from 'next/link';
import { ArrowLeft, Save, Upload, Clock, DollarSign, MapPin } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiClient } from '@/lib/api/client';
import { Category } from '@/types';

export default function AddServicePage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    price: '',
    durationMinutes: '',
    isMobileService: false,
    images: [] as string[]
  });
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

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
        toast.error('Failed to load categories');
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error('Failed to load categories');
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
        throw new Error(errorText || 'Image upload failed');
      }

      const result = await response.json();
      const uploadedUrls = result.data.images.map((image: any) => image.url);

      // Update form state with uploaded image URLs
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }));
      
      toast.success(`${uploadedUrls.length} image(s) uploaded successfully`);
    } catch (error) {
      console.error('Image upload failed:', error);
      toast.error('Failed to upload images');
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
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);

      const serviceData = {
        title: formData.title,
        description: formData.description,
        categoryId: formData.categoryId,
        price: parseFloat(formData.price),
        durationMinutes: parseInt(formData.durationMinutes),
        isMobileService: formData.isMobileService,
        images: formData.images
      };

      const response = await apiClient.createService(serviceData);

      if (response.success) {
        toast.success('Service created successfully!');
        // Force a refresh of the services page to show the new service
        router.push('/seller/services?refresh=' + Date.now());
      } else {
        toast.error(response.error?.message || 'Failed to create service');
      }
    } catch (error: any) {
      console.error('Failed to create service:', error);
      toast.error('Failed to create service');
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
            <Link href="/seller/services">
              <Button variant="outline" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Services
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Add New Service</h1>
            <p className="text-gray-600 mt-2">Create a new automotive service offering</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-3 space-y-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                        Service Title *
                      </label>
                      <Input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="e.g., Oil Change Service, Brake Repair, Engine Diagnostic"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                        Service Description *
                      </label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Describe your service in detail. Include what's included, tools used, expertise level, etc."
                        rows={4}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-2">
                          Category *
                        </label>
                        <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select service category" />
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
                          Mobile Service (I come to customer)
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
                      Service Images
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
                          Uploading images...
                        </div>
                      </div>
                    )}
                    
                    {formData.images.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-600 mb-2">{formData.images.length} image(s) uploaded</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {formData.images.map((imageUrl, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={imageUrl}
                                alt={`Service image ${index + 1}`}
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
                      <DollarSign className="w-5 h-5" />
                      Pricing & Duration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex gap-8">
                    <div>
                      <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                        Service Price (PKR) *
                      </label>
                      <Input
                        type="number"
                        id="price"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        placeholder="0"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="durationMinutes" className="block text-sm font-medium text-gray-700 mb-2">
                        Duration (minutes) *
                      </label>
                      <Input
                        type="number"
                        id="durationMinutes"
                        name="durationMinutes"
                        value={formData.durationMinutes}
                        onChange={handleChange}
                        placeholder="60"
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
                      <CardTitle className="text-sm">Preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <h3 className="font-medium">{formData.title}</h3>
                        {formData.price && (
                          <p className="text-green-600 font-bold">
                            PKR {parseFloat(formData.price).toLocaleString()}
                          </p>
                        )}
                        {formData.durationMinutes && (
                          <p className="text-gray-600">
                            Duration: {formatDuration(formData.durationMinutes)}
                          </p>
                        )}
                        {formData.isMobileService && (
                          <p className="text-blue-600 text-xs">Mobile Service Available</p>
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
                  {isSubmitting ? 'Creating Service...' : isUploadingImages ? 'Uploading Images...' : 'Create Service'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}
