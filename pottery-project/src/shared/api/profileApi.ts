import type { UserProfile, ApiResponse } from './types/UserProfile';

const API_BASE_URL = 'http://localhost:8080/api';
const AccessToken = localStorage.getItem('accessToken');

const createHeaders = (token = AccessToken): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

async function fetchWithLog<T>(
  url: string,
  options: RequestInit,
  token = AccessToken
): Promise<ApiResponse<T>> {
  const fullUrl = `${API_BASE_URL}${url}`;
  
  console.log('🚀 API Request:', {
    method: options.method,
    url: fullUrl,
    headers: options.headers,
    body: options.body ? JSON.parse(options.body as string) : undefined,
    token: AccessToken, 
    timestamp: new Date().toISOString()
  });

  try {
    const startTime = performance.now();
    const response = await fetch(fullUrl, options);
    const endTime = performance.now();

    const data = await response.json();

    console.log('✅ API Response:', {
      method: options.method,
      url: fullUrl,
      status: response.status,
      statusText: response.statusText,
      duration: `${(endTime - startTime).toFixed(2)}ms`,
      timestamp: new Date().toISOString()
    });

    return {
      data: data.data || data,
      status: response.status,
      message: data.message || response.statusText,
    };
  } catch (error) {
    console.error('❌ API Error:', {
      method: options.method,
      url: fullUrl,
      error: error instanceof Error ? error.message : error,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
}

export const profileApi = {
  /**
   * Получить профиль текущего пользователя
   * GET http://localhost:8080/api/me/profile
   */
  // ✅ Исправлено: token?: string
  getProfile: async (token = AccessToken): Promise<ApiResponse<UserProfile>> => {
    return fetchWithLog<UserProfile>(
      '/me/profile',
      {
        method: 'GET',
        headers: createHeaders(token),
      },
      token
    );
  },

  updateProfile: async (
    data: Partial<UserProfile>,
    token = AccessToken  
  ): Promise<ApiResponse<UserProfile>> => {
    return fetchWithLog<UserProfile>(
      '/me/profile',
      {
        method: 'PUT',
        headers: createHeaders(token),
        body: JSON.stringify(data),
      },
      token
    );
  }
};