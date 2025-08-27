// app/(dashboards)/seller/products/add/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/stores/auth';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ArrowLeftIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiClient } from '@/lib/api/client';
import { Category } from '@/types';

export default function AddProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    price: '',

    specifications: {
      material: '',
      compatibility: '',
      warranty: '',
      brand: ''
    },
    images: [] as string[]
  });
  const { token } = useAuthStore();
  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiClient.getCategories();
        if (response.success && response.data) {
          // Handle both direct array and wrapped in categories property
          const categoriesData = Array.isArray(response.data) 
            ? response.data 
            : (response.data.categories || []);
          setCategories(categoriesData);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        toast.error('Failed to load categories');
        setCategories([]);
      }
    };
    fetchCategories();
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
          throw new Error(errorText || 'Image upload failed');
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
        toast.error('Image Upload Failed', {
          description: error instanceof Error ? error.message : 'Could not upload images'
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
      // Prepare product data
      const productData = {
        ...formData,
        price: Number(formData.price)
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
        throw new Error(errorData.message || 'Failed to create product');
      }

      // Success
      toast.success('Product Created', {
        description: 'Your product has been successfully added'
      });

      // Redirect to products page
      router.push('/seller/products');
    } catch (error) {
      toast.error('Product Creation Failed', {
        description: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <Link href="/seller/products">
        <Button variant="outline" className="mb-4">
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Products
        </Button>
      </Link>
      <h1 className="text-2xl font-bold mb-6">Add New Product</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Product Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="title" className="block mb-2">Product Title</label>
            <Input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter product name"
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label htmlFor="categoryId" className="block mb-2">Category</label>

            <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
              <SelectTrigger  className="w-full px-3 py-5 border rounded-lg border-wrench-accent focus:border-wrench-accent focus:ring-wrench-accent focus:ring-1 outline-none">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id} className="py-2 px-3 rounded-lg">
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block mb-2">Product Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Provide detailed product description"
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>

        {/* Pricing and Inventory */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="price" className="block mb-2">Price</label>
            <Input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="Enter product price"
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>


        </div>

        {/* Specifications */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="specifications.material" className="block mb-2">Material</label>
            <Input
              type="text"
              id="specifications.material"
              name="specifications.material"
              value={formData.specifications.material}
              onChange={handleChange}
              placeholder="e.g., Ceramic, Metal"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label htmlFor="specifications.compatibility" className="block mb-2">Vehicle Compatibility</label>
            <Input
              type="text"
              id="specifications.compatibility"
              name="specifications.compatibility"
              value={formData.specifications.compatibility}
              onChange={handleChange}
              placeholder="e.g., Toyota Corolla 2018-2023"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label htmlFor="specifications.brand" className="block mb-2">Brand</label>
            <Input
              type="text"
              id="specifications.brand"
              name="specifications.brand"
              value={formData.specifications.brand}
              onChange={handleChange}
              placeholder="e.g., AutoParts Pro"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label htmlFor="specifications.warranty" className="block mb-2">Warranty</label>
            <Input
              type="text"
              id="specifications.warranty"
              name="specifications.warranty"
              value={formData.specifications.warranty}
              onChange={handleChange}
              placeholder="e.g., 12 months"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label htmlFor="images" className="block mb-2">Product Images</label>
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
              <span className="text-sm">Uploading images...</span>
            </div>
          )}
          
          {/* Image Previews */}
          {formData.images.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">{formData.images.length} image(s) uploaded</p>
              <div className="flex flex-wrap gap-2">
                {formData.images.map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
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
          {isSubmitting ? "Creating Product..." : isUploadingImages ? "Uploading Images..." : "Add Product"}
        </Button>
      </form>
    </div>
  );
}