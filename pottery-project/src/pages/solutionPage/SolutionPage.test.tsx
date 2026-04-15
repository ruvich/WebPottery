// // src/pages/solutionPage/__tests__/SolutionPage.test.tsx
// import React from 'react';
// import { render, screen, fireEvent, waitFor } from '@testing-library/react'; // Не из testUtils!
// import { MemoryRouter, Route, Routes } from 'react-router-dom';
// import { SolutionPage } from './SolutionPage';
// import { solutionsApi } from '../../shared/api//types/solutionApi'; // Правильный импорт

// // Мокаем правильный API
// jest.mock('../../shared/api//types/solutionApi', () => ({
//   solutionsApi: { // Правильное имя
//     getSolutionById: jest.fn(),
//     gradeSolution: jest.fn()
//   }
// }));

// const mockSolution = {
//   id: 'sol1',
//   postId: 'post1',
//   studentId: 'student123',
//   status: 'SUBMITTED' as const,
//   text: 'Тестовое решение',
//   createdAt: '2026-03-11T14:30:00.000Z',
//   updatedAt: '2026-03-11T14:30:00.000Z'
// };

// const mockSolutionWithGrade = {
//   ...mockSolution,
//   grade: {
//     score: 4,
//     teacherComment: 'Хорошая работа',
//     gradedAt: '2026-03-12T10:15:00.000Z'
//   }
// };

// describe('SolutionPage', () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   const renderWithRouter = (solutionId: string = 'sol1') => {
//     return render(
//       <MemoryRouter initialEntries={[`/solutions/${solutionId}`]}>
//         <Routes>
//           <Route path="/solutions/:solutionId" element={<SolutionPage />} />
//           <Route path="/posts/:postId/solutions" element={<div>Solutions List Page</div>} />
//         </Routes>
//       </MemoryRouter>
//     );
//   };

//   it('рендерит загрузку при начальной загрузке', () => {
//     (solutionsApi.getSolutionById as jest.Mock).mockImplementation(() => new Promise(() => {}));
    
//     renderWithRouter();
//     expect(screen.getByText('Загрузка...')).toBeInTheDocument();
//   });

//   describe('решение без оценки', () => {
//     beforeEach(() => {
//       (solutionsApi.getSolutionById as jest.Mock).mockResolvedValue(mockSolution);
//     });

//     it('рендерит детали решения и панель оценивания', async () => {
//       renderWithRouter();
      
//       await waitFor(() => {
//         expect(screen.getByText('Решение студента')).toBeInTheDocument();
//       });
      
//       expect(screen.getByText('Оценка')).toBeInTheDocument();
//       expect(screen.getByRole('slider')).toBeInTheDocument();
//       expect(screen.getByRole('textbox')).toBeInTheDocument();
//       expect(screen.getByText('Оценить')).toBeInTheDocument();
//       expect(screen.queryByText('Изменить оценку')).not.toBeInTheDocument();
//     });

//     it('отправляет оценку при клике на кнопку', async () => {
//       (solutionsApi.gradeSolution as jest.Mock).mockResolvedValue({
//         ...mockSolution,
//         grade: { score: 5, teacherComment: 'Отлично', gradedAt: new Date().toISOString() }
//       });
      
//       renderWithRouter();
      
//       await waitFor(() => {
//         expect(screen.getByRole('slider')).toBeInTheDocument();
//       });
      
//       fireEvent.change(screen.getByRole('slider'), { target: { value: '5' } });
//       fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Отлично' } });
//       fireEvent.click(screen.getByText('Оценить'));
      
//       await waitFor(() => {
//         expect(solutionsApi.gradeSolution).toHaveBeenCalledWith('sol1', {
//           score: 5,
//           teacherComment: 'Отлично'
//         });
//       });
//     });
//   });

//   describe('решение с оценкой', () => {
//     beforeEach(() => {
//       (solutionsApi.getSolutionById as jest.Mock).mockResolvedValue(mockSolutionWithGrade);
//     });

//     it('рендерит оценку и кнопку "Изменить оценку"', async () => {
//       renderWithRouter();
      
//       await waitFor(() => {
//         expect(screen.getByText('Текущая оценка:')).toBeInTheDocument();
//       });
      
//       expect(screen.getByText('4/5')).toBeInTheDocument();
//       expect(screen.getByText('Хорошая работа')).toBeInTheDocument();
//       expect(screen.getByText('Изменить оценку')).toBeInTheDocument();
//       expect(screen.queryByRole('slider')).not.toBeInTheDocument();
//     });

//     it('открывает панель редактирования при клике на кнопку', async () => {
//       renderWithRouter();
      
//       await waitFor(() => {
//         expect(screen.getByText('Изменить оценку')).toBeInTheDocument();
//       });
      
//       fireEvent.click(screen.getByText('Изменить оценку'));
      
//       expect(screen.getByRole('slider')).toBeInTheDocument();
//       expect(screen.getByRole('textbox')).toHaveValue('Хорошая работа');
//       expect(screen.getByText('Отмена')).toBeInTheDocument();
//     });

//     it('обновляет оценку и закрывает панель при отправке', async () => {
//       (solutionsApi.gradeSolution as jest.Mock).mockResolvedValue({
//         ...mockSolutionWithGrade,
//         grade: { score: 5, teacherComment: 'Отлично', gradedAt: new Date().toISOString() }
//       });
      
//       renderWithRouter();
      
//       await waitFor(() => {
//         expect(screen.getByText('Изменить оценку')).toBeInTheDocument();
//       });
      
//       fireEvent.click(screen.getByText('Изменить оценку'));
//       fireEvent.change(screen.getByRole('slider'), { target: { value: '5' } });
//       fireEvent.click(screen.getByText('Оценить'));
      
//       await waitFor(() => {
//         expect(screen.getByText('Изменить оценку')).toBeInTheDocument();
//       });
//       expect(screen.queryByRole('slider')).not.toBeInTheDocument();
//     });

//     it('закрывает панель без сохранения при нажатии "Отмена"', async () => {
//       renderWithRouter();
      
//       await waitFor(() => {
//         expect(screen.getByText('Изменить оценку')).toBeInTheDocument();
//       });
      
//       fireEvent.click(screen.getByText('Изменить оценку'));
//       fireEvent.click(screen.getByText('Отмена'));
      
//       expect(screen.queryByRole('slider')).not.toBeInTheDocument();
//       expect(screen.getByText('Изменить оценку')).toBeInTheDocument();
//     });
//   });

//   it('отображает ошибку, если решение не найдено', async () => {
//     (solutionsApi.getSolutionById as jest.Mock).mockRejectedValue(new Error('Not found'));
    
//     renderWithRouter('non-existent');
    
//     await waitFor(() => {
//       expect(screen.getByText('Не удалось загрузить решение')).toBeInTheDocument();
//     });
//   });

//   it('содержит ссылку "Назад к списку решений"', async () => {
//     (solutionsApi.getSolutionById as jest.Mock).mockResolvedValue(mockSolution);
    
//     renderWithRouter();
    
//     await waitFor(() => {
//       expect(screen.getByText('← Назад к списку решений')).toBeInTheDocument();
//     });
    
//     const backLink = screen.getByText('← Назад к списку решений');
//     expect(backLink.closest('a')).toHaveAttribute('href', '/posts/post1/solutions');
//   });
// });