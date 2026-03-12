export interface Solution {
  id: string;
  postId: string;
  studentId: string;
  status: 'DRAFT' | 'SUBMITTED';
  text: string;
  videoUrl?: string;
  attachmentUrl?: string;
  createdAt: string;
  updatedAt: string;
  grade?: {
    score: number;
    teacherComment?: string;
    gradedAt: string;
  };
}

export interface GradeSolutionRequest {
  score: number;
  teacherComment?: string;
}

const MOCK_SOLUTIONS: Solution[] = [
  {
    id: 'sol1',
    postId: '2',
    studentId: 'student-123',
    status: 'SUBMITTED',
    text: 'Я сделал миску из глины. Получилось немного кривовато, но для первого раза нормально. Использовал технику ручной лепки. Потребовалось около 3 часов работы. Глина была красная, обжиг при 1000 градусов.',
    videoUrl: 'https://example.com/video1',
    attachmentUrl: 'https://example.com/photo1.jpg',
    createdAt: '2026-03-11T14:30:00.000Z',
    updatedAt: '2026-03-11T14:30:00.000Z',
    grade: {
      score: 4,
      teacherComment: 'Хорошая работа! Немного неровные края, но в целом отлично. Постарайтесь в следующий раз лучше выровнять края.',
      gradedAt: '2026-03-12T10:15:00.000Z'
    }
  },
  {
    id: 'sol2',
    postId: '2',
    studentId: 'student-456',
    status: 'SUBMITTED',
    text: 'Сделал миску на гончарном круге. Очень доволен результатом! Получилось ровно и красиво. Использовал белую глину.',
    attachmentUrl: 'https://example.com/photo2.jpg',
    createdAt: '2026-03-10T09:15:00.000Z',
    updatedAt: '2026-03-10T09:15:00.000Z'
  },
  {
    id: 'sol3',
    postId: '2',
    studentId: 'student-789',
    status: 'DRAFT',
    text: 'Черновик работы, еще не закончил... Нужно доделать края и отправить на обжиг.',
    createdAt: '2026-03-09T16:45:00.000Z',
    updatedAt: '2026-03-09T16:45:00.000Z'
  }
];

export const solutionsApi = {
  getSolutionsByPostId: async (params: { postId: string }): Promise<Solution[]> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    return MOCK_SOLUTIONS.filter(solution => solution.postId === params.postId);
  },

  getSolutionById: async (solutionId: string): Promise<Solution> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const solution = MOCK_SOLUTIONS.find(s => s.id === solutionId);
    if (!solution) {
      throw new Error('Solution not found');
    }
    return solution;
  },

  gradeSolution: async (solutionId: string, data: GradeSolutionRequest): Promise<Solution> => {
    await new Promise(resolve => setTimeout(resolve, 700));
    const solutionIndex = MOCK_SOLUTIONS.findIndex(s => s.id === solutionId);
    if (solutionIndex === -1) {
      throw new Error('Solution not found');
    }
    
    MOCK_SOLUTIONS[solutionIndex] = {
      ...MOCK_SOLUTIONS[solutionIndex],
      grade: {
        score: data.score,
        teacherComment: data.teacherComment,
        gradedAt: new Date().toISOString()
      }
    };
    
    return MOCK_SOLUTIONS[solutionIndex];
  }
};