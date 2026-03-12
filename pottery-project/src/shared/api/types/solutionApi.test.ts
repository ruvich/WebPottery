// src/shared/api/__tests__/solutionApi.test.ts
import { solutionsApi } from './solutionApi';

describe('solutionApi', () => {
  describe('getSolutionById', () => {
    it('должен возвращать полную информацию о решении по ID', async () => {
      const solutionId = 'sol1';
      const solution = await solutionsApi.getSolutionById(solutionId);
      
      expect(solution).toBeDefined();
      expect(solution.id).toBe(solutionId);
      expect(solution.postId).toBeDefined();
      expect(solution.studentId).toBeDefined();
      expect(solution.text).toBeDefined();
      expect(solution.createdAt).toBeDefined();
      expect(solution.updatedAt).toBeDefined();
    });

    it('должен возвращать решение с полями grade, если оценка есть', async () => {
      const solutionId = 'sol1';
      const solution = await solutionsApi.getSolutionById(solutionId);
      
      expect(solution.grade).toBeDefined();
      expect(solution.grade?.score).toBeDefined();
      expect(solution.grade?.gradedAt).toBeDefined();
    });

    it('должен возвращать решение без grade, если оценки нет', async () => {
      const solutionId = 'sol2';
      const solution = await solutionsApi.getSolutionById(solutionId);
      
      expect(solution.grade).toBeUndefined();
    });

    it('должен выбрасывать ошибку для несуществующего ID', async () => {
      const solutionId = 'non-existent-id';
      
      await expect(solutionsApi.getSolutionById(solutionId)).rejects.toThrow('Solution not found');
    });

    it('должен возвращать решение с опциональными полями videoUrl и attachmentUrl', async () => {
      const solutionWithVideo = await solutionsApi.getSolutionById('sol1');
      expect(solutionWithVideo.videoUrl).toBeDefined();
      expect(solutionWithVideo.attachmentUrl).toBeDefined();

      const solutionWithoutVideo = await solutionsApi.getSolutionById('sol2');
      expect(solutionWithoutVideo.videoUrl).toBeUndefined();
      expect(solutionWithoutVideo.attachmentUrl).toBeDefined();

      const solutionDraft = await solutionsApi.getSolutionById('sol3');
      expect(solutionDraft.videoUrl).toBeUndefined();
      expect(solutionDraft.attachmentUrl).toBeUndefined();
    });
  });

  describe('gradeSolution', () => {
    it('должен добавлять оценку к решению без оценки', async () => {
      const solutionId = 'sol2';
      const gradeData = {
        score: 5,
        teacherComment: 'Отличная работа!'
      };

      const updatedSolution = await solutionsApi.gradeSolution(solutionId, gradeData);
      
      expect(updatedSolution.grade).toBeDefined();
      expect(updatedSolution.grade?.score).toBe(gradeData.score);
      expect(updatedSolution.grade?.teacherComment).toBe(gradeData.teacherComment);
      expect(updatedSolution.grade?.gradedAt).toBeDefined();
      expect(new Date(updatedSolution.grade!.gradedAt).getTime()).toBeLessThanOrEqual(Date.now());
    });

    it('должен обновлять существующую оценку', async () => {
      const solutionId = 'sol1';
      const gradeData = {
        score: 5,
        teacherComment: 'Исправленная оценка - работа стала лучше'
      };

      const originalSolution = await solutionsApi.getSolutionById(solutionId);
      const originalGradedAt = originalSolution.grade!.gradedAt;

      // Немного ждём, чтобы даты точно отличались
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const updatedSolution = await solutionsApi.gradeSolution(solutionId, gradeData);
      
      expect(updatedSolution.grade).toBeDefined();
      expect(updatedSolution.grade?.score).toBe(gradeData.score);
      expect(updatedSolution.grade?.teacherComment).toBe(gradeData.teacherComment);
      expect(updatedSolution.grade?.gradedAt).not.toBe(originalGradedAt);
    });

    it('должен работать с оценкой без комментария', async () => {
      const solutionId = 'sol2';
      const gradeData = {
        score: 4
      };

      const updatedSolution = await solutionsApi.gradeSolution(solutionId, gradeData);
      
      expect(updatedSolution.grade).toBeDefined();
      expect(updatedSolution.grade?.score).toBe(gradeData.score);
      expect(updatedSolution.grade?.teacherComment).toBeUndefined();
    });

    it('должен выбрасывать ошибку при попытке оценить несуществующее решение', async () => {
      const solutionId = 'non-existent-id';
      const gradeData = { score: 5 };

      await expect(solutionsApi.gradeSolution(solutionId, gradeData)).rejects.toThrow('Solution not found');
    });

    it('должен сохранять все остальные поля решения при добавлении оценки', async () => {
      const solutionId = 'sol2';
      const originalSolution = await solutionsApi.getSolutionById(solutionId);
      const gradeData = { score: 5, teacherComment: 'Отлично' };

      const updatedSolution = await solutionsApi.gradeSolution(solutionId, gradeData);
      
      expect(updatedSolution.id).toBe(originalSolution.id);
      expect(updatedSolution.postId).toBe(originalSolution.postId);
      expect(updatedSolution.studentId).toBe(originalSolution.studentId);
      expect(updatedSolution.text).toBe(originalSolution.text);
      expect(updatedSolution.attachmentUrl).toBe(originalSolution.attachmentUrl);
      expect(updatedSolution.createdAt).toBe(originalSolution.createdAt);
    });
  });
});