import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { apiClient } from '@/lib/api/client';
import { toast } from 'sonner';
import type { User, RegisterData } from '@/types';

// Translation helper for auth store
const getTranslation = (key: string): string => {
  // Fallback translations for auth store
  const translations: Record<string, string> = {
    'emailVerifiedSuccessfully': 'Email verified successfully!',
    'verificationEmailSentSuccessfully': 'Verification email sent successfully!',
    'loggedOutSuccessfully': 'Logged out successfully!',
  };
  return translations[key] || key;
};

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  googleLogin: (idToken: string) => Promise<void>;
  linkGoogleAccount: (idToken: string) => Promise<void>;
  unlinkSocialAccount: (provider: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  logout: () => void;
  clearError: () => void; // Add back clearError function
  refreshAuth: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
  initializeAuth: () => void; // Add initialization method
  getToken: () => string | null;
}

const useAuthStoreBase = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,



      // Actions
      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });

          const response = await apiClient.post('/auth/login', { email, password }) as any;
          console.log('AuthStore: Raw login response:', response);
          console.log('AuthStore: Response type:', typeof response);
          console.log('AuthStore: Response keys:', Object.keys(response || {}));

          // Handle different response structures
          let user, token;
          
          if (response && typeof response === 'object') {
            // Direct response structure
            if (response.user && response.token) {
              user = response.user;
              token = response.token;
            }
            // Nested data structure
            else if (response.data && response.data.user && response.data.token) {
              user = response.data.user;
              token = response.data.token;
            }
            // If response itself has user properties (malformed structure)
            else if (response.id && response.email) {
              user = response;
              token = response.token || null;
            }
          }

          console.log('AuthStore: Extracted user:', user);
          console.log('AuthStore: Extracted token:', token ? 'Present (length: ' + token.length + ')' : 'Missing');

          if (!token) {
            console.error('AuthStore: No token found in response structure');
            throw new Error('No token received from server');
          }

          if (!user) {
            console.error('AuthStore: No user found in response structure');
            throw new Error('No user data received from server');
          }

          // Set token in both places
          apiClient.setAuthToken(token);

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          console.log('AuthStore: Login successful', { userId: user?.id, role: user?.role });
        } catch (error: any) {
          console.error('AuthStore: Login failed:', error);
          set({
            isLoading: false,
            error: error?.message || 'Login failed',
          });
          throw error;
        }
      },

      register: async (data: RegisterData) => {
        try {
          set({ isLoading: true, error: null });

          console.log('AuthStore: Sending registration data:', {
            ...data,
            password: '[HIDDEN]'
          });

          const response = await apiClient.post('/auth/register', data) as any;
          console.log('AuthStore: Register response:', response);

          // Handle nested data structure like in login
          let user, token;
          
          if (response && typeof response === 'object') {
            // Direct response structure
            if (response.user && response.token) {
              user = response.user;
              token = response.token;
            }
            // Nested data structure (expected format)
            else if (response.data && response.data.user && response.data.token) {
              user = response.data.user;
              token = response.data.token;
            }
          }

          if (!token) {
            throw new Error('No token received from server');
          }

          if (!user) {
            throw new Error('No user data received from server');
          }

          // Set token in both places
          apiClient.setAuthToken(token);

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          console.log('AuthStore: Registration successful', { userId: user?.id, role: user?.role });
        } catch (error: any) {
          console.error('AuthStore: Registration failed:', error);
          set({
            isLoading: false,
            error: error?.message || 'Registration failed',
          });
          throw error;
        }
      },

      googleLogin: async (idToken: string) => {
        try {
          set({ isLoading: true, error: null });

          console.log('AuthStore: Sending Google login request');

          const response = await apiClient.post('/auth/google', { idToken }) as any;
          console.log('AuthStore: Google login response:', response);

          // Handle nested data structure like in login
          let user, token;
          
          if (response && typeof response === 'object') {
            // Direct response structure
            if (response.user && response.token) {
              user = response.user;
              token = response.token;
            }
            // Nested data structure (expected format)
            else if (response.data && response.data.user && response.data.token) {
              user = response.data.user;
              token = response.data.token;
            }
          }

          if (!token) {
            throw new Error('No token received from server');
          }

          if (!user) {
            throw new Error('No user data received from server');
          }

          // Set token in both places
          apiClient.setAuthToken(token);

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          console.log('AuthStore: Google login successful', { userId: user?.id, role: user?.role });
        } catch (error: any) {
          console.error('AuthStore: Google login failed:', error);
          set({
            isLoading: false,
            error: error?.message || 'Google login failed',
          });
          throw error;
        }
      },

      linkGoogleAccount: async (idToken: string) => {
        try {
          set({ isLoading: true, error: null });

          console.log('AuthStore: Linking Google account');

          const response = await apiClient.post('/auth/link-google', { idToken }) as any;
          console.log('AuthStore: Link Google response:', response);

          // Handle nested data structure
          let user;
          
          if (response && typeof response === 'object') {
            // Direct response structure
            if (response.user) {
              user = response.user;
            }
            // Nested data structure (expected format)
            else if (response.data && response.data.user) {
              user = response.data.user;
            }
          }

          if (!user) {
            throw new Error('No user data received from server');
          }

          // Update user in store
          set({
            user,
            isLoading: false,
            error: null,
          });

          console.log('AuthStore: Google account linked successfully', { userId: user?.id });
        } catch (error: any) {
          console.error('AuthStore: Link Google account failed:', error);
          set({
            isLoading: false,
            error: error?.message || 'Failed to link Google account',
          });
          throw error;
        }
      },

      unlinkSocialAccount: async (provider: string) => {
        try {
          set({ isLoading: true, error: null });

          console.log('AuthStore: Unlinking social account:', provider);

          const response = await apiClient.post('/auth/unlink-social', { provider }) as any;
          console.log('AuthStore: Unlink social response:', response);

          // Handle nested data structure
          let user;
          
          if (response && typeof response === 'object') {
            // Direct response structure
            if (response.user) {
              user = response.user;
            }
            // Nested data structure (expected format)
            else if (response.data && response.data.user) {
              user = response.data.user;
            }
          }

          if (!user) {
            throw new Error('No user data received from server');
          }

          // Update user in store
          set({
            user,
            isLoading: false,
            error: null,
          });

          console.log('AuthStore: Social account unlinked successfully', { provider });
        } catch (error: any) {
          console.error('AuthStore: Unlink social account failed:', error);
          set({
            isLoading: false,
            error: error?.message || 'Failed to unlink social account',
          });
          throw error;
        }
      },

      verifyEmail: async (token: string) => {
        try {
          set({ isLoading: true, error: null });
          console.log('AuthStore: Verifying email with token');
          
          const response = await apiClient.post('/auth/verify-email', { token }) as any;
          console.log('AuthStore: Verify email response:', response);
          
          if (response.success && response.data.user) {
            set({
              user: response.data.user,
              isLoading: false,
              error: null,
            });
            console.log('AuthStore: Email verified successfully', { userId: response.data.user.id });
            toast.success(getTranslation('emailVerifiedSuccessfully'));
          } else {
            throw new Error(response.error?.message || 'Email verification failed');
          }
        } catch (error: any) {
          console.error('AuthStore: Email verification failed:', error);
          set({
            isLoading: false,
            error: error?.message || 'Failed to verify email',
          });
          throw error;
        }
      },

      resendVerificationEmail: async () => {
        try {
          set({ isLoading: true, error: null });
          console.log('AuthStore: Resending verification email');
          
          const response = await apiClient.post('/auth/resend-verification') as any;
          console.log('AuthStore: Resend verification response:', response);
          
          if (response.success) {
            set({
              isLoading: false,
              error: null,
            });
            console.log('AuthStore: Verification email sent successfully');
            toast.success(getTranslation('verificationEmailSentSuccessfully'));
          } else {
            throw new Error(response.error?.message || 'Failed to resend verification email');
          }
        } catch (error: any) {
          console.error('AuthStore: Resend verification email failed:', error);
          set({
            isLoading: false,
            error: error?.message || 'Failed to resend verification email',
          });
          throw error;
        }
      },

      logout: () => {
        console.log('AuthStore: Logging out');
        
        // Remove token from both places
        apiClient.removeAuthToken();
        
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });

        // Show logout success message
        toast.success(getTranslation('loggedOutSuccessfully'));

        // Redirect to home page after logout
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
      },

        clearError: () => {
          set({ error: null });
        },

      refreshAuth: async () => {
        try {
          const { token } = get();
          
          // First try to get token from Zustand state
          let authToken = token;
          
          // If no token in state, try API client
          if (!authToken) {
            authToken = apiClient.getToken();
          }
          
          if (!authToken) {
            console.log('AuthStore: No token found for refresh');
            return;
          }

          console.log('AuthStore: Refreshing auth with token');
          
          // Make sure API client has the token
          apiClient.setAuthToken(authToken);

          const response = await apiClient.get('/auth/me') as any;
          console.log('AuthStore: Received response from /auth/me:', response);
          
          const { user } = response;
          console.log('AuthStore: Extracted user data:', user);

          if (!user) {
            console.error('AuthStore: No user data in response');
            get().logout();
            return;
          }

          set({
            user,
            token: authToken, // Make sure we persist the token
            isAuthenticated: true,
            error: null,
          });
          
          console.log('AuthStore: Auth refresh completed successfully', {
            userId: user.id,
            role: user.role,
            name: user.firstName
          });
        } catch (error) {
          console.error('AuthStore: Token refresh failed:', error);
          // Token is invalid, logout
          get().logout();
        }
      },

      updateUser: (userData: Partial<User>) => {
        set(state => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }));
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      getToken: () => {
        const state = get();
        return state.token || apiClient.getToken();
      },

      initializeAuth: () => {
        const { token, user } = get();
        if (token && user) {
          console.log('AuthStore: Initializing with existing token');
          apiClient.setAuthToken(token);
        }
        
        // Listen for token expiration events
        if (typeof window !== 'undefined') {
          const handleTokenExpiration = () => {
            console.log('AuthStore: Token expiration event received');
            const { logout } = get();
            logout();
          };
          
          window.addEventListener('tokenExpired', handleTokenExpiration);
          
          // Cleanup listener on unmount (handled by the component using the store)
          return () => {
            window.removeEventListener('tokenExpired', handleTokenExpiration);
          };
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist essential auth data
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // When state is rehydrated from localStorage, initialize auth
        if (state) {
          console.log('AuthStore: State rehydrated, initializing auth');
          state.initializeAuth();
        }
      },
    }
  )
);

// Create the store with initialization
export const useAuthStore = useAuthStoreBase;

// Selector hooks for better performance
export const useUser = () => useAuthStore(state => state.user);
export const useIsAuthenticated = () => useAuthStore(state => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore(state => state.isLoading);
export const useAuthError = () => useAuthStore(state => state.error);

// Role-based selectors
export const useUserRole = () => useAuthStore(state => state.user?.role);
export const useIsBuyer = () => useAuthStore(state => state.user?.role === 'BUYER');
export const useIsSeller = () => useAuthStore(state => state.user?.role === 'SELLER');
export const useIsAdmin = () => useAuthStore(state => state.user?.role === 'ADMIN'); 