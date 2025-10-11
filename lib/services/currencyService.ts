export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
}

export interface CountryCurrencyInfo {
  countryCode: string;
  countryName: string;
  currency: CurrencyInfo;
}

export class CurrencyService {
  private static readonly API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  /**
   * Get all supported currencies
   */
  static async getAllCurrencies(): Promise<CurrencyInfo[]> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/currencies`);
      const data = await response.json();
      
      if (data.success) {
        return data.data.currencies;
      }
      return [];
    } catch (error) {
      console.error('Error fetching currencies:', error);
      return [];
    }
  }

  /**
   * Get currency for a specific country
   */
  static async getCurrencyForCountry(countryCode: string): Promise<CurrencyInfo | null> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/currencies/country/${countryCode}`);
      const data = await response.json();
      
      if (data.success) {
        return data.data.currency;
      }
      return null;
    } catch (error) {
      console.error('Error fetching currency for country:', error);
      return null;
    }
  }

  /**
   * Detect currency from location (city/country)
   */
  static async detectCurrencyFromLocation(city?: string, country?: string): Promise<CurrencyInfo | null> {
    try {
      const params = new URLSearchParams();
      if (city) params.append('city', city);
      if (country) params.append('country', country);

      const response = await fetch(`${this.API_BASE_URL}/currencies/detect?${params}`);
      const data = await response.json();
      
      if (data.success) {
        return data.data.currency;
      }
      return null;
    } catch (error) {
      console.error('Error detecting currency:', error);
      return null;
    }
  }

  /**
   * Search currencies by query
   */
  static async searchCurrencies(query: string): Promise<CountryCurrencyInfo[]> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/currencies/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (data.success) {
        return data.data.results;
      }
      return [];
    } catch (error) {
      console.error('Error searching currencies:', error);
      return [];
    }
  }

  /**
   * Get all country-currency mappings
   */
  static async getAllMappings(): Promise<CountryCurrencyInfo[]> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/currencies/mappings`);
      const data = await response.json();
      
      if (data.success) {
        return data.data.mappings;
      }
      return [];
    } catch (error) {
      console.error('Error fetching currency mappings:', error);
      return [];
    }
  }

  /**
   * Format price with currency symbol
   */
  static formatPrice(price: number, currency: CurrencyInfo): string {
    const formattedPrice = price.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });

    return `${currency.symbol} ${formattedPrice}`;
  }

  /**
   * Format price with currency code
   */
  static formatPriceWithCode(price: number, currency: CurrencyInfo): string {
    const formattedPrice = price.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });

    return `${currency.code} ${formattedPrice}`;
  }

  /**
   * Get currency info by code
   */
  static async getCurrencyInfo(currencyCode: string): Promise<CurrencyInfo | null> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/currencies/${currencyCode}`);
      const data = await response.json();
      
      if (data.success) {
        return data.data.currency;
      }
      return null;
    } catch (error) {
      console.error('Error fetching currency info:', error);
      return null;
    }
  }

  /**
   * Detect currency from seller's location data
   */
  static async detectCurrencyFromSellerLocation(locationData: {
    city?: string;
    area?: string;
    country?: string;
  }): Promise<CurrencyInfo | null> {
    try {
      // Try country first if available
      if (locationData.country) {
        const currency = await this.getCurrencyForCountry(locationData.country);
        if (currency) {
          return currency;
        }
      }

      // Try city if country not available or not found
      if (locationData.city) {
        const currency = await this.detectCurrencyFromLocation(locationData.city);
        if (currency) {
          return currency;
        }
      }

      // Default to AED
      return {
        code: 'AED',
        symbol: 'د.إ',
        name: 'UAE Dirham'
      };
    } catch (error) {
      console.error('Error detecting currency from seller location:', error);
      return {
        code: 'AED',
        symbol: 'د.إ',
        name: 'UAE Dirham'
      };
    }
  }
}

export default CurrencyService;
