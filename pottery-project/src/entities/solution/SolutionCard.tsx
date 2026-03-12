import React from 'react';
import { Link } from 'react-router-dom';
import type { Solution } from '../../shared/api/types/solutionsApi';
import styles from './SolutionCard.module.css';

interface SolutionCardProps {
  solution: Solution;
}

export const SolutionCard: React.FC<SolutionCardProps> = ({ solution }) => {
  const getStatusLabel = (status: string) => {
    return status === 'SUBMITTED' ? 'Отправлено' : 'Черновик';
  };

  const getStatusClass = (status: string) => {
    return status === 'SUBMITTED' ? styles.submitted : styles.draft;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Link to={`/solutions/${solution.id}`} className={styles.card}>
      <div className={styles.header}>
        <span className={styles.studentId}>
          Студент: {solution.studentId.slice(0, 8)}...
        </span>
        <span className={`${styles.status} ${getStatusClass(solution.status)}`}>
          {getStatusLabel(solution.status)}
        </span>
      </div>
      <div className={styles.date}>
        Отправлено: {formatDate(solution.submittedAt)}
      </div>
    </Link>
  );
};