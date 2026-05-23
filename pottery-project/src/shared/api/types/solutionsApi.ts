export interface Solution {
  id: string;
  postId: string;
  studentId: string;
  status: 'DRAFT' | 'SUBMITTED';
  submittedAt: string;
}

export interface GetSolutionsParams {
  postId: string;
}

const MOCK_SOLUTIONS: Solution[] = [
  {
    id: 'sol1',
    postId: '2',
    studentId: 'student1',
    status: 'SUBMITTED',
    submittedAt: '2026-03-11T14:30:00.000Z'
  },
  {
    id: 'sol2',
    postId: '2',
    studentId: 'student2',
    status: 'SUBMITTED',
    submittedAt: '2026-03-10T09:15:00.000Z'
  },
  {
    id: 'sol3',
    postId: '2',
    studentId: 'student3',
    status: 'DRAFT',
    submittedAt: '2026-03-09T16:45:00.000Z'
  },
  {
    id: 'sol4',
    postId: '4',
    studentId: 'student1',
    status: 'SUBMITTED',
    submittedAt: '2026-03-08T11:20:00.000Z'
  }
];

export const solutionsApi = {
  getSolutionsByPostId: async (params: GetSolutionsParams): Promise<Solution[]> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return MOCK_SOLUTIONS.filter(solution => solution.postId === params.postId);
  }
};


