import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Shop role mapping utility
export function getShopRoleLabel(shopRole: string | null | undefined, customShopRole?: string | null): string {
  if (!shopRole || shopRole.trim() === '') return 'Shop Owner'; // Default fallback

  switch (shopRole) {
    case 'shop_owner':
      return 'Shop Owner';
    case 'manager':
      return 'Manager';
    case 'mechanic':
      return 'Mechanic';
    case 'technician':
      return 'Technician';
    case 'sales_representative':
      return 'Sales Representative';
    case 'other':
      return customShopRole || 'Other';
    default:
      return shopRole;
  }
}

export function getConditionLabel(condition: string | null | undefined): string {
  if (!condition || condition.trim() === '') return 'New'; // Default fallback

  switch (condition.toLowerCase()) {
    case 'new':
      return '🆕 New';
    case 'like_new':
      return '✨ Like New';
    case 'good':
      return '✅ Good';
    case 'fair':
      return '⚠️ Fair';
    case 'poor':
      return '🔧 Poor';
    case 'refurbished':
      return '🔄 Refurbished';
    case 'used':
      return '📦 Used';
    default:
      return condition;
  }
}


export function formatPrice(price: number, currency: string = 'AED', locale: string = 'en') {
  // Currency symbol mapping for different locales
  const currencySymbols: Record<string, Record<string, string>> = {
    'en': {
      'AED': 'AED',
      'USD': '$',
      'PKR': '₨',
      'EUR': '€',
      'GBP': '£',
      'SAR': 'SAR',
      'KWD': 'KWD',
      'QAR': 'QAR',
      'BHD': 'BHD',
      'OMR': 'OMR',
      'JOD': 'JOD',
      'LBP': 'LBP',
      'EGP': 'EGP',
      'INR': '₹',
      'BDT': '৳',
      'LKR': 'LKR',
      'NPR': 'NPR',
      'AFN': '؋',
      'CAD': 'C$',
      'AUD': 'A$',
      'NZD': 'NZ$',
      'SGD': 'S$',
      'MYR': 'RM',
      'THB': '฿',
      'PHP': '₱',
      'IDR': 'Rp',
      'VND': '₫',
      'KRW': '₩',
      'JPY': '¥',
      'CNY': '¥',
      'ZAR': 'R',
      'NGN': '₦',
      'KES': 'KSh'
    },
    'ar': {
      'AED': 'د.إ',
      'USD': '$',
      'PKR': '₨',
      'EUR': '€',
      'GBP': '£',
      'SAR': 'ر.س',
      'KWD': 'د.ك',
      'QAR': 'ر.ق',
      'BHD': 'د.ب',
      'OMR': 'ر.ع',
      'JOD': 'د.ا',
      'LBP': 'ل.ل',
      'EGP': 'ج.م',
      'INR': '₹',
      'BDT': '৳',
      'LKR': '₨',
      'NPR': '₨',
      'AFN': '؋',
      'CAD': 'C$',
      'AUD': 'A$',
      'NZD': 'NZ$',
      'SGD': 'S$',
      'MYR': 'RM',
      'THB': '฿',
      'PHP': '₱',
      'IDR': 'Rp',
      'VND': '₫',
      'KRW': '₩',
      'JPY': '¥',
      'CNY': '¥',
      'ZAR': 'R',
      'NGN': '₦',
      'KES': 'KSh'
    }
  };

  const localeSymbols = currencySymbols[locale] || currencySymbols['en'];
  const symbol = localeSymbols[currency] || currency;
  
  // Format number based on locale
  const formattedPrice = price.toLocaleString(locale === 'ar' ? 'ar-AE' : 'en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });

  return `${symbol} ${formattedPrice}`;
}