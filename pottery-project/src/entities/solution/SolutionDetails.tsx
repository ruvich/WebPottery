import React, { useState } from 'react';
import type { Solution, SelfAssessmentItem } from '../../shared/api/types/solutionApi';
import styles from './SolutionDetails.module.css';

interface SolutionDetailsProps {
  solution: Solution;
}

export const SolutionDetails: React.FC<SolutionDetailsProps> = ({ solution }) => {
  const [expandedCriteria, setExpandedCriteria] = useState<string[]>([]);

  if (!solution) return null;

  const formatDate = (date?: string) => {
    if (!date) return 'Дата не указана';
    try {
      return new Date(date).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Некорректная дата';
    }
  };

  const getStatusLabel = (status: string) => {
    return status === 'SUBMITTED' ? 'Отправлено на проверку' : 'Черновик';
  };

  const getStatusClass = (status: string) => {
    return status === 'SUBMITTED' ? styles.submitted : styles.draft;
  };

  const getOwnerName = () => {
    if (solution.ownerType === 'TEAM') {
      return `Команда ${solution.teamId?.slice(0, 8)}...`;
    }
    return solution.studentName || solution.studentId || 'Не указан';
  };

  const formatSelfAssessmentValue = (item: SelfAssessmentItem) => {
    switch (item.valueType) {
      case 'POINTS':
        return `${item.pointsValue} баллов`;
      case 'PERCENT':
        return `${item.percentValue}%`;
      case 'YES_NO':
        return item.booleanValue ? '✅ Да' : '❌ Нет';
      default:
        return `${item.calculatedScore}`;
    }
  };

  const toggleCriterion = (criterionId: string) => {
    setExpandedCriteria(prev =>
      prev.includes(criterionId)
        ? prev.filter(id => id !== criterionId)
        : [...prev, criterionId]
    );
  };

  // Группируем selfAssessment по критериям
  const selfAssessmentMap = new Map(
    solution.selfAssessment?.map(item => [item.criterionId, item]) || []
  );

  return (
    <div className={styles.container}>
      {}
      <div className={styles.header}>
        <div className={styles.headerMain}>
          <h2 className={styles.title}>Решение</h2>
          <span className={`${styles.status} ${getStatusClass(solution.status)}`}>
            {getStatusLabel(solution.status)}
          </span>
        </div>
        
        <div className={styles.metaInfo}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Владелец:</span>
            <span className={styles.metaValue}>{getOwnerName()}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>ID задания:</span>
            <span className={styles.metaValue}>{solution.postId?.slice(0, 8)}...</span>
          </div>
          {solution.votesCount !== undefined && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>👍 Голосов:</span>
              <span className={styles.metaValue}>{solution.votesCount}</span>
            </div>
          )}
        </div>
      </div>

      {}
      <div className={styles.dates}>
        <div className={styles.dateItem}>
          <span className={styles.dateLabel}>📅 Создано:</span>
          <span className={styles.dateValue}>{formatDate(solution.createdAt)}</span>
        </div>
        {solution.updatedAt && solution.updatedAt !== solution.createdAt && (
          <div className={styles.dateItem}>
            <span className={styles.dateLabel}>🔄 Обновлено:</span>
            <span className={styles.dateValue}>{formatDate(solution.updatedAt)}</span>
          </div>
        )}
        {solution.submittedAt && (
          <div className={styles.dateItem}>
            <span className={styles.dateLabel}>📬 Отправлено:</span>
            <span className={styles.dateValue}>{formatDate(solution.submittedAt)}</span>
          </div>
        )}
      </div>

      {}
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

      {}
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
                  <a href={solution.videoUrl} target="_blank" rel="noopener noreferrer">
                    Смотреть видео
                  </a>
                </div>
              </div>
            )}
            {solution.attachmentUrl && (
              <div className={styles.attachmentCard}>
                <div className={styles.attachmentIcon}>📎</div>
                <div className={styles.attachmentInfo}>
                  <div className={styles.attachmentName}>Вложение</div>
                  <a href={solution.attachmentUrl} target="_blank" rel="noopener noreferrer">
                    Скачать файл
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {}
      {solution.selfAssessment && solution.selfAssessment.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>🤔</span>
            Самооценка студента
          </h3>
          <div className={styles.selfAssessmentList}>
            {solution.selfAssessment.map((item, index) => (
              <div key={item.criterionId} className={styles.selfAssessmentCard}>
                <div className={styles.selfAssessmentHeader}>
                  <span className={styles.selfAssessmentCriterion}>
                    Критерий {index + 1}
                  </span>
                  <span className={styles.selfAssessmentValue}>
                    {formatSelfAssessmentValue(item)}
                  </span>
                </div>
                {item.comment && (
                  <div className={styles.selfAssessmentComment}>
                    💬 {item.comment}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};