
import React, { useEffect, useState } from 'react';
import { solutionApi } from '../../shared/api/solutionApi';
import type { CriterionGradeResponse } from '../../shared/api/types/solutionApi';
import styles from './CriterionGradeDisplay.module.css';

interface CriterionGradeDisplayProps {
  solutionId: string;
}

export const CriterionGradeDisplay: React.FC<CriterionGradeDisplayProps> = ({ solutionId }) => {
  const [data, setData] = useState<CriterionGradeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await solutionApi.getCriterionGrade(solutionId);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load criterion grade');
      } finally {
        setLoading(false);
      }
    };

    if (solutionId) {
      fetchData();
    }
  }, [solutionId]);

  if (loading) {
    return <div className={styles.loading}>Загрузка оценок...</div>;
  }

  if (error || !data) {
    return <div className={styles.error}>Ошибка загрузки: {error}</div>;
  }

  const formatScore = (score: number): string => {
    if (score === undefined || score === null) return '0';
    return score % 1 === 0 ? score.toString() : score.toFixed(1);
  };

  const formatValue = (item: any, criterion: any) => {
    if (!item) return '—';
    
    switch (criterion.type) {
      case 'YES_NO':
        return item.booleanValue ? '✅ Да' : '❌ Нет';
      case 'PERCENT':
        return `${item.percentValue ?? item.pointsValue}%`;
      case 'POINTS':
      default:
        return formatScore(item.calculatedScore);
    }
  };

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return styles.high;
    if (percentage >= 60) return styles.medium;
    return styles.low;
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>📊 Детальная оценка по критериям</h3>
      
      {}
      <div className={styles.summary}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryHeader}>
            <span className={styles.summaryLabel}>Итоговая оценка</span>
            <span className={styles.summaryValue}>{formatScore(data.finalScore)}</span>
            <span className={styles.summaryMax}>/ {formatScore(data.maxFinalScore)}</span>
          </div>
          
          <div className={styles.summaryDetails}>
            <div className={styles.summaryItem}>
              <span>Raw score:</span>
              <span>{formatScore(data.rawScore)}</span>
            </div>
            <div className={styles.summaryItem}>
              <span>Regular score:</span>
              <span>{formatScore(data.regularScore)}</span>
            </div>
            {data.bonusScore > 0 && (
              <div className={`${styles.summaryItem} ${styles.bonus}`}>
                <span>✨ Бонус:</span>
                <span>+{formatScore(data.bonusScore)}</span>
              </div>
            )}
            {data.latePenalty > 0 && (
              <div className={`${styles.summaryItem} ${styles.penalty}`}>
                <span>⏰ Штраф за просрочку ({data.lateDays} дн.):</span>
                <span>-{formatScore(data.latePenalty)}</span>
              </div>
            )}
            {data.progressPenalty > 0 && (
              <div className={`${styles.summaryItem} ${styles.penalty}`}>
                <span>📉 Штраф за прогресс ({data.progressMissesCount} проп.):</span>
                <span>-{formatScore(data.progressPenalty)}</span>
              </div>
            )}
          </div>
          
          <div className={styles.gradedInfo}>
            <span>Оценено: {new Date(data.gradedAt).toLocaleString('ru-RU')}</span>
          </div>
        </div>
      </div>
      
      {}
      <div className={styles.criteriaList}>
        <h4 className={styles.criteriaTitle}>Оценка по критериям</h4>
        
        {data.items.map((item, index) => (
          <div key={item.criterion.id} className={styles.criterionCard}>
            <div className={styles.criterionHeader}>
              <div className={styles.criterionInfo}>
                <span className={styles.criterionName}>
                  {index + 1}. {item.criterion.title}
                </span>
                {item.criterion.description && (
                  <span className={styles.criterionDescription}>{item.criterion.description}</span>
                )}
              </div>
              <div className={styles.criterionMaxScore}>
                Макс: {formatScore(item.criterion.maxScore)}
              </div>
            </div>
            
            <div className={styles.comparisonGrid}>
              {}
              <div className={styles.assessmentCard}>
                <div className={styles.assessmentHeader}>
                  <span className={styles.assessmentIcon}>🤔</span>
                  <span className={styles.assessmentTitle}>Самооценка студента</span>
                </div>
                {item.selfAssessment ? (
                  <div className={styles.assessmentContent}>
                    <div className={`${styles.assessmentScore} ${getScoreColor(item.selfAssessment.calculatedScore, item.criterion.maxScore)}`}>
                      {formatValue(item.selfAssessment, item.criterion)}
                      <span className={styles.assessmentScoreDetails}>
                        &nbsp;({formatScore(item.selfAssessment.calculatedScore)} / {formatScore(item.criterion.maxScore)})
                      </span>
                    </div>
                    {item.selfAssessment.comment && (
                      <div className={styles.assessmentComment}>
                        💬 {item.selfAssessment.comment}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={styles.noAssessment}>Нет самооценки</div>
                )}
              </div>
              
              {}
              <div className={styles.assessmentCard}>
                <div className={styles.assessmentHeader}>
                  <span className={styles.assessmentIcon}>👨‍🏫</span>
                  <span className={styles.assessmentTitle}>Оценка преподавателя</span>
                </div>
                {item.teacherAssessment ? (
                  <div className={styles.assessmentContent}>
                    <div className={`${styles.assessmentScore} ${getScoreColor(item.teacherAssessment.calculatedScore, item.criterion.maxScore)}`}>
                      {formatValue(item.teacherAssessment, item.criterion)}
                      <span className={styles.assessmentScoreDetails}>
                        &nbsp;({formatScore(item.teacherAssessment.calculatedScore)} / {formatScore(item.criterion.maxScore)})
                      </span>
                    </div>
                    {item.teacherAssessment.teacherComment && (
                      <div className={styles.assessmentComment}>
                        💬 {item.teacherAssessment.teacherComment}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={styles.noAssessment}>Оценка не выставлена</div>
                )}
              </div>
            </div>
            
            {}
            {item.selfAssessment && item.teacherAssessment && (
              <div className={styles.difference}>
                {item.selfAssessment.calculatedScore !== item.teacherAssessment.calculatedScore && (
                  <span className={styles.differenceText}>
                    Разница: {Math.abs(item.selfAssessment.calculatedScore - item.teacherAssessment.calculatedScore).toFixed(1)} баллов
                    {item.selfAssessment.calculatedScore > item.teacherAssessment.calculatedScore 
                      ? ' (студент завысил)' 
                      : ' (студент занизил)'}
                  </span>
                )}
                {item.selfAssessment.calculatedScore === item.teacherAssessment.calculatedScore && (
                  <span className={styles.matchText}>✅ Оценки совпадают</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};