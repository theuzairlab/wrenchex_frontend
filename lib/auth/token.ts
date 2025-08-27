// lib/auth/token.ts
export async function getToken(): Promise<string> {
    // Implement token retrieval logic
    // This could be from:
    // - localStorage
    // - Cookies
    // - A server-side session
    // - Calling a token refresh endpoint
    const token = localStorage.getItem('wrench_auth_token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }
  
    return token;
  }