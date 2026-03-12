// src/features/solutions/ui/SolutionsList/__tests__/SolutionsList.test.tsx
import React from 'react';
import { render, screen, waitFor } from '../../testUtils';
import { SolutionsList } from './SolutionsList';
import { solutionsApi } from '../../shared/api/types/solutionsApi';

jest.mock('../../shared/api/types/solutionsApi', () => ({
  solutionsApi: {
    getSolutionsByPostId: jest.fn()
  }
}));

const mockSolutions = [
  {
    id: 'sol1',
    postId: 'post1',
    studentId: 'student1',
    status: 'SUBMITTED' as const,
    submittedAt: '2026-03-11T14:30:00.000Z'
  },
  {
    id: 'sol2',
    postId: 'post1',
    studentId: 'student2',
    status: 'DRAFT' as const,
    submittedAt: '2026-03-10T09:15:00.000Z'
  }
];

describe('SolutionsList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('рендерит загрузку при начальной загрузке', () => {
    (solutionsApi.getSolutionsByPostId as jest.Mock).mockImplementation(() => new Promise(() => {}));
    
    render(<SolutionsList postId="post1" />);
    expect(screen.getByText('Загрузка решений...')).toBeInTheDocument();
  });

  it('рендерит список решений после загрузки', async () => {
    (solutionsApi.getSolutionsByPostId as jest.Mock).mockResolvedValue(mockSolutions);
    
    render(<SolutionsList postId="post1" />);
    
    await waitFor(() => {
      expect(screen.getByText('Решения задания')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Всего: 2')).toBeInTheDocument();
    expect(screen.getByText(/student1/)).toBeInTheDocument();
    expect(screen.getByText(/student2/)).toBeInTheDocument();
  });

  it('отображает сообщение, если решений нет', async () => {
    (solutionsApi.getSolutionsByPostId as jest.Mock).mockResolvedValue([]);
    
    render(<SolutionsList postId="post1" />);
    
    await waitFor(() => {
      expect(screen.getByText('Решения не найдены')).toBeInTheDocument();
    });
  });

  it('отображает ошибку при неудачной загрузке', async () => {
    (solutionsApi.getSolutionsByPostId as jest.Mock).mockRejectedValue(new Error('Network error'));
    
    render(<SolutionsList postId="post1" />);
    
    await waitFor(() => {
      expect(screen.getByText('Не удалось загрузить решения')).toBeInTheDocument();
    });
  });

  it('вызывает API с правильным postId', async () => {
    (solutionsApi.getSolutionsByPostId as jest.Mock).mockResolvedValue(mockSolutions);
    
    render(<SolutionsList postId="post123" />);
    
    await waitFor(() => {
      expect(solutionsApi.getSolutionsByPostId).toHaveBeenCalledWith({ postId: 'post123' });
    });
  });
});