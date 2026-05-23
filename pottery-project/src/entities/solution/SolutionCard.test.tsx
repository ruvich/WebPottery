// src/entities/solution/ui/SolutionCard/__tests__/SolutionCard.test.tsx
import React from 'react';
import { render, screen } from '../../testUtils';
import { SolutionCard } from './SolutionCard';
import type { Solution } from '../../shared/api/types/solutionsApi';

describe('SolutionCard', () => {
  const mockSolution: Solution = {
    id: 'sol1',
    postId: 'post1',
    studentId: 'student123',
    status: 'SUBMITTED',
    submittedAt: '2026-03-11T14:30:00.000Z'
  };


  it('рендерит статус "Отправлено" для SUBMITTED', () => {
    render(<SolutionCard solution={mockSolution} />);
    expect(screen.getByText('Отправлено')).toBeInTheDocument();
  });

  it('рендерит статус "Черновик" для DRAFT', () => {
    const draftSolution = { ...mockSolution, status: 'DRAFT' as const };
    render(<SolutionCard solution={draftSolution} />);
    expect(screen.getByText('Черновик')).toBeInTheDocument();
  });

  it('форматирует дату правильно', () => {
    render(<SolutionCard solution={mockSolution} />);
    // Проверяем, что дата отображается в русском формате
    expect(screen.getByText(/марта/)).toBeInTheDocument();
  });

  it('создаёт ссылку на страницу решения', () => {
    render(<SolutionCard solution={mockSolution} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/solutions/sol1');
  });


});