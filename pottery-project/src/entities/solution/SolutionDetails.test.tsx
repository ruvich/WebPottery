// src/entities/solution/ui/SolutionDetails/__tests__/SolutionDetails.test.tsx
import React from 'react';
import { render, screen } from '../../testUtils';
import { SolutionDetails } from './SolutionDetails';
import type { Solution } from '../../shared/api/types/solutionApi';

describe('SolutionDetails', () => {
  const mockSolution: Solution = {
    id: 'sol1',
    postId: 'post1',
    studentId: 'student123',
    status: 'SUBMITTED',
    text: 'Тестовое решение студента\nНовая строка',
    videoUrl: 'https://example.com/video',
    attachmentUrl: 'https://example.com/file.pdf',
    createdAt: '2026-03-11T14:30:00.000Z',
    updatedAt: '2026-03-11T14:30:00.000Z'
  };

  const mockSolutionWithGrade: Solution = {
    ...mockSolution,
    grade: {
      score: 4,
      teacherComment: 'Хорошая работа, но есть недочёты',
      gradedAt: '2026-03-12T10:15:00.000Z'
    }
  };

  it('рендерит заголовок', () => {
    render(<SolutionDetails solution={mockSolution} />);
    expect(screen.getByText('Решение студента')).toBeInTheDocument();
  });

  it('рендерит ID студента', () => {
    render(<SolutionDetails solution={mockSolution} />);
    expect(screen.getByText('student123')).toBeInTheDocument();
  });

  it('рендерит текст решения с сохранением переносов строк', () => {
    render(<SolutionDetails solution={mockSolution} />);
    expect(screen.getByText(/Тестовое решение студента/)).toBeInTheDocument();
    expect(screen.getByText(/Новая строка/)).toBeInTheDocument();
  });

  it('рендерит ссылки на вложения', () => {
    render(<SolutionDetails solution={mockSolution} />);
    
    const videoLink = screen.getByText('https://example.com/video');
    const fileLink = screen.getByText('https://example.com/file.pdf');
    
    expect(videoLink).toBeInTheDocument();
    expect(fileLink).toBeInTheDocument();
    expect(videoLink.closest('a')).toHaveAttribute('href', 'https://example.com/video');
    expect(fileLink.closest('a')).toHaveAttribute('href', 'https://example.com/file.pdf');
  });

  it('не рендерит секцию вложений, если их нет', () => {
    const solutionWithoutAttachments = {
      ...mockSolution,
      videoUrl: undefined,
      attachmentUrl: undefined
    };
    render(<SolutionDetails solution={solutionWithoutAttachments} />);
    
    expect(screen.queryByText('Вложения')).not.toBeInTheDocument();
  });

  

  it('не рендерит оценку, если её нет', () => {
    render(<SolutionDetails solution={mockSolution} />);
    
    expect(screen.queryByText('Оценка преподавателя')).not.toBeInTheDocument();
  });

  it('отображает дату обновления, если она отличается от даты создания', () => {
    const updatedSolution = {
      ...mockSolution,
      updatedAt: '2026-03-12T10:00:00.000Z'
    };
    render(<SolutionDetails solution={updatedSolution} />);
    
    expect(screen.getByText(/Обновлено:/)).toBeInTheDocument();
  });

  it('не отображает дату обновления, если она совпадает с датой создания', () => {
    render(<SolutionDetails solution={mockSolution} />);
    
    expect(screen.queryByText(/Обновлено:/)).not.toBeInTheDocument();
  });
});