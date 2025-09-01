import { 
  ApiResponse, 
  Product, 
  Category, 
  ProductFilters, 
  ProductSearchResult,
  CreateProductData,
  UpdateProductData,
  Service,
  ServiceFilters,
  ServiceSearchResult,
  CreateServiceData,
  UpdateServiceData,
  Appointment,
  AppointmentFilters,
  CreateAppointmentData,
  LoginCredentials,
  RegisterData,
  AuthUser,
  ProductChat,
  ProductMessage,
  StartChatData,
  SendMessageData,
  SellerChatSettings,
  MessageType
} from '@/types';

interface RequestConfig extends RequestInit {
  baseURL?: string;
}

class APIClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  setAuthToken(token: string | null): void {
    if (typeof window === 'undefined') return;
    
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  getToken(): string | null {
    return this.getAuthToken();
  }

  removeAuthToken(): void {
    this.setAuthToken(null);
  }

  private async request<T = any>(
    endpoint: string, 
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const url = `${config.baseURL || this.baseURL}${endpoint}`;
    const token = this.getAuthToken();
    
    const requestConfig: RequestInit = {
      ...config,
      headers: {
      ...this.defaultHeaders,
        ...(token && { Authorization: `Bearer ${token}` }),
        ...config.headers,
      },
    };

    try {
      const response = await fetch(url, requestConfig);
      
      const contentType = response.headers.get('content-type');
      let data: any;
      
      try {
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          const textData = await response.text();
          // Try to parse as JSON first, fallback to text
          try {
            data = JSON.parse(textData);
          } catch {
            data = { message: textData };
          }
        }
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        data = { error: { message: 'Invalid response format' } };
      }

      if (!response.ok) {
        const errorMessage = data?.error?.message || data?.message || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }

      return data;
    } catch (error: any) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // HTTP Methods
  async get<T = any>(endpoint: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  async post<T = any>(endpoint: string, data?: any, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T = any>(endpoint: string, data?: any, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T = any>(endpoint: string, data?: any, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T = any>(endpoint: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }

  // ===== AUTHENTICATION =====
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: AuthUser; token: string }>> {
    return this.post('/auth/login', credentials);
  }

  async register(userData: RegisterData): Promise<ApiResponse<{ user: AuthUser; token: string }>> {
    return this.post('/auth/register', userData);
  }

  async logout(): Promise<ApiResponse<null>> {
    return this.post('/auth/logout');
  }

  async getMe(): Promise<ApiResponse<AuthUser>> {
    return this.get('/auth/me');
  }

  // ===== CATEGORIES =====
  async getCategories(): Promise<ApiResponse<Category[]>> {
    return this.get('/categories');
  }

  async getCategoryById(id: string): Promise<ApiResponse<Category>> {
    return this.get(`/categories/${id}`);
  }

  // ===== PRODUCTS =====
  async getProducts(filters: ProductFilters = {}): Promise<ApiResponse<ProductSearchResult>> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const endpoint = queryString ? `/products?${queryString}` : '/products';
    
    return this.get(endpoint);
  }

  async searchProducts(query: string, options: { limit?: number } = {}): Promise<ApiResponse<ProductSearchResult>> {
    const params = new URLSearchParams();
    params.append('search', query);
    if (options.limit) {
      params.append('limit', options.limit.toString());
    }
    return this.get(`/products?${params.toString()}`);
  }

  async getFeaturedProducts(limit = 8): Promise<ApiResponse<Product[]>> {
    return this.get(`/products/featured?limit=${limit}`);
  }

  async getProductById(id: string): Promise<ApiResponse<Product>> {
    return this.get(`/products/${id}`);
  }

  async getRelatedProducts(productId: string, limit = 4): Promise<ApiResponse<Product[]>> {
    return this.get(`/products/${productId}/related?limit=${limit}`);
  }

  async getMyProducts(filters: ProductFilters = {}): Promise<ApiResponse<ProductSearchResult>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
    const queryString = params.toString();
    const endpoint = queryString ? `/sellers/products?${queryString}` : '/sellers/products';
    return this.get(endpoint);
  }

  async createProduct(productData: CreateProductData): Promise<ApiResponse<Product>> {
    return this.post('/products', productData);
  }

  async updateProduct(productData: UpdateProductData): Promise<ApiResponse<Product>> {
    return this.put(`/products/${productData.id}`, productData);
  }

  async toggleProductStatus(id: string): Promise<ApiResponse<any>> {
    return this.patch(`/products/${id}/toggle-status`, {});
  }

  async deleteProduct(id: string): Promise<ApiResponse<null>> {
    return this.delete(`/products/${id}`);
  }

  // ===== SERVICES =====
  async getServices(filters: ServiceFilters = {}): Promise<ApiResponse<ServiceSearchResult>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
    const queryString = params.toString();
    const endpoint = queryString ? `/services?${queryString}` : '/services';
    return this.get(endpoint);
  }

  async getServiceById(id: string): Promise<ApiResponse<Service>> {
    return this.get(`/services/${id}`);
  }

  async createService(serviceData: CreateServiceData): Promise<ApiResponse<Service>> {
    return this.post('/services', serviceData);
  }

  async updateService(serviceData: UpdateServiceData): Promise<ApiResponse<Service>> {
    return this.put(`/services/${serviceData.id}`, serviceData);
  }

  async toggleServiceStatus(id: string): Promise<ApiResponse<any>> {
    return this.patch(`/services/${id}/toggle-status`, {});
  }

  async deleteService(id: string): Promise<ApiResponse<null>> {
    return this.delete(`/services/${id}`);
  }

  // ===== SELLER DASHBOARD =====
  async getSellerDashboard(): Promise<ApiResponse<any>> {
    return this.get('/sellers/dashboard');
  }

  async getSellerProfile(): Promise<ApiResponse<any>> {
    return this.get('/sellers/profile');
  }

  async getSellerEarnings(): Promise<ApiResponse<any>> {
    return this.get('/sellers/earnings');
  }

  async updateSellerProfile(profileData: any): Promise<ApiResponse<any>> {
    return this.put('/sellers/profile', profileData);
  }

  async getSellerAppointments(filters: any): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
    const queryString = params.toString();
    const endpoint = queryString ? `/appointments?${queryString}` : '/appointments';
    return this.get(endpoint);
  }

  async updateAppointmentStatus(
    appointmentId: string, 
    status: string, 
    notes?: string
  ): Promise<ApiResponse<any>> {
    return this.put(`/appointments/${appointmentId}/status`, { status, notes });
  }





  

  // ===== SERVICES =====
  async getSellerServices(filters: any = {}): Promise<ApiResponse<any>> {
    const queryString = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryString.append(key, String(value));
      }
    });
    const endpoint = queryString.toString() ? `/sellers/services?${queryString}` : '/sellers/services';
    return this.get(endpoint);
  }

  async getServiceCategories(): Promise<ApiResponse<any>> {
    return this.get('/services/categories');
  }

  async searchServices(query: string, options: { limit?: number } = {}): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    params.append('search', query);
    if (options.limit) {
      params.append('limit', options.limit.toString());
    }
    return this.get(`/services?${params.toString()}`);
  }

  async searchServicesNearLocation(
    latitude: number, 
    longitude: number, 
    radiusKm: number = 10,
    filters: ServiceFilters = {}
  ): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    params.append('latitude', latitude.toString());
    params.append('longitude', longitude.toString());
    params.append('radiusKm', radiusKm.toString());
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    return this.get(`/services/near?${params.toString()}`);
  }



  // ===== AVAILABILITY =====
  async getMySchedule(): Promise<ApiResponse<any>> {
    return this.get('/availability/my-schedule');
  }

  async getMyTimeOff(): Promise<ApiResponse<any>> {
    return this.get('/availability/my-timeoff');
  }

  async getMyCalendar(): Promise<ApiResponse<any>> {
    return this.get('/availability/my-calendar');
  }

  async setWeeklyAvailability(schedule: any): Promise<ApiResponse<any>> {
    return this.post('/availability/weekly', schedule);
  }

  async setDayAvailability(daySchedule: any): Promise<ApiResponse<any>> {
    return this.post('/availability/day', daySchedule);
  }

  async addTimeOff(timeOff: any): Promise<ApiResponse<any>> {
    return this.post('/availability/timeoff', timeOff);
  }

  async updateTimeOff(timeOffId: string, timeOff: any): Promise<ApiResponse<any>> {
    return this.put(`/availability/timeoff/${timeOffId}`, timeOff);
  }

  async deleteTimeOff(timeOffId: string): Promise<ApiResponse<any>> {
    return this.delete(`/availability/timeoff/${timeOffId}`);
  }

  // ===== CHAT =====
  async startProductChat(data: StartChatData): Promise<ApiResponse<ProductChat>> {
    return this.post(`/chat/product/${data.productId}/start`, { message: data.message });
  }

  async sendMessage(chatId: string, data: SendMessageData): Promise<ApiResponse<ProductMessage>> {
    return this.post(`/chat/${chatId}/send`, data);
  }

  async sendChatMessage(chatId: string, message: string, messageType: MessageType = 'TEXT' as MessageType): Promise<ApiResponse<ProductMessage>> {
    return this.post(`/chat/${chatId}/send`, { message, messageType });
  }

  async getChatMessages(chatId: string): Promise<ApiResponse<{ messages: ProductMessage[] }>> {
    return this.get(`/chat/${chatId}`);
  }

  async getChatById(chatId: string): Promise<ApiResponse<{ chat: ProductChat }>> {
    return this.get(`/chat/${chatId}`);
  }

  async getUserChats(): Promise<ApiResponse<{ chats: ProductChat[] }>> {
    return this.get('/chat/conversations');
  }

  async getUnreadChatCount(): Promise<ApiResponse<{ count: number }>> {
    return this.get('/chat/unread-count');
  }

  async markChatAsRead(chatId: string): Promise<ApiResponse<null>> {
    return this.put(`/chat/${chatId}/read`, {});
  }

  async getSellerChatSettings(): Promise<ApiResponse<SellerChatSettings>> {
    return this.get('/chat/settings');
  }

  async updateSellerChatSettings(settings: Partial<SellerChatSettings>): Promise<ApiResponse<SellerChatSettings>> {
    return this.put('/chat/settings', settings);
  }

  async toggleSellerOnlineStatus(): Promise<ApiResponse<{ isOnline: boolean }>> {
    return this.post('/chat/toggle-status', {});
  }

  // ===== APPOINTMENTS =====
  async getAppointments(filters: AppointmentFilters = {}): Promise<ApiResponse<Appointment[]>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
    const queryString = params.toString();
    const endpoint = queryString ? `/appointments?${queryString}` : '/appointments';
    return this.get(endpoint);
  }

  async createAppointment(appointmentData: CreateAppointmentData): Promise<ApiResponse<Appointment>> {
    return this.post('/appointments', appointmentData);
  }

  async updateAppointment(id: string, appointmentData: Partial<CreateAppointmentData>): Promise<ApiResponse<Appointment>> {
    return this.put(`/appointments/${id}`, appointmentData);
  }

  async deleteAppointment(id: string): Promise<ApiResponse<null>> {
    return this.delete(`/appointments/${id}`);
  }

  // ===== PROFILE =====
  async updateProfile(profileData: any): Promise<ApiResponse<AuthUser>> {
    return this.put('/users/profile', profileData);
  }

  // ===== ADMIN ENDPOINTS =====
  async getAdminStats(): Promise<ApiResponse<any>> {
    return this.get('/admin/stats');
  }

  async getAdminUsers(filters: {
    role?: string;
    search?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
    const queryString = params.toString();
    const endpoint = queryString ? `/admin/users?${queryString}` : '/admin/users';
    return this.get(endpoint);
  }

  async getAdminSellers(filters: {
    isApproved?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
    const queryString = params.toString();
    const endpoint = queryString ? `/admin/sellers?${queryString}` : '/admin/sellers';
    return this.get(endpoint);
  }

  async updateSellerApproval(sellerId: string, isApproved: boolean): Promise<ApiResponse<any>> {
    return this.put(`/admin/sellers/${sellerId}/approval`, { isApproved });
  }

  async getAdminChats(filters: {
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
    const queryString = params.toString();
    const endpoint = queryString ? `/admin/chats?${queryString}` : '/admin/chats';
    return this.get(endpoint);
  }

  async deleteAdminChat(chatId: string): Promise<ApiResponse<any>> {
    return this.delete(`/admin/chats/${chatId}`);
  }

  async getAdminAppointments(filters: {
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
    const queryString = params.toString();
    const endpoint = queryString ? `/admin/appointments?${queryString}` : '/admin/appointments';
    return this.get(endpoint);
  }
}

// Export singleton instance
export const apiClient = new APIClient();
export default apiClient;