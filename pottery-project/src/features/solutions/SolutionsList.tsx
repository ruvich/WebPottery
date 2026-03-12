import React, { useEffect, useState } from 'react';
import { SolutionCard } from '../../entities/solution/SolutionCard';
import { solutionsListApi } from '../../shared/api/solutionsListApi';
// import { solutionsApi } from '../../shared/api/types/solutionsApi';

import type { Solution } from '../../shared/api/types/solutionsApi';
import styles from './SolutionsList.module.css';

interface SolutionsListProps {
  postId: string;
}

export const SolutionsList: React.FC<SolutionsListProps> = ({ postId }) => {
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSolutions = async () => {
      try {
        setLoading(true);
        const data = await solutionsListApi.getSolutionsByPostId({ postId });
        setSolutions(data);
      } catch (err) {
        setError('Не удалось загрузить решения');
        console.error('Error fetching solutions:', err);
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchSolutions();
    }
  }, [postId]);

  if (loading) {
    return <div className={styles.loading}>Загрузка решений...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (solutions.length === 0) {
    return (
      <div className={styles.empty}>
        <p>Решения не найдены</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Решения задания</h2>
        <span className={styles.count}>Всего: {solutions.length}</span>
      </div>
      
      <div className={styles.list}>
        {solutions.map((solution) => (
          <SolutionCard key={solution.id} solution={solution} />
        ))}
      </div>
    </div>
  );
};