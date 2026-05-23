// SolutionCard.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { studentApi } from '../../shared/api/studentApi';
import type { Solution } from '../../shared/api/types/solutionsApi';
import styles from './SolutionCard.module.css';

interface SolutionCardProps {
  solution: Solution;
}

export const SolutionCard: React.FC<SolutionCardProps> = ({ solution }) => {
  const [studentName, setStudentName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentName = async () => {
      try {
        const student = await studentApi.getStudentById(solution.studentId);
        setStudentName(student.profile.fullName);
      } catch (error) {
        console.error('Failed to fetch student name:', error);
        setStudentName(`${solution.studentId.slice(0, 8)}...`);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentName();
  }, [solution.studentId]);

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
          {loading ? 'Загрузка...' : studentName}
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