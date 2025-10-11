// app/(dashboards)/seller/products/update/[id]/page.tsx
'use client';

import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/Textarea';
import { apiClient } from '@/lib/api/client'
import { Category, Product, UpdateProductData } from '@/types';
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/stores/auth';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function UpdateProductPage() {
    const router = useRouter();
    const { id } = useParams();
    const [product, setProduct] = useState<Product | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { token } = useAuthStore();
    const [imageToRemove, setImageToRemove] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const t = useTranslations('common.auth');
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [productResponse, categoriesResponse] = await Promise.all([
                    apiClient.getProductById(id as string),
                    apiClient.getCategories()
                ]);

                if (productResponse.success && productResponse.data) {
                    // Handle both direct product and wrapped response formats
                    const productData = (productResponse.data as any).product || productResponse.data;
                    console.log('Product data loaded:', productData);
                    setProduct(productData);
                } else {
                    toast.error(t('failedToLoadProduct'), {
                        description: productResponse.error?.message || 'Product not found'
                    });
                }

                if (categoriesResponse.success && categoriesResponse.data) {
                    // Handle both direct array and wrapped response formats
                    const categoriesData = Array.isArray(categoriesResponse.data) ? categoriesResponse.data : (categoriesResponse.data as any).categories;
                    setCategories(categoriesData || []);
                }
            } catch (error) {
                toast.error(t('failedToLoadProduct'), {
                    description: error instanceof Error ? error.message : 'An unexpected error occurred'
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (!product) {
                throw new Error('No product data to update');
            }

            const response = await apiClient.updateProduct({
                ...product,
                id: id as string
            });

            if (response.success) {
                toast.success(t('productUpdatedSuccessfully'), {
                    description: `${product.title} has been updated`
                });
                router.push('/seller/products');
            } else {
                throw new Error(response.error?.message || 'Failed to update product');
            }
        } catch (error) {
            toast.error(t('updateFailed'), {
                description: error instanceof Error ? error.message : 'An unexpected error occurred'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Image upload handler
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            try {
                // Set uploading state
                setIsUploading(true);
                // Create FormData for image upload
                const formData = new FormData();

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

                // Wait for all files to be converted
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

                // Enhanced error handling
                if (!response.ok) {
                    // Try to get more detailed error information
                    const errorText = await response.text();
                    console.error('Upload Error Response:', errorText);

                    // Parse error if possible
                    let errorDetails;
                    try {
                        errorDetails = JSON.parse(errorText);
                    } catch {
                        errorDetails = { message: errorText };
                    }

                    throw new Error(
                        errorDetails.message ||
                        errorDetails.error ||
                        'Image upload failed'
                    );
                }

                // Parse successful response
                const result = await response.json();

                // Extract and validate image URLs
                if (!result.data || !result.data.images || result.data.images.length === 0) {
                    throw new Error('No images were uploaded successfully');
                }

                const uploadedUrls = result.data.images.map((image: any) => image.url);

                // Update product images
                setProduct(prev => prev ? {
                    ...prev,
                    images: [...(prev.images || []), ...uploadedUrls]
                } : null);

                // Success toast
                toast.success(t('imagesUploaded'), {
                    description: `${uploadedUrls.length} image(s) uploaded successfully`
                });

            } catch (error) {
                // Comprehensive error logging and toast
                console.error('Full image upload error:', error);

                toast.error(t('imageUploadFailed'), {
                    description: error instanceof Error
                        ? error.message
                        : 'An unexpected error occurred during image upload'
                });
            }finally {
                // Always reset uploading state
                setIsUploading(false);
              }
        }
    };

    // Confirm image removal
  const confirmImageRemoval = () => {
    if (imageToRemove) {
      setProduct(prev => prev ? {
        ...prev,
        images: prev.images?.filter(img => img !== imageToRemove)
      } : null);
      
      toast.success(t('imageRemoved'), {
        description: 'The image has been removed from the product'
      });
      
      // Reset removal state
      setImageToRemove(null);
    }
  };

    if (isLoading) {
        return (
            <div className="container mx-auto max-w-4xl py-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wrench-accent mx-auto mb-4"></div>
                <p className="text-gray-600">Loading product details...</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="container mx-auto max-w-4xl py-8 text-center">
                <p className="text-gray-600">Product not found</p>
            </div>
        );
    }

    return (
        <>
        <div className="container mx-auto max-w-4xl py-8">
            <Button variant="outline" className="mb-4" onClick={() => router.back()}>
                <ArrowLeft className="w-4 h-4" />
                Back to Products
            </Button>
            <h1 className="text-2xl font-bold mb-6">Update Product</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Product Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="title" className="block mb-2">Product Title</label>
                        <Input
                            type="text"
                            id="title"
                            name="title"
                            value={product.title}
                            onChange={(e) => setProduct({ ...product, title: e.target.value })}
                            placeholder="Enter product name"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="categoryId" className="block mb-2">Category</label>
                        <Select
                            value={product.categoryId}
                            onValueChange={(value) => setProduct({ ...product, categoryId: value })}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories && Array.isArray(categories) && categories.map((category) => (
                                    <SelectItem
                                        key={category.id}
                                        value={category.id}
                                    >
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
                    <Textarea
                        id="description"
                        name="description"
                        value={product.description}
                        onChange={(e) => setProduct({ ...product, description: e.target.value })}
                        placeholder="Provide detailed product description"
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
                            value={product.price}
                            onChange={(e) => setProduct({ ...product, price: Number(e.target.value) })}
                            placeholder="Enter product price"
                            required
                        />
                    </div>


                </div>

                {/* Specifications */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Product Specifications</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Material"
                            value={product.specifications?.material || ''}
                            onChange={(e) => setProduct({
                                ...product,
                                specifications: {
                                    ...product.specifications,
                                    material: e.target.value
                                }
                            })}
                            placeholder="e.g., Ceramic, Metal"
                        />
                        <Input
                            label="Compatibility"
                            value={product.specifications?.compatibility || ''}
                            onChange={(e) => setProduct({
                                ...product,
                                specifications: {
                                    ...product.specifications,
                                    compatibility: e.target.value
                                }
                            })}
                            placeholder="e.g., Toyota Corolla 2018-2023"
                        />
                        <Input
                            label="Warranty"
                            value={product.specifications?.warranty || ''}
                            onChange={(e) => setProduct({
                                ...product,
                                specifications: {
                                    ...product.specifications,
                                    warranty: e.target.value
                                }
                            })}
                            placeholder="e.g., 12 months"
                        />
                        <Input
                            label="Brand"
                            value={product.specifications?.brand || ''}
                            onChange={(e) => setProduct({
                                ...product,
                                specifications: {
                                    ...product.specifications,
                                    brand: e.target.value
                                }
                            })}
                            placeholder="e.g., AutoParts Pro"
                        />
                    </div>
                </div>

                {/* Image Upload */}
                <div>
                    <label htmlFor="images" className="block mb-2">Product Images</label>
                    {isUploading && <p className="text-sm text-gray-500">Uploading images...</p>}
                    <Input
                        type="file"
                        id="images"
                        name="images"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                    />

                    {/* Image Previews */}
                    {product.images && product.images.length > 0 && (
                        <div className="mt-4 grid grid-cols-4 gap-4">
                            {product.images.map((url, index) => (
                                <div key={index} className="relative">
                                    <img
                                        src={url}
                                        alt={`Product image ${index + 1}`}
                                        className="w-full h-24 object-cover rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setImageToRemove(url)}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Submit Button */}
                <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting || isUploading}
                >
                    {isSubmitting ? "Updating Product..." : isUploading ? "Uploading Images..." : "Update Product"}
                </Button>
            </form>
        </div>

        {/* Image Removal Confirmation Dialog */ }
        <Dialog
            open={!!imageToRemove}
            onOpenChange={() => setImageToRemove(null)}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Remove Image</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to remove this image from the product?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => setImageToRemove(null)}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={confirmImageRemoval}
                    >
                        Remove
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </>
  );
}