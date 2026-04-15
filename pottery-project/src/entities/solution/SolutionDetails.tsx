import React, { useEffect, useState } from 'react';
import type { Solution } from '../../shared/api/types/solutionApi';
import { studentApi } from '../../shared/api/studentApi';
import styles from './SolutionDetails.module.css';

interface SolutionDetailsProps {
  solution: Solution;
}

export const SolutionDetails: React.FC<SolutionDetailsProps> = ({ solution }) => {
  const [studentName, setStudentName] = useState<string>('');
  const [loadingName, setLoadingName] = useState(true);

  useEffect(() => {
    const fetchStudentName = async () => {
      if (!solution.studentId) {
        setLoadingName(false);
        return;
      }

      try {
        const student = await studentApi.getStudentById(solution.studentId);
        setStudentName(student.profile.fullName);
      } catch (error) {
        console.error('Failed to fetch student name:', error);
        setStudentName(solution.studentId);
      } finally {
        setLoadingName(false);
      }
    };

    fetchStudentName();
  }, [solution.studentId]);

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

  const getOwnerLabel = () => {
    return solution.ownerType === 'TEAM' ? 'Команда:' : 'Студент:';
  };

  const getOwnerName = () => {
    if (loadingName) return 'Загрузка...';
    if (studentName) return studentName;
    return solution.studentId || 'Не указан';
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerMain}>
          <h2 className={styles.title}>Решение</h2>
          <span className={`${styles.status} ${getStatusClass(solution.status)}`}>
            {getStatusLabel(solution.status)}
          </span>
        </div>
        
        <div className={styles.metaInfo}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>{getOwnerLabel()}</span>
            <span className={styles.metaValue}>{getOwnerName()}</span>
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
            {solution.attachmentUrl && (
              <div className={styles.attachmentCard}>
                <div className={styles.attachmentIcon}>📎</div>
                <div className={styles.attachmentInfo}>
                  <div className={styles.attachmentName}>Вложение</div>
                  <a 
                    href={solution.attachmentUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={styles.attachmentLink}
                  >
                    {solution.attachmentUrl}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      

    </div>
  );
};