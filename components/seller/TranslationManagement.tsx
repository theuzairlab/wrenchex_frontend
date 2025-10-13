'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';  
import { apiClient } from '@/lib/api/client';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { 
  Languages, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Edit3, 
  Save, 
  X,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface Translation {
  id: string;
  language: 'en' | 'ar';
  title: string;
  description: string;
  specifications?: string;
  status: 'DRAFT' | 'APPROVED' | 'REJECTED';
  isOriginal: boolean;
  autoTranslated: boolean;
  confidence?: number;
  createdAt: string;
  updatedAt: string;
}

interface TranslationItem {
  id: string;
  type: 'product' | 'service' | 'category';
  title: string;
  translations: Translation[];
}

interface TranslationManagementProps {
  entityType: 'product' | 'service' | 'category';
  entityId?: string;
  showPendingOnly?: boolean;
}

export default function TranslationManagement({ 
  entityType, 
  entityId, 
  showPendingOnly = false 
}: TranslationManagementProps) {
  const t = useTranslations('common.translations');
  const [items, setItems] = useState<TranslationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTranslation, setEditingTranslation] = useState<{
    itemId: string;
    translationId: string;
    language: 'en' | 'ar';
    fields: Record<string, string>;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTranslations();
  }, [entityType, entityId, showPendingOnly]);

  const fetchTranslations = async () => {
    try {
      setLoading(true);
      
      if (entityId) {
        // Fetch specific entity translation status
        let response;
        switch (entityType) {
          case 'product':
            response = await apiClient.getProductTranslationStatus(entityId);
            break;
          case 'service':
            response = await apiClient.getServiceTranslationStatus(entityId);
            break;
          case 'category':
            response = await apiClient.getCategoryTranslationStatus(entityId);
            break;
        }
        
        if (response?.success && response.data) {
          setItems([{
            id: entityId,
            type: entityType,
            title: response.data.title || 'Unknown',
            translations: response.data.translations || []
          }]);
        }
      } else {
        // Fetch pending translations
        let response;
        switch (entityType) {
          case 'product':
            response = await apiClient.getPendingProductTranslations();
            break;
          case 'service':
            response = await apiClient.getPendingServiceTranslations();
            break;
          case 'category':
            response = await apiClient.getPendingCategoryTranslations();
            break;
        }
        
        if (response?.success && response.data) {
          setItems(response.data.items || []);
        }
      }
    } catch (error) {
      console.error('Failed to fetch translations:', error);
      toast.error(t('failedToLoadTranslations'));
    } finally {
      setLoading(false);
    }
  };

  const handleApproveTranslation = async (
    itemId: string, 
    language: 'en' | 'ar', 
    editedFields?: Record<string, string>
  ) => {
    try {
      setSubmitting(true);
      
      const data = {
        language,
        ...(editedFields && { editedFields })
      };

      let response;
      switch (entityType) {
        case 'product':
          response = await apiClient.approveProductTranslation(itemId, data);
          break;
        case 'service':
          response = await apiClient.approveServiceTranslation(itemId, data);
          break;
        case 'category':
          response = await apiClient.approveCategoryTranslation(itemId, data);
          break;
      }

      if (response?.success) {
        toast.success(t('translationApproved'));
        setEditingTranslation(null);
        fetchTranslations();
      } else {
        toast.error(response?.error?.message || t('failedToApproveTranslation'));
      }
    } catch (error) {
      console.error('Failed to approve translation:', error);
      toast.error(t('failedToApproveTranslation'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectTranslation = async (itemId: string, language: 'en' | 'ar', reason: string) => {
    try {
      setSubmitting(true);
      
      const data = { language, reason };

      let response;
      switch (entityType) {
        case 'product':
          response = await apiClient.rejectProductTranslation(itemId, data);
          break;
        case 'service':
          response = await apiClient.rejectServiceTranslation(itemId, data);
          break;
        case 'category':
          response = await apiClient.rejectCategoryTranslation(itemId, data);
          break;
      }

      if (response?.success) {
        toast.success(t('translationRejected'));
        fetchTranslations();
      } else {
        toast.error(response?.error?.message || t('failedToRejectTranslation'));
      }
    } catch (error) {
      console.error('Failed to reject translation:', error);
      toast.error(t('failedToRejectTranslation'));
    } finally {
      setSubmitting(false);
    }
  };

  const startEditing = (itemId: string, translation: Translation) => {
    setEditingTranslation({
      itemId,
      translationId: translation.id,
      language: translation.language,
      fields: {
        title: translation.title,
        description: translation.description,
        ...(translation.specifications && { 
          specifications: typeof translation.specifications === 'object' 
            ? JSON.stringify(translation.specifications, null, 2)
            : translation.specifications 
        })
      }
    });
  };

  const cancelEditing = () => {
    setEditingTranslation(null);
  };

  const updateEditingField = (field: string, value: string) => {
    if (!editingTranslation) return;
    
    setEditingTranslation({
      ...editingTranslation,
      fields: {
        ...editingTranslation.fields,
        [field]: value
      }
    });
  };

  const saveEdits = () => {
    if (!editingTranslation) return;
    
    handleApproveTranslation(
      editingTranslation.itemId,
      editingTranslation.language,
      editingTranslation.fields
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />{t('approved')}</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />{t('rejected')}</Badge>;
      case 'DRAFT':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />{t('pending')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getLanguageFlag = (language: 'en' | 'ar') => {
    return language === 'ar' ? '🇸🇦' : '🇺🇸';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          {t('loadingTranslations')}
        </CardContent>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Languages className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">{t('noTranslationsFound')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-lg sm:text-2xl font-bold flex items-center">
          <Languages className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
          <span className="text-base sm:text-2xl">{t('translationManagement')}</span>
        </h2>
        <Button onClick={fetchTranslations} variant="outline" size="sm" className="w-full sm:w-auto">
          <span className="text-sm sm:text-base">{t('refresh')}</span>
        </Button>
      </div>

      {items.map((item) => (
        <Card key={item.id}>
          <CardHeader className="p-3 sm:p-6">
            <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span className="text-sm sm:text-base font-medium break-words">{item.title}</span>
              <Badge variant="outline" className="text-xs w-fit">{t(item.type)}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              {item.translations.map((translation) => (
                <div key={translation.id} className="border rounded-lg p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base sm:text-lg">{getLanguageFlag(translation.language)}</span>
                      <span className="font-medium text-sm sm:text-base">{translation.language.toUpperCase()}</span>
                      {translation.isOriginal && (
                        <Badge variant="outline" className="text-xs">
                          {t('original')}
                        </Badge>
                      )}
                      {translation.autoTranslated && (
                        <Badge variant="secondary" className="text-xs">
                          {t('autoTranslated')}
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {getStatusBadge(translation.status)}
                      {translation.confidence && (
                        <span className="text-xs text-gray-500">
                          {Math.round(translation.confidence * 100)}%
                        </span>
                      )}
                    </div>
                  </div>

                  {editingTranslation?.translationId === translation.id ? (
                    // Edit mode
                    <div className="space-y-3 sm:space-y-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium mb-1">{t('title')}</label>
                        <Input
                          value={editingTranslation.fields.title || ''}
                          onChange={(e) => updateEditingField('title', e.target.value)}
                          className={`text-xs sm:text-sm ${translation.language === 'ar' ? 'text-right' : 'text-left'}`}
                          dir={translation.language === 'ar' ? 'rtl' : 'ltr'}
                        />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium mb-1">{t('description')}</label>
                        <Textarea
                          value={editingTranslation.fields.description || ''}
                          onChange={(e) => updateEditingField('description', e.target.value)}
                          className={`text-xs sm:text-sm ${translation.language === 'ar' ? 'text-right' : 'text-left'}`}
                          dir={translation.language === 'ar' ? 'rtl' : 'ltr'}
                          rows={3}
                        />
                      </div>
                      {editingTranslation.fields.specifications && (
                        <div>
                          <label className="block text-xs sm:text-sm font-medium mb-1">{t('specifications')}</label>
                          <Textarea
                            value={editingTranslation.fields.specifications || ''}
                            onChange={(e) => updateEditingField('specifications', e.target.value)}
                            className={`text-xs sm:text-sm ${translation.language === 'ar' ? 'text-right' : 'text-left'}`}
                            dir={translation.language === 'ar' ? 'rtl' : 'ltr'}
                            rows={2}
                          />
                        </div>
                      )}
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button 
                          onClick={saveEdits} 
                          disabled={submitting}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                        >
                          {submitting ? <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin mr-1" /> : <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />}
                          <span className="text-xs sm:text-sm">{t('saveAndApprove')}</span>
                        </Button>
                        <Button 
                          onClick={cancelEditing} 
                          variant="outline" 
                          size="sm"
                          className="w-full sm:w-auto"
                        >
                          <X className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          <span className="text-xs sm:text-sm">{t('cancel')}</span>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // View mode
                    <div className="space-y-2 sm:space-y-3">
                      <div className="break-words">
                        <span className="font-medium text-xs sm:text-sm">{t('title')}: </span>
                        <span className={`text-xs sm:text-sm break-words ${translation.language === 'ar' ? 'text-right' : 'text-left'}`} dir={translation.language === 'ar' ? 'rtl' : 'ltr'}>
                          {translation.title}
                        </span>
                      </div>
                      <div className="break-words">
                        <span className="font-medium text-xs sm:text-sm">{t('description')}: </span>
                        <p className={`mt-1 text-xs sm:text-sm break-words ${translation.language === 'ar' ? 'text-right' : 'text-left'}`} dir={translation.language === 'ar' ? 'rtl' : 'ltr'}>
                          {translation.description}
                        </p>
                      </div>
                      {translation.specifications && (
                        <div className="break-words">
                          <span className="font-medium text-xs sm:text-sm">{t('specifications')}: </span>
                          <p className={`mt-1 text-xs sm:text-sm break-words ${translation.language === 'ar' ? 'text-right' : 'text-left'}`} dir={translation.language === 'ar' ? 'rtl' : 'ltr'}>
                            {typeof translation.specifications === 'object' 
                              ? JSON.stringify(translation.specifications, null, 2)
                              : translation.specifications}
                          </p>
                        </div>
                      )}
                      
                      {translation.status === 'DRAFT' && (
                        <div className="flex flex-col sm:flex-row gap-2 mt-3">
                          <Button 
                            onClick={() => startEditing(item.id, translation)}
                            size="sm"
                            variant="outline"
                            className="w-full sm:w-auto"
                          >
                            <Edit3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            <span className="text-xs sm:text-sm">{t('editAndApprove')}</span>
                          </Button>
                          <Button 
                            onClick={() => handleApproveTranslation(item.id, translation.language)}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                            disabled={submitting}
                          >
                            {submitting ? <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin mr-1" /> : <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />}
                            <span className="text-xs sm:text-sm">{t('approve')}</span>
                          </Button>
                          <Button 
                            onClick={() => {
                              const reason = prompt(t('enterRejectionReason'));
                              if (reason) {
                                handleRejectTranslation(item.id, translation.language, reason);
                              }
                            }}
                            size="sm"
                            variant="destructive"
                            disabled={submitting}
                            className="w-full sm:w-auto"
                          >
                            <XCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            <span className="text-xs sm:text-sm">{t('reject')}</span>
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
