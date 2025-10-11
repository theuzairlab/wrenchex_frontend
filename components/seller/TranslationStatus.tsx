'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { apiClient } from '@/lib/api/client';
import { useTranslations } from 'next-intl';
import { 
  Languages, 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertTriangle,
  Eye,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface TranslationStatusProps {
  entityType: 'product' | 'service' | 'category';
  entityId: string;
  compact?: boolean;
  showActions?: boolean;
  onStatusChange?: () => void;
}

interface TranslationInfo {
  language: 'en' | 'ar';
  status: 'DRAFT' | 'APPROVED' | 'REJECTED';
  isOriginal: boolean;
  autoTranslated: boolean;
  confidence?: number;
}

export default function TranslationStatus({ 
  entityType, 
  entityId, 
  compact = false,
  showActions = false,
  onStatusChange 
}: TranslationStatusProps) {
  const t = useTranslations('common.translations');
  const [translations, setTranslations] = useState<TranslationInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchTranslationStatus();
  }, [entityType, entityId]);

  const fetchTranslationStatus = async () => {
    try {
      setLoading(true);
      
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
      
      if (response?.success && response.data?.translations) {
        setTranslations(response.data.translations);
      }
    } catch (error) {
      console.error('Failed to fetch translation status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="w-3 h-3 text-green-600" />;
      case 'REJECTED':
        return <XCircle className="w-3 h-3 text-red-600" />;
      case 'DRAFT':
        return <Clock className="w-3 h-3 text-yellow-600" />;
      default:
        return <AlertTriangle className="w-3 h-3 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string, isOriginal: boolean) => {
    if (isOriginal) {
      return <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">Original</Badge>;
    }
    
    switch (status) {
      case 'APPROVED':
        return <Badge variant="default" className="text-xs bg-green-100 text-green-800">Approved</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive" className="text-xs">Rejected</Badge>;
      case 'DRAFT':
        return <Badge variant="secondary" className="text-xs">Pending</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">Unknown</Badge>;
    }
  };

  const getLanguageFlag = (language: 'en' | 'ar') => {
    return language === 'ar' ? '🇸🇦' : '🇺🇸';
  };

  const handleViewTranslations = () => {
    // This could open a modal or navigate to translation management page
    onStatusChange?.();
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-1">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-xs text-gray-500">Loading...</span>
      </div>
    );
  }

  if (translations.length === 0) {
    return (
      <div className="flex items-center space-x-1">
        <AlertTriangle className="w-4 h-4 text-gray-400" />
        <span className="text-xs text-gray-500">No translations</span>
      </div>
    );
  }

  const pendingCount = translations.filter(t => t.status === 'DRAFT' && !t.isOriginal).length;
  const approvedCount = translations.filter(t => t.status === 'APPROVED').length;
  const rejectedCount = translations.filter(t => t.status === 'REJECTED').length;

  if (compact) {
    return (
      <div className="flex items-center space-x-1">
        <Languages className="w-4 h-4 text-gray-500" />
        <div className="flex space-x-1">
          {translations.map((translation) => (
            <div key={translation.language} className="flex items-center space-x-1">
              <span className="text-xs">{getLanguageFlag(translation.language)}</span>
              {getStatusIcon(translation.status)}
            </div>
          ))}
        </div>
        {pendingCount > 0 && (
          <Badge variant="secondary" className="text-xs px-1 py-0">
            {pendingCount} pending
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Languages className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium">Translations</span>
        </div>
        {showActions && (
          <Button
            onClick={handleViewTranslations}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            <Eye className="w-3 h-3 mr-1" />
            View
          </Button>
        )}
      </div>

      <div className="space-y-1">
        {translations.map((translation) => (
          <div key={translation.language} className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <span>{getLanguageFlag(translation.language)}</span>
              <span className="font-medium">{translation.language.toUpperCase()}</span>
              {translation.autoTranslated && (
                <span className="text-gray-500">(Auto)</span>
              )}
              {translation.confidence && (
                <span className="text-gray-500">
                  {Math.round(translation.confidence * 100)}%
                </span>
              )}
            </div>
            {getStatusBadge(translation.status, translation.isOriginal)}
          </div>
        ))}
      </div>

      {(pendingCount > 0 || rejectedCount > 0) && (
        <div className="text-xs text-gray-600 bg-yellow-50 p-2 rounded border-l-2 border-yellow-400">
          {pendingCount > 0 && (
            <div>⏳ {pendingCount} translation(s) pending review</div>
          )}
          {rejectedCount > 0 && (
            <div>❌ {rejectedCount} translation(s) rejected</div>
          )}
        </div>
      )}
    </div>
  );
}
