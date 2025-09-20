// Chat System Types
export type MessageType = 'TEXT' | 'IMAGE' | 'PRICE_OFFER';

export interface ProductChat {
  id: string;
  productId: string;
  buyerId: string;
  sellerId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  product: {
    id: string;
    title: string;
    price: number;
    images?: any;
  };
  buyer: {
    id: string;
    firstName: string;
    lastName: string;
  };
  seller: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  messages: ProductMessage[];
  unreadCount?: number;
}

export interface ProductMessage {
  id: string;
  chatId: string;
  senderId: string;
  message: string;
  messageType: MessageType;
  isRead: boolean;
  createdAt: string;
  sender: {
    firstName: string;
    lastName: string;
  };
}

export interface StartChatData {
  productId: string;
  message: string;
}

export interface SendMessageData {
  chatId: string;
  message: string;
  messageType?: MessageType;
}

export interface SellerChatSettings {
  id: string;
  sellerId: string;
  showPhone: boolean;
  autoReplyText?: string;
  isOnline: boolean;
  lastSeen?: string;
}

// User and Authentication Types
export type UserRole = 'ADMIN' | 'SELLER' | 'BUYER';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone?: string;
  isVerified: boolean;
  googleId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  isVerified: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  // Seller-specific fields
  shopName?: string;
  shopAddress?: string;
  city?: string;
  area?: string;
  latitude?: number;
  longitude?: number;
  businessType?: string;
  description?: string;
}

export interface GoogleAuthData {
  googleToken: string;
}

// Seller Types
export interface Seller {
  id: string;
  userId: string;
  shopName: string;
  businessType?: string;
  shopDescription?: string;
  shopAddress: string;
  city: string;
  area: string;
  latitude?: number;
  longitude?: number;
  isApproved: boolean;
  subscriptionPlan?: string;
  subscriptionExpiresAt?: string;
  ratingAverage?: number;
  ratingCount: number;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export interface SellerRegistrationData {
  shopName: string;
  businessType?: string;
  shopDescription?: string;
  shopAddress: string;
  city: string;
  area: string;
  latitude?: number;
  longitude?: number;
  contactPhone?: string;
  businessLicense?: string;
}

// Seller Dashboard Types
export interface SellerStats {
  totalProducts: number;
  totalServices: number;
  totalOrders: number;
  totalAppointments: number;
  monthlyEarnings: number;
}

export interface SellerDashboardData {
  seller: {
    id: string;
    shopName: string;
    businessType?: string;
    shopDescription?: string;
    shopAddress?: string;
    city?: string;
    area?: string;
    latitude?: number;
    longitude?: number;
    isApproved: boolean;
    ratingAverage: number;
    ratingCount: number;
    createdAt: string;
  };
  stats: SellerStats;
  recentOrders: SellerOrder[];
  recentAppointments: SellerAppointment[];
}

export interface SellerOrder {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  buyer: {
    firstName: string;
    lastName: string;
    email: string;
  };
  orderItems: SellerOrderItem[];
}

export interface SellerOrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    title: string;
    images?: string[];
  };
}

export interface SellerAppointment {
  id: string;
  scheduledAt: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  buyer: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  service: {
    title: string;
    price: number;
    durationMinutes: number;
  };
}

export interface SellerEarnings {
  totalEarnings: number;
  ordersEarnings: number;
  appointmentsEarnings: number;
  currency: string;
}

// Appointment Types
export interface Appointment {
  id: string;
  appointmentNumber: string;
  buyerId: string;
  sellerId: string;
  serviceId: string;
  scheduledDate: string;
  scheduledTimeStart: string;
  scheduledTimeEnd: string;
  status: AppointmentStatus;
  totalAmount: number;
  notes?: string;
  serviceLocation?: {
    type: 'CUSTOMER_LOCATION' | 'SHOP_LOCATION';
    address?: string;
  };
  createdAt: string;
  updatedAt: string;
  
  // Relations
  buyer?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  seller?: {
    id: string;
    shopName: string;
    user?: {
      id: string;
      firstName: string;
      lastName: string;
      phone?: string;
    };
  };
  service?: {
    id: string;
    title: string;
    price: number;
    durationMinutes: number;
  };
}

export interface AppointmentFilters {
  buyerId?: string;
  sellerId?: string;
  serviceId?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
  limit?: number;
  page?: number;
}





// Category Types
export interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  imageUrl?: string;
  isActive: boolean;
  productCount?: number; // Number of products in this category
  createdAt: string;
  updatedAt: string;
  parent?: Category;
  children?: Category[];
}

// Enhanced Product Types for E-commerce
export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
  order: number;
}

export interface ProductSpecification {
  id: string;
  name: string;
  value: string;
  unit?: string;
}

export interface Product {
  id: string;
  sellerId: string;
  categoryId: string;
  title: string; // keeping 'title' for backward compatibility
  name?: string; // additional name field
  description: string;
  price: number;
  originalPrice?: number;
  sku?: string;
  brand?: string;
  model?: string;
  year?: number;
  condition?: 'NEW' | 'USED' | 'REFURBISHED';
  availability?: 'IN_STOCK' | 'OUT_OF_STOCK' | 'LOW_STOCK';
  minOrderQuantity?: number;
  maxOrderQuantity?: number;
  images?: string[]; // keeping for backward compatibility
  productImages?: ProductImage[]; // enhanced images
  specifications?: Record<string, any>; // keeping for backward compatibility
  productSpecs?: ProductSpecification[]; // enhanced specifications
  tags?: string[];
  weight?: number;
  shopAddress?: string;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  warranty?: string;
  shippingInfo?: {
    freeShipping: boolean;
    shippingCost?: number;
    estimatedDelivery?: string;
  };
  isActive: boolean;
  isFlagged: boolean;
  isFeatured?: boolean;
  ratingAverage?: number;
  ratingCount: number;
  viewCount?: number;
  createdAt: string;
  updatedAt: string;
  seller: {
    id: string;
    shopName: string;
    shopAddress?: string;
    city: string;
    area: string;
    latitude?: number;
    longitude?: number;
    ratingAverage?: number;
    ratingCount: number;
    user?: {
      id: string;
      firstName: string;
      lastName: string;
      phone?: string;
    };
  };
  category: Category;
}

// Enhanced Product Search & Filtering
export interface ProductFilters {
  category?: string;
  categoryId?: string;
  sellerId?: string;
  search?: string;
  q?: string; // alternative search param
  city?: string;
  area?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  condition?: string;
  availability?: string;
  location?: string;
  tags?: string[];
  sortBy?: 'price' | 'newest' | 'rating' | 'popularity' | 'title';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  isActive?: boolean;
}

export interface ProductSearchResult {
  products: Product[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface CreateProductData {
  title: string;
  description: string;
  categoryId: string;
  price: number;
  specifications?: Record<string, string>;
  images?: string[]; 
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id: string;
  isActive?: boolean;
}

// Shopping Cart Types
export interface CartItem {
  id: string;
  productId: string;
  product: Pick<Product, 'id' | 'title' | 'price' | 'images' | 'seller'>;
  quantity: number;
  price: number; // price at time of adding to cart
  addedAt: string;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  updatedAt: string;
}

// Service Types
export interface Service {
  id: string;
  sellerId: string;
  categoryId: string;
  title: string;
  description: string;
  price: number;
  durationMinutes: number;
  isMobileService: boolean;
  images?: string[];
  isActive: boolean;
  ratingAverage?: number;
  ratingCount: number;
  createdAt: string;
  updatedAt: string;
  seller: Seller;
  category: Category;
}

export interface ServiceFilters {
  categoryId?: string;
  sellerId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  isMobileService?: boolean;
  city?: string;
  area?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  isActive?: boolean;
}

export interface CreateServiceData {
  title: string;
  description: string;
  categoryId: string;
  price: number;
  durationMinutes: number;
  isMobileService: boolean;
  images?: string[];
}

export interface UpdateServiceData extends CreateServiceData {
  id: string;
  isActive?: boolean;
}

export interface ServiceSearchResult {
  services: Service[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Cart Types
export interface CartItem {
  id: string;
  buyerId: string;
  productId: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  product: Pick<Product, 'id' | 'title' | 'price' | 'images' | 'seller'>;
}

export interface CartSummary {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  hasOutOfStockItems: boolean;
}

export interface AddToCartData {
  productId: string;
  quantity: number;
}

// Order Types
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type PaymentMethod = 'COD' | 'DIGITAL_PAYMENT';

export interface Order {
  id: string;
  orderNumber: string;
  buyerId: string;
  sellerId: string;
  status: OrderStatus;
  totalAmount: number;
  deliveryAddress: Record<string, any>;
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  buyer: User;
  seller: Seller;
  orderItems: OrderItem[];
  statusHistory?: OrderStatusHistory[];
  messages?: OrderMessage[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: string;
  product: Product;
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  status: OrderStatus;
  notes?: string;
  changedBy: string;
  changedAt: string;
  changedByUser: User;
}

export interface OrderMessage {
  id: string;
  orderId: string;
  senderId: string;
  receiverId: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  sender: User;
  receiver: User;
}

export interface CreateOrderData {
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface OrderFilters {
  status?: OrderStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// Appointment Types
export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  IN_PROGRESS = 'IN_PROGRESS'
}

export interface AppointmentFilters {
  status?: string;
  page?: number;
  limit?: number;
}



export interface AppointmentStatusHistory {
  id: string;
  appointmentId: string;
  status: AppointmentStatus;
  notes?: string;
  changedBy: string;
  changedAt: string;
  changedByUser: User;
}

export interface AppointmentMessage {
  id: string;
  appointmentId: string;
  senderId: string;
  receiverId: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  sender: User;
  receiver: User;
}

export interface CreateAppointmentData {
  serviceId: string;
  scheduledDate: string;
  scheduledTimeStart: string;
  scheduledTimeEnd: string;
  serviceLocation?: {
    address: string;
    latitude?: number;
    longitude?: number;
    type: 'CUSTOMER_LOCATION' | 'SHOP_LOCATION';
  };
  notes?: string;
}



export interface AppointmentSearchResult {
  appointments: Appointment[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface AvailableTimeSlot {
  start: string;
  end: string;
  available: boolean;
}

export interface SellerAppointmentAnalytics {
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  totalRevenue: number;
  averageRating: number;
  monthlyStats: {
    month: string;
    appointments: number;
    revenue: number;
  }[];
}

// Availability Types
export interface SellerAvailability {
  id: string;
  sellerId: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  startTime: string; // Format: "HH:MM"
  endTime: string; // Format: "HH:MM"
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SellerTimeOff {
  id: string;
  sellerId: string;
  startDate: string;
  endDate: string;
  reason?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SetAvailabilityData {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface WeeklyScheduleData {
  weeklySchedule: SetAvailabilityData[];
}

export interface AddTimeOffData {
  startDate: string;
  endDate: string;
  reason?: string;
}

// Review Types
export interface Review {
  id: string;
  reviewerId: string;
  revieweeId: string;
  orderId?: string;
  appointmentId?: string;
  rating: number; // 1-5
  comment?: string;
  createdAt: string;
  updatedAt: string;
  reviewer: User;
  reviewee: User;
  order?: Order;
  appointment?: Appointment;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Component Props Types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
}

export interface FormState<T = any> extends LoadingState {
  data?: T;
  isDirty?: boolean;
  isValid?: boolean;
}

// Navigation Types
export interface NavigationItem {
  name: string;
  href: string;
  icon?: React.ComponentType<any>;
  badge?: string | number;
  isActive?: boolean;
}

export interface BreadcrumbItem {
  name: string;
  href?: string;
  current?: boolean;
}

// Search and Filter Types
export interface SearchFilters {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
}

// Upload Types
export interface UploadResponse {
  fileId: string;
  url: string;
  name: string;
  size: number;
  type: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

// Analytics Types
export interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalServices: number;
  revenueGrowth: number;
  ordersGrowth: number;
  topProducts: Product[];
  topServices: Service[];
  recentOrders: Order[];
  recentAppointments: Appointment[];
}

// Notification Types
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

// Theme and Locale Types
export type Theme = 'light' | 'dark' | 'system';
export type Locale = 'en' | 'ar';

export interface AppSettings {
  theme: Theme;
  locale: Locale;
  notifications: boolean;
  emailNotifications: boolean;
}

// Error Types
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

// Utility Types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

// API Response Types  
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
} 