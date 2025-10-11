'use client';

import React, { useState, useEffect } from 'react';
import { useUserRole } from '@/lib/stores/auth';
import { useAuthStore } from '@/lib/stores/auth';
import { apiClient } from '@/lib/api/client';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { usePathname } from 'next/navigation';
import { 
  Tag, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  FolderOpen,
  Image
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  imageUrl?: string;
  isActive: boolean;
  productCount?: number;
  createdAt: string;
  updatedAt: string;
  parent?: Category;
  children?: Category[];
}

export default function AdminCategoriesPage() {
  const role = useUserRole();
  const { isLoading, isAuthenticated } = useAuthStore();
  const pathname = usePathname();
  const currentLocale = pathname?.split('/').filter(Boolean)[0] === 'ar' ? 'ar' : 'en';
  const t = useTranslations('adminCategories');

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploadingCreate, setIsUploadingCreate] = useState(false);
  const [isUploadingEdit, setIsUploadingEdit] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parentId: '',
    imageUrl: '',
    isActive: true
  });

  useEffect(() => {
    if (isAuthenticated && role === 'ADMIN') {
      fetchCategories();
    }
  }, [isAuthenticated, role, currentPage]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get current locale from pathname
      const currentLocale = pathname.startsWith('/ar') ? 'ar' : 'en';
      
      const response = await apiClient.get(`/categories?includeInactive=true&lang=${currentLocale}&ts=${Date.now()}`);
      
      if (response.success && response.data) {
        const categoriesData = Array.isArray(response.data) ? response.data : (response.data as any)?.categories || [];
        setCategories(categoriesData);
        setPagination({
          page: 1,
          limit: 10,
          total: categoriesData.length,
          pages: Math.ceil(categoriesData.length / 10)
        });
      } else {
        setError(response.error?.message || t('fetchCategoriesFailed'));
        setCategories([]);
      }
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      setError(err.message || t('fetchCategoriesFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        parentId: formData.parentId || undefined,
        imageUrl: formData.imageUrl || undefined,
      };
      const res = await apiClient.createCategory(payload);
      if (!res.success) throw new Error(res.error?.message || 'Failed to create');
      toast.success(t('categoryCreated') as any);
      // close and refresh
      setShowCreateModal(false);
      setFormData({ name: '', description: '', parentId: '', imageUrl: '', isActive: true });
      fetchCategories();
    } catch (err: any) {
      setError(err.message || t('createCategoryFailed'));
      toast.error(err.message || (t('createCategoryFailed') as any));
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    
    try {
      const payload = {
        name: formData.name.trim() || undefined,
        description: formData.description.trim() || undefined,
        parentId: formData.parentId || undefined,
        imageUrl: formData.imageUrl || undefined,
        isActive: formData.isActive,
      };
      const res = await apiClient.updateCategory(editingCategory.id, payload);
      if (!res.success) throw new Error(res.error?.message || 'Failed to update');
      toast.success(t('categoryUpdated') as any);
      // close and refresh
      setShowEditModal(false);
      setEditingCategory(null);
      setFormData({ name: '', description: '', parentId: '', imageUrl: '', isActive: true });
      fetchCategories();
    } catch (err: any) {
      setError(err.message || t('updateCategoryFailed'));
      toast.error(err.message || (t('updateCategoryFailed') as any));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm(t('deleteCategoryConfirm'))) {
      return;
    }

    try {
      setDeletingCategory(categoryId);
      const res = await apiClient.deleteCategory(categoryId);
      if (!res.success) throw new Error(res.error?.message || 'Failed to delete');
      toast.success(t('categoryDeleted') as any);
      fetchCategories();
    } catch (err: any) {
      setError(err.message || t('deleteCategoryFailed'));
    } finally {
      setDeletingCategory(null);
    }
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      parentId: category.parentId || '',
      imageUrl: category.imageUrl || '',
      isActive: category.isActive
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', parentId: '', imageUrl: '', isActive: true });
    setEditingCategory(null);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1] || '');
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleCreateImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingCreate(true);
      const base64 = await fileToBase64(file);
      const res = await apiClient.post('/upload/image', {
        file: base64,
        fileName: file.name,
        folder: 'categories',
        tags: ['category']
      });
      if (!res.success) throw new Error(res.error?.message || 'Upload failed');
      const url = (res.data as any)?.image?.url;
      if (url) {
        setFormData(prev => ({ ...prev, imageUrl: url }));
        toast.success(t('imageUploaded') as any);
      } else {
        throw new Error('Invalid upload response');
      }
    } catch (err: any) {
      toast.error(err.message || (t('imageUploadFailed') as any));
    } finally {
      setIsUploadingCreate(false);
      e.target.value = '';
    }
  };

  const handleEditImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingEdit(true);
      const base64 = await fileToBase64(file);
      const res = await apiClient.post('/upload/image', {
        file: base64,
        fileName: file.name,
        folder: 'categories',
        tags: ['category']
      });
      if (!res.success) throw new Error(res.error?.message || 'Upload failed');
      const url = (res.data as any)?.image?.url;
      if (url) {
        setFormData(prev => ({ ...prev, imageUrl: url }));
        toast.success(t('imageUploaded') as any);
      } else {
        throw new Error('Invalid upload response');
      }
    } catch (err: any) {
      toast.error(err.message || (t('imageUploadFailed') as any));
    } finally {
      setIsUploadingEdit(false);
      e.target.value = '';
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-100 text-green-800">{t('active')}</Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-800">{t('inactive')}</Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(currentLocale === 'ar' ? 'ar-AE' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const searchValue = search.trim().toLowerCase();
  const filteredCategories = (categories || []).filter(category =>
    !searchValue ||
    category.name?.toLowerCase().includes(searchValue) ||
    category.description?.toLowerCase().includes(searchValue)
  );

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
    setPagination(prev => ({ 
      ...prev, 
      total: filteredCategories.length, 
      pages: Math.max(1, Math.ceil(filteredCategories.length / prev.limit)) 
    }));
  }, [search, filteredCategories.length]);

  const paginatedCategories = (filteredCategories || []).slice(
    (currentPage - 1) * pagination.limit,
    currentPage * pagination.limit
  );

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wrench-accent"></div>
          <p className="text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('categoryManagement')}</h1>
          <p className="text-gray-600">{t('createEditAndManageProductCategories')}</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={fetchCategories} 
            variant="outline" 
            leftIcon={<RefreshCw className="h-4 w-4" />}
            disabled={loading}
          >
            {t('refresh')}
          </Button>
          <Button 
            onClick={() => setShowCreateModal(true)} 
            variant="primary" 
            leftIcon={<Plus className="h-4 w-4" />}
          >
            {t('addCategory')}
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('searchCategories')}
            </label>
            <Input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            {t('categories', { count: filteredCategories.length })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex flex-col items-center space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wrench-accent"></div>
                <p className="text-gray-600">{t('loadingCategories')}</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchCategories} variant="outline">
                {t('tryAgain')}
              </Button>
            </div>
          ) : paginatedCategories.length === 0 ? (
            <div className="text-center py-8">
              <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">{t('noCategoriesFound')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedCategories.map((category) => (
                <div
                  key={category.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-gray-900">{category.name}</h3>
                        {getStatusBadge(category.isActive)}
                        {category.parent && (
                          <Badge className="bg-blue-100 text-blue-800">
                            {t('subcategoryOf', { parentName: category.parent.name })}
                          </Badge>
                        )}
                      </div>
                      
                      {category.description && (
                        <p className="text-sm text-gray-600 mb-3">
                          {category.description}
                        </p>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <FolderOpen className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="font-medium text-gray-700">{t('products')}</p>
                            <p className="text-gray-600">{t('items', { count: category.productCount || 0 })}</p>
                          </div>
                        </div>
                        
                        {category.imageUrl && (
                          <div className="flex items-center gap-2">
                            <Image className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="font-medium text-gray-700">{t('image')}</p>
                              <p className="text-gray-600">{t('hasImage')}</p>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="font-medium text-gray-700">{t('created')}</p>
                            <p className="text-gray-600">{formatDate(category.createdAt)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 min-w-fit">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        leftIcon={<Edit className="h-4 w-4" />}
                        onClick={() => openEditModal(category)}
                      >
                        {t('edit')}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        leftIcon={<Trash2 className="h-4 w-4" />}
                        onClick={() => handleDeleteCategory(category.id)}
                        disabled={deletingCategory === category.id}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        {deletingCategory === category.id ? t('deleting') : t('delete')}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {t('showingResults', { 
                  start: ((currentPage - 1) * pagination.limit) + 1,
                  end: Math.min(currentPage * pagination.limit, filteredCategories.length),
                  total: filteredCategories.length
                })}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  {t('previous')}
                </Button>
                
                <span className="text-sm text-gray-600">
                  {t('pageOf', { current: currentPage, total: pagination.pages })}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === pagination.pages}
                >
                  {t('next')}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Category Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">{t('createNewCategory')}</h3>
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('categoryName')} *
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder={t('enterCategoryName')}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('description')}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wrench-accent focus:border-transparent"
                  rows={3}
                  placeholder={t('enterCategoryDescription')}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('parentCategory')}
                </label>
                <select
                  value={formData.parentId}
                  onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wrench-accent focus:border-transparent"
                >
                  <option value="">{t('noParentMainCategory')}</option>
                  {(categories || []).map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('image')}
                </label>
                <div className="space-y-2">
                  {formData.imageUrl && (
                    <img src={formData.imageUrl} alt="preview" className="h-20 w-20 object-cover rounded" />
                  )}
                  <input type="file" accept="image/*" onChange={handleCreateImageChange} />
                  {isUploadingCreate && (
                    <p className="text-xs text-gray-500">{t('uploading')}...</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 text-wrench-accent focus:ring-wrench-accent border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                  {t('active')}
                </label>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" variant="primary" className="flex-1">
                  {t('createCategory')}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="flex-1"
                >
                  {t('cancel')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {showEditModal && editingCategory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">{t('editCategory')}</h3>
            <form onSubmit={handleEditCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('categoryName')} *
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder={t('enterCategoryName')}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('description')}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wrench-accent focus:border-transparent"
                  rows={3}
                  placeholder={t('enterCategoryDescription')}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('parentCategory')}
                </label>
                <select
                  value={formData.parentId}
                  onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wrench-accent focus:border-transparent"
                >
                  <option value="">{t('noParentMainCategory')}</option>
                  {(categories || []).filter(cat => cat.id !== editingCategory.id).map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('image')}
                </label>
                <div className="space-y-2">
                  {formData.imageUrl && (
                    <img src={formData.imageUrl} alt="preview" className="h-20 w-20 object-cover rounded" />
                  )}
                  <input type="file" accept="image/*" onChange={handleEditImageChange} />
                  {isUploadingEdit && (
                    <p className="text-xs text-gray-500">{t('uploading')}...</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="editIsActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 text-wrench-accent focus:ring-wrench-accent border-gray-300 rounded"
                />
                <label htmlFor="editIsActive" className="ml-2 text-sm text-gray-700">
                  {t('active')}
                </label>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" variant="primary" className="flex-1">
                  {t('updateCategory')}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="flex-1"
                >
                  {t('cancel')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
