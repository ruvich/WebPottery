import type { Solution } from './types/solutionsApi';

const API_BASE_URL = 'http://localhost:8080/api';

const getToken = (): string | undefined => {
  return localStorage.getItem('accessToken') || undefined;
};

const createHeaders = (token?: string): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('🔑 Token added to headers:', token.substring(0, 20) + '...');
  } else {
    console.warn('⚠️ No token provided for API request');
  }
  
  return headers;
};

async function fetchWithLog<T>(
  url: string,
  options: RequestInit,
  token?: string
): Promise<T> {
  const fullUrl = `${API_BASE_URL}${url}`;
  
  console.group(`🌐 API Request: ${options.method} ${url}`);
  console.log('Full URL:', fullUrl);
  console.log('Headers:', options.headers);
  console.log('Token present:', !!token);
  console.log('Timestamp:', new Date().toISOString());
  console.groupEnd();

  try {
    const startTime = performance.now();
    const response = await fetch(fullUrl, options);
    const endTime = performance.now();

    console.group(`📦 API Response: ${options.method} ${url}`);
    console.log('Status:', response.status, response.statusText);
    console.log('Duration:', `${(endTime - startTime).toFixed(2)}ms`);
    console.log('OK:', response.ok);
    console.groupEnd();

    if (!response.ok) {
      let errorText = '';
      try {
        const errorData = await response.json();
        errorText = errorData.message || errorData.error || JSON.stringify(errorData);
      } catch {
        errorText = await response.text();
      }
      
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    console.group('📊 Response Data');
    console.log('Data type:', Array.isArray(data) ? 'array' : typeof data);
    console.log('Data length:', Array.isArray(data) ? data.length : 'N/A');
    console.log('Sample:', Array.isArray(data) ? data[0] : data);
    console.groupEnd();

    return data;
  } catch (error) {
    console.group('❌ API Error');
    console.error('URL:', fullUrl);
    console.error('Method:', options.method);
    console.error('Error:', error instanceof Error ? error.message : error);
    console.error('Timestamp:', new Date().toISOString());
    console.groupEnd();
    
    throw error;
  }
}

export const solutionsListApi = {
  /**
   * Получить список решений для задания
   * GET /api/posts/{postId}/solutions
   */
  getSolutionsByPostId: async (
    params: { postId: string; status?: 'DRAFT' | 'SUBMITTED' },
    customToken?: string
  ): Promise<Solution[]> => {
    const token = customToken || getToken();
    
    const queryParams = new URLSearchParams();
    if (params.status) {
      queryParams.append('status', params.status);
    }
    
    const queryString = queryParams.toString();
    const url = `/posts/${params.postId}/solutions${queryString ? `?${queryString}` : ''}`;
    
    console.log(`🔍 Fetching solutions for post ${params.postId}${params.status ? ` with status ${params.status}` : ''}`);
    
    return fetchWithLog<Solution[]>(
      url,
      {
        method: 'GET',
        headers: createHeaders(token),
      },
      token
    );
  },

  
  getSolutionById: async (
    solutionId: string,
    customToken?: string
  ): Promise<Solution> => {
    const token = customToken || getToken();
    const url = `/solutions/${solutionId}`;
    
    console.log(`🔍 Fetching solution ${solutionId}`);
    
    const solutions = await fetchWithLog<Solution[]>(
      url,
      {
        method: 'GET',
        headers: createHeaders(token),
      },
      token
    );
    
    // API возвращает массив, берем первый элемент
    if (Array.isArray(solutions) && solutions.length > 0) {
      return solutions[0];
    }
    
    throw new Error('Solution not found');
  }
};