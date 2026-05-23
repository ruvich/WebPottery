// src/pages/solutionsPage/__tests__/SolutionsPage.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react'; // Не из testUtils!
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SolutionsPage } from './SolutionsPage';
import { solutionsApi } from '../../shared/api/types/solutionsApi'; // Правильный импорт

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
  }
];

describe('SolutionsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithRouter = (postId: string = 'post1') => {
    return render(
      <MemoryRouter initialEntries={[`/posts/${postId}/solutions`]}>
        <Routes>
          <Route path="/posts/:postId/solutions" element={<SolutionsPage />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('рендерит заголовок с ссылкой назад', () => {
    renderWithRouter();
    
    const backLink = screen.getByText('← Назад к заданию');
    expect(backLink).toBeInTheDocument();
    expect(backLink.closest('a')).toHaveAttribute('href', '/posts/post1');
  });

  it('рендерит список решений', async () => {
    (solutionsApi.getSolutionsByPostId as jest.Mock).mockResolvedValue(mockSolutions);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Решения задания')).toBeInTheDocument();
    });
    
    expect(screen.getByText(/student1/)).toBeInTheDocument();
  });


});