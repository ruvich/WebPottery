import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { SolutionsList } from '../../features/solutions/SolutionsList';
import styles from './SolutionsPage.module.css';

export const SolutionsPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link to={`/posts/${postId}`} className={styles.backButton}>
          ← Назад к заданию
        </Link>
      </div>

      {postId ? (
        <SolutionsList postId={postId} />
      ) : (
        <div className={styles.error}>ID задания не указан</div>
      )}
    </div>
  );
};