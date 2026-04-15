import type { 
  Solution, 
  GradeTeamRequest, 
  GradeMemberRequest,
  MemberGrade
} from './types/solutionApi';

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
  
  console.group(`🌐 Solution API: ${options.method} ${url}`);
  console.log('Full URL:', fullUrl);
  console.log('Token present:', !!token);
  if (options.body) {
    try {
      console.log('Request body:', JSON.parse(options.body as string));
    } catch {
      console.log('Request body:', options.body);
    }
  }
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
    console.log('📦 Response data:', data);
    
    return data as T;
  } catch (error) {
    console.error('❌ API Error:', error);
    throw error;
  }
}

export const solutionApi = {
  // Получить решение по ID
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

  // Оценка команде (общая оценка за решение)
  gradeTeam: async (
    solutionId: string,
    data: GradeTeamRequest,
    customToken?: string
  ): Promise<Solution> => {
    const token = customToken || getToken();
    
    if (!token) {
      throw new Error('Authorization token is required');
    }

    console.log(`⭐ Grading team for solution ${solutionId} with score ${data.score}`);
    
    return fetchWithLog<Solution>(
      `/solutions/${solutionId}/grade`,
      {
        method: 'PUT',  // или POST, проверьте спецификацию
        headers: createHeaders(token),
        body: JSON.stringify(data),
      },
      token
    );
  },

  // Индивидуальная оценка студента в команде
  gradeMember: async (
    solutionId: string,
    studentId: string,
    data: GradeMemberRequest,
    customToken?: string
  ): Promise<Solution> => {
    const token = customToken || getToken();
    
    if (!token) {
      throw new Error('Authorization token is required');
    }

    console.log(`⭐ Grading member ${studentId} for solution ${solutionId} with score ${data.score}`);
    
    return fetchWithLog<Solution>(
      `/solutions/${solutionId}/members/${studentId}/grade`,
      {
        method: 'PUT',
        headers: createHeaders(token),
        body: JSON.stringify(data),
      },
      token
    );
  },

  getSolutionMembers: async (
    solutionId: string,
    customToken?: string
  ): Promise<{ studentId: string; studentName: string; grade?: MemberGrade }[]> => {
    const token = customToken || getToken();
    
    if (!token) {
      throw new Error('Authorization token is required');
    }

    console.log(`👥 Fetching members for solution ${solutionId}`);
    
    return fetchWithLog<{ studentId: string; studentName: string; grade?: MemberGrade }[]>(
      `/solutions/${solutionId}/members`,
      {
        method: 'GET',
        headers: createHeaders(token),
      },
      token
    );
  }
};