import React from 'react';
import type { Solution } from '../../shared/api/types/solutionApi';
import styles from './SolutionDetails.module.css';

interface SolutionDetailsProps {
  solution: Solution;
}

export const SolutionDetails: React.FC<SolutionDetailsProps> = ({ solution }) => {
  if (!solution) {
    return null;
  }

  const formatDate = (date: string) => {
    if (!date) return 'Дата не указана';
    return new Date(date).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusLabel = (status: string) => {
    return status === 'SUBMITTED' ? 'Отправлено на проверку' : 'Черновик';
  };

  const getStatusClass = (status: string) => {
    return status === 'SUBMITTED' ? styles.submitted : styles.draft;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerMain}>
          <h2 className={styles.title}>Решение студента</h2>
          <span className={`${styles.status} ${getStatusClass(solution.status)}`}>
            {getStatusLabel(solution.status)}
          </span>
        </div>
        
        <div className={styles.metaInfo}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Студент:</span>
            <span className={styles.metaValue}>{solution.studentId || 'Не указан'}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>ID задания:</span>
            <span className={styles.metaValue}>{solution.postId || 'Не указан'}</span>
          </div>
        </div>
      </div>

      <div className={styles.dates}>
        <div className={styles.dateItem}>
          <span className={styles.dateLabel}>Создано:</span>
          <span className={styles.dateValue}>{formatDate(solution.createdAt)}</span>
        </div>
        {solution.updatedAt && solution.updatedAt !== solution.createdAt && (
          <div className={styles.dateItem}>
            <span className={styles.dateLabel}>Обновлено:</span>
            <span className={styles.dateValue}>{formatDate(solution.updatedAt)}</span>
          </div>
        )}
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>
          <span className={styles.sectionIcon}>📝</span>
          Текст решения
        </h3>
        <div className={styles.textContent}>
          {solution.text ? (
            solution.text.split('\n').map((paragraph, index) => (
              <p key={index} className={styles.paragraph}>
                {paragraph || <br />}
              </p>
            ))
          ) : (
            <p className={styles.paragraph}>Текст решения отсутствует</p>
          )}
        </div>
      </div>

      {(solution.videoUrl || solution.attachmentUrl) && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>📎</span>
            Вложения
          </h3>
          <div className={styles.attachments}>
            {solution.videoUrl && (
              <div className={styles.attachmentCard}>
                <div className={styles.attachmentIcon}>🎥</div>
                <div className={styles.attachmentInfo}>
                  <div className={styles.attachmentName}>Видео</div>
                  <a 
                    href={solution.videoUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={styles.attachmentLink}
                  >
                    {solution.videoUrl}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {}
      {solution.grade && (
        <div className={styles.gradeSection}>
          <h3 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>⭐</span>
            Оценка преподавателя
          </h3>
          <div className={styles.gradeCard}>
            <div className={styles.gradeHeader}>
              <div className={styles.gradeScore}>
                <span className={styles.gradeValue}>{solution.grade.score}</span>
                <span className={styles.gradeMax}>/5</span>
              </div>
              <div className={styles.gradeDate}>
                Оценено: {formatDate(solution.grade.gradedAt)}
              </div>
            </div>
            
            {solution.grade.teacherComment && (
              <div className={styles.gradeComment}>
                <div className={styles.commentLabel}>Комментарий преподавателя:</div>
                <p className={styles.commentText}>{solution.grade.teacherComment}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};