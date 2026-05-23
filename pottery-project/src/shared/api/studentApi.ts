import type { Student } from './types/studentApi';

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
  }
  
  return headers;
};

async function fetchWithLog<T>(
  url: string,
  options: RequestInit,
  token?: string
): Promise<T> {
  const fullUrl = `${API_BASE_URL}${url}`;
  
  console.group(`🌐 Student API: ${options.method} ${url}`);
  console.log('Full URL:', fullUrl);
  console.log('Token present:', !!token);
  console.groupEnd();

  try {
    const response = await fetch(fullUrl, options);

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
    return data as T;
  } catch (error) {
    console.error('❌ API Error:', error);
    throw error;
  }
}

export const studentApi = {
  getStudentById: async (
    studentId: string,
    customToken?: string
  ): Promise<Student> => {
    const token = customToken || getToken();
    
    if (!token) {
      throw new Error('Authorization token is required');
    }

    console.log(`👤 Fetching student ${studentId}`);
    
    return fetchWithLog<Student>(
      `/students/${studentId}`,
      {
        method: 'GET',
        headers: createHeaders(token),
      },
      token
    );
  },

  getStudentsByIds: async (
    studentIds: string[],
    customToken?: string
  ): Promise<Map<string, string>> => {
    const token = customToken || getToken();
    
    if (!token) {
      throw new Error('Authorization token is required');
    }

    const promises = studentIds.map(async (studentId) => {
      try {
        const student = await studentApi.getStudentById(studentId, token);
        return { id: studentId, name: student.profile.fullName };
      } catch (error) {
        console.error(`Failed to fetch student ${studentId}:`, error);
        return { id: studentId, name: `Студент ${studentId.substring(0, 8)}` };
      }
    });

    const results = await Promise.all(promises);
    const studentMap = new Map<string, string>();
    results.forEach(result => {
      studentMap.set(result.id, result.name);
    });
    
    return studentMap;
  }
};