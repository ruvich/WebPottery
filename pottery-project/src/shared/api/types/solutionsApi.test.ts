import { solutionsApi, type Solution } from './solutionsApi';

describe('solutionsListApi', () => {
  describe('getSolutionsByPostId', () => {
    it('должен возвращать только решения для указанного postId', async () => {
      const postId = '2';
      const solutions = await solutionsApi.getSolutionsByPostId({ postId });
      
      expect(solutions).toBeDefined();
      expect(Array.isArray(solutions)).toBe(true);
      expect(solutions.length).toBeGreaterThan(0);
      expect(solutions.every(s => s.postId === postId)).toBe(true);
    });

    it('должен возвращать пустой массив для несуществующего postId', async () => {
      const postId = 'non-existent-id';
      const solutions = await solutionsApi.getSolutionsByPostId({ postId });
      
      expect(solutions).toEqual([]);
    });

    it('должен возвращать решения с правильной структурой для списка', async () => {
      const postId = '2';
      const solutions = await solutionsApi.getSolutionsByPostId({ postId });
      
      solutions.forEach(solution => {
        expect(solution).toHaveProperty('id');
        expect(solution).toHaveProperty('postId');
        expect(solution).toHaveProperty('studentId');
        expect(solution).toHaveProperty('status');
        expect(['DRAFT', 'SUBMITTED']).toContain(solution.status);
        expect(solution).toHaveProperty('submittedAt');
        
        // Проверяем, что в списке нет детальных полей
        expect(solution).not.toHaveProperty('text');
        expect(solution).not.toHaveProperty('videoUrl');
        expect(solution).not.toHaveProperty('attachmentUrl');
        expect(solution).not.toHaveProperty('grade');
      });
    });

    it('должен возвращать решения с разными статусами', async () => {
      const postId = '2';
      const solutions = await solutionsApi.getSolutionsByPostId({ postId });
      
      const hasSubmitted = solutions.some(s => s.status === 'SUBMITTED');
      const hasDraft = solutions.some(s => s.status === 'DRAFT');
      
      expect(hasSubmitted).toBe(true);
      expect(hasDraft).toBe(true);
    });
  });
});