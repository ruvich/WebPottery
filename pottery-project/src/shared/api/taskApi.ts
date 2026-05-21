
export interface Criterion {
  id: string;
  taskId: string;
  title: string;
  description?: string;
  type: 'RANGE' | 'BOOLEAN' | 'SCALE';
  maxScore: number;
  impactType: 'REGULAR' | 'BONUS';
  displayOrder: number;
}

const API_BASE_URL = 'http://localhost:8080/api';

export const taskApi = {
  getCriteriaByPostId: async (postId: string): Promise<Criterion[]> => {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/criteria`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch criteria');
    }
    
    return response.json();
  },
};