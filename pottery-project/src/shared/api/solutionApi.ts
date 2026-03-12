import type { Solution, GradeSolutionRequest } from './types/solutionApi';

const API_BASE_URL = 'http://localhost:8080/api';
const getToken = (): string | undefined => {
  return localStorage.getItem('token') || undefined;
};

const createHeaders = (token?: string): Record<string, string> => {
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
  token?: string
): Promise<T> {
  const fullUrl = `${API_BASE_URL}${url}`;
  
  console.group(`🌐 Solution API: ${options.method} ${url}`);
  console.log('Full URL:', fullUrl);
  console.log('Token present:', !!token);
  console.log('Request body:', options.body ? JSON.parse(options.body as string) : undefined);
  console.groupEnd();

  try {
    const startTime = performance.now();
    const response = await fetch(fullUrl, options);
    const endTime = performance.now();

    console.group(`📦 Response: ${options.method} ${url}`);
    console.log('Status:', response.status, response.statusText);
    console.log('Duration:', `${(endTime - startTime).toFixed(2)}ms`);
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
    return data;
  } catch (error) {
    console.error('❌ API Error:', error);
    throw error;
  }
}

export const solutionApi = {

  getSolutionById: async (
    solutionId: string,
    customToken?: string
  ): Promise<Solution> => {
    const token = customToken || getToken();
    
    if (!token) {
      throw new Error('Authorization token is required');
    }

    console.log(`🔍 Fetching solution ${solutionId}`);
    
    return fetchWithLog<Solution>(
      `/solutions/${solutionId}`,
      {
        method: 'GET',
        headers: createHeaders(token),
      },
      token
    );
  },


  gradeSolution: async (
    solutionId: string,
    data: GradeSolutionRequest,
    customToken?: string
  ): Promise<Solution> => {
    const token = customToken || getToken();
    
    if (!token) {
      throw new Error('Authorization token is required');
    }

    console.log(`⭐ Grading solution ${solutionId} with score ${data.score}`);
    
    return fetchWithLog<Solution>(
      `/solutions/${solutionId}/grade`,
      {
        method: 'PUT',
        headers: createHeaders(token),
        body: JSON.stringify(data),
      },
      token
    );
  }
};