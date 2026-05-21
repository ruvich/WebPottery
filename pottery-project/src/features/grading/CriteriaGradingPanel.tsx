
import React, { useState, useEffect } from 'react';
import { solutionApi } from '../../shared/api/solutionApi';
import type { 
  CriterionGradeResponse, 
  CriterionGradeRequestItem 
} from '../../shared/api/types/solutionApi';
import styles from './CriteriaGradingPanel.module.css';

interface Criterion {
  id: string;
  title: string;
  description?: string;
  type: 'RANGE' | 'BOOLEAN' | 'SCALE' | 'PERCENT' | 'YES_NO' | 'POINTS';
  maxScore: number;
  impactType?: string;
  displayOrder?: number;
}

interface CriteriaGradingPanelProps {
  solutionId: string;
  criteria: Criterion[];
  onGradeSubmitted?: () => void;
  isSubmitting?: boolean;
}

export const CriteriaGradingPanel: React.FC<CriteriaGradingPanelProps> = ({
  solutionId,
  criteria,
  onGradeSubmitted,
  isSubmitting: externalIsSubmitting = false,
}) => {
  const [grades, setGrades] = useState<Map<string, CriterionGradeRequestItem>>(new Map());
  const [progressMissesCount, setProgressMissesCount] = useState(0);
  const [comments, setComments] = useState<Map<string, string>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingGradeData, setExistingGradeData] = useState<CriterionGradeResponse | null>(null);

  useEffect(() => {
    const fetchExistingGrades = async () => {
      try {
        setIsLoading(true);
        const data = await solutionApi.getCriterionGrade(solutionId);
        setExistingGradeData(data);
        
        const gradesMap = new Map<string, CriterionGradeRequestItem>();
        const commentsMap = new Map<string, string>();
        
        data.items.forEach(item => {
          if (item.teacherAssessment) {
            const assessment = item.teacherAssessment;
            gradesMap.set(item.criterion.id, {
              criterionId: item.criterion.id,
              valueType: assessment.valueType as 'POINTS' | 'PERCENT' | 'YES_NO',
              pointsValue: assessment.pointsValue,
              booleanValue: assessment.booleanValue,
              percentValue: assessment.percentValue,
              teacherComment: assessment.teacherComment,
            });
            
            if (assessment.teacherComment) {
              commentsMap.set(item.criterion.id, assessment.teacherComment);
            }
          }
        });
        
        setGrades(gradesMap);
        setComments(commentsMap);
        setProgressMissesCount(data.progressMissesCount || 0);
        
      } catch (error) {
        console.error('Failed to fetch existing grades:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (solutionId) {
      fetchExistingGrades();
    }
  }, [solutionId]);

  const getCurrentScore = (criterion: Criterion): number => {
    const grade = grades.get(criterion.id);
    if (!grade) return 0;
    
    switch (criterion.type) {
      case 'BOOLEAN':
      case 'YES_NO':
        return grade.booleanValue ? criterion.maxScore : 0;
      case 'PERCENT':
        if (grade.pointsValue !== undefined && grade.pointsValue !== null) return grade.pointsValue;
        if (grade.percentValue !== undefined && grade.percentValue !== null) return (grade.percentValue / 100) * criterion.maxScore;
        return 0;
      case 'RANGE':
      case 'SCALE':
      case 'POINTS':
      default:
        return grade.pointsValue || 0;
    }
  };

  const getCurrentPercent = (criterion: Criterion): number => {
    const grade = grades.get(criterion.id);
    if (!grade) return 0;
    
    if (grade.percentValue !== undefined && grade.percentValue !== null) return grade.percentValue;
    if (grade.pointsValue !== undefined && grade.pointsValue !== null) return (grade.pointsValue / criterion.maxScore) * 100;
    return 0;
  };

  const handlePointsChange = (criterionId: string, value: number, maxScore: number) => {
    const rounded = Math.round(value * 10) / 10;
    const validScore = Math.min(Math.max(rounded, 0), maxScore);
    
    setGrades(prev => new Map(prev.set(criterionId, {
      criterionId,
      valueType: 'POINTS',
      pointsValue: validScore,
      booleanValue: null,
      percentValue: null,
      teacherComment: comments.get(criterionId) || null,
    })));
  };

  const handlePercentChange = (criterionId: string, percent: number, maxScore: number) => {
    const validPercent = Math.min(Math.max(percent, 0), 100);
    const roundedPercent = Math.round(validPercent);
    const calculatedScore = (roundedPercent / 100) * maxScore;
    const roundedScore = Math.round(calculatedScore * 10) / 10;
    
    setGrades(prev => new Map(prev.set(criterionId, {
      criterionId,
      valueType: 'PERCENT',
      pointsValue: roundedScore,
      booleanValue: null,
      percentValue: roundedPercent,
      teacherComment: comments.get(criterionId) || null,
    })));
  };

  const handleBooleanChange = (criterionId: string, value: boolean, maxScore: number) => {
    setGrades(prev => new Map(prev.set(criterionId, {
      criterionId,
      valueType: 'YES_NO',
      pointsValue: value ? maxScore : 0,
      booleanValue: value,
      percentValue: null,
      teacherComment: comments.get(criterionId) || null,
    })));
  };

  const handleCommentChange = (criterionId: string, comment: string) => {
    const newComments = new Map(comments);
    newComments.set(criterionId, comment);
    setComments(newComments);
    
    const existing = grades.get(criterionId);
    if (existing) {
      setGrades(prev => new Map(prev.set(criterionId, { ...existing, teacherComment: comment || null })));
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      const items: CriterionGradeRequestItem[] = Array.from(grades.values()).map(item => ({
        criterionId: item.criterionId,
        valueType: item.valueType,
        pointsValue: item.pointsValue ?? null,
        booleanValue: item.booleanValue ?? null,
        percentValue: item.percentValue ?? null,
        teacherComment: item.teacherComment ?? null,
      }));
      
      await solutionApi.gradeByCriteria(solutionId, {
        items,
        progressMissesCount,
      });
      
      const updatedData = await solutionApi.getCriterionGrade(solutionId);
      setExistingGradeData(updatedData);
      
      const gradesMap = new Map<string, CriterionGradeRequestItem>();
      const commentsMap = new Map<string, string>();
      
      updatedData.items.forEach(item => {
        if (item.teacherAssessment) {
          const assessment = item.teacherAssessment;
          gradesMap.set(item.criterion.id, {
            criterionId: item.criterion.id,
            valueType: assessment.valueType as 'POINTS' | 'PERCENT' | 'YES_NO',
            pointsValue: assessment.pointsValue,
            booleanValue: assessment.booleanValue,
            percentValue: assessment.percentValue,
            teacherComment: assessment.teacherComment,
          });
          
          if (assessment.teacherComment) {
            commentsMap.set(item.criterion.id, assessment.teacherComment);
          }
        }
      });
      
      setGrades(gradesMap);
      setComments(commentsMap);
      
      if (onGradeSubmitted) {
        onGradeSubmitted();
      }
      
      alert('Оценки успешно сохранены!');
    } catch (error) {
      console.error('Submit error:', error);
      alert('Ошибка при сохранении оценок: ' + (error instanceof Error ? error.message : 'Неизвестная ошибка'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatScore = (score: number): string => {
    if (score === undefined || score === null) return '0';
    return score % 1 === 0 ? score.toString() : score.toFixed(1);
  };

  const getStep = (maxScore: number): number => {
    if (maxScore <= 2) return 0.1;
    if (maxScore <= 10) return 0.5;
    return 1;
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Загрузка существующих оценок...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>      
      {/* Показываем итоговую оценку если есть */}
      {existingGradeData && (
        <div className={styles.summaryBar}>
          <div className={styles.summaryInfo}>
            <span className={styles.summaryLabel}>Итоговая оценка:</span>
            <span className={styles.summaryScore}>
              {formatScore(existingGradeData.finalScore)} / {formatScore(existingGradeData.maxFinalScore)}
            </span>
          </div>
          {existingGradeData.gradedAt && (
            <div className={styles.summaryDate}>
              Оценено: {new Date(existingGradeData.gradedAt).toLocaleString('ru-RU')}
            </div>
          )}
        </div>
      )}
      


      <div className={styles.criteriaList}>
        {criteria.map((criterion) => {
          const currentScore = getCurrentScore(criterion);
          const currentPercent = getCurrentPercent(criterion);
          const step = criterion.type === 'PERCENT' ? 1 : getStep(criterion.maxScore);
          const scorePercentage = (currentScore / criterion.maxScore) * 100;
          
          const selfAssessment = existingGradeData?.items.find(
            item => item.criterion.id === criterion.id
          )?.selfAssessment;
          
          return (
            <div key={criterion.id} className={styles.criterionCard}>
              <div className={styles.criterionHeader}>
                <div className={styles.criterionInfo}>
                  <span className={styles.criterionTitle}>{criterion.title}</span>
                  {criterion.description && (
                    <div className={styles.criterionDescription}>{criterion.description}</div>
                  )}
                  {selfAssessment && (
                    <div className={styles.selfAssessmentHint}>
                      Самооценка студента: {selfAssessment.calculatedScore} / {criterion.maxScore}
                      {selfAssessment.comment && ` (${selfAssessment.comment})`}
                    </div>
                  )}
                </div>
                <div className={styles.criterionStats}>
                  <span className={styles.currentScore}>
                    {criterion.type === 'PERCENT' 
                      ? `${currentPercent}%` 
                      : formatScore(currentScore)}
                  </span>
                  <span className={styles.maxScore}>
                    {criterion.type === 'PERCENT' 
                      ? `(макс: ${formatScore(criterion.maxScore)})`
                      : `/ ${formatScore(criterion.maxScore)}`}
                  </span>
                </div>
              </div>
              
              <div className={styles.gradingControls}>
                {/* Тип YES_NO или BOOLEAN - кнопки */}
                {(criterion.type === 'YES_NO' || criterion.type === 'BOOLEAN') && (
                  <div className={styles.booleanControl}>
                    <button
                      type="button"
                      className={`${styles.booleanButton} ${currentScore === criterion.maxScore ? styles.active : ''}`}
                      onClick={() => handleBooleanChange(criterion.id, true, criterion.maxScore)}
                      disabled={isSubmitting || externalIsSubmitting}
                    >
                      ✅ Да / Выполнено (+{formatScore(criterion.maxScore)})
                    </button>
                    <button
                      type="button"
                      className={`${styles.booleanButton} ${currentScore === 0 ? styles.active : ''}`}
                      onClick={() => handleBooleanChange(criterion.id, false, criterion.maxScore)}
                      disabled={isSubmitting || externalIsSubmitting}
                    >
                      ❌ Нет / Не выполнено (0)
                    </button>
                  </div>
                )}

                {}
                {criterion.type === 'PERCENT' && (
                  <div className={styles.sliderContainer}>
                    <div className={styles.sliderHeader}>
                      <span className={styles.sliderMin}>0%</span>
                      <span className={styles.sliderCurrent}>
                        {currentPercent}%
                      </span>
                      <span className={styles.sliderMax}>100%</span>
                    </div>
                    
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={currentPercent}
                      onChange={(e) => handlePercentChange(criterion.id, parseFloat(e.target.value), criterion.maxScore)}
                      disabled={isSubmitting || externalIsSubmitting}
                      style={{ width: '100%' }}
                    />
                    
                    <div className={styles.scoreInputWrapper}>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={currentPercent}
                        onChange={(e) => handlePercentChange(criterion.id, parseFloat(e.target.value), criterion.maxScore)}
                        disabled={isSubmitting || externalIsSubmitting}
                        className={styles.scoreInput}
                      />
                      <span className={styles.scoreInputSuffix}>%</span>
                      <span className={styles.scoreCalculated}>
                        = {formatScore(currentScore)} / {formatScore(criterion.maxScore)}
                      </span>
                    </div>
                  </div>
                )}

                {}
                {(criterion.type === 'POINTS' || criterion.type === 'RANGE' || criterion.type === 'SCALE') && (
                  <div className={styles.sliderContainer}>
                    <div className={styles.sliderHeader}>
                      <span className={styles.sliderMin}>0</span>
                      <span className={styles.sliderCurrent}>
                        {formatScore(currentScore)}
                      </span>
                      <span className={styles.sliderMax}>
                        {formatScore(criterion.maxScore)}
                      </span>
                    </div>
                    
                    <input
                      type="range"
                      min="0"
                      max={criterion.maxScore}
                      step={step}
                      value={currentScore}
                      onChange={(e) => handlePointsChange(criterion.id, parseFloat(e.target.value), criterion.maxScore)}
                      disabled={isSubmitting || externalIsSubmitting}
                      style={{ 
                        width: '100%',
                        background: `linear-gradient(to right, #4caf50 0%, #4caf50 ${scorePercentage}%, #e0e0e0 ${scorePercentage}%, #e0e0e0 100%)`
                      }}
                    />
                    
                    <div className={styles.scoreInputWrapper}>
                      <input
                        type="number"
                        min="0"
                        max={criterion.maxScore}
                        step={step}
                        value={currentScore}
                        onChange={(e) => handlePointsChange(criterion.id, parseFloat(e.target.value), criterion.maxScore)}
                        disabled={isSubmitting || externalIsSubmitting}
                        className={styles.scoreInput}
                      />
                      <span className={styles.scoreInputSuffix}>из {formatScore(criterion.maxScore)}</span>
                    </div>
                  </div>
                )}
                
                <textarea
                  placeholder="📝 Комментарий преподавателя (необязательно)..."
                  value={comments.get(criterion.id) || ''}
                  onChange={(e) => handleCommentChange(criterion.id, e.target.value)}
                  disabled={isSubmitting || externalIsSubmitting}
                  className={styles.commentInput}
                  rows={2}
                />
              </div>
            </div>
          );
        })}
      </div>
      
      <div className={styles.progressSection}>
        <div className={styles.progressCard}>
          <label className={styles.progressLabel}>
            <span className={styles.progressIcon}>📉</span>
            Количество пропусков прогресса:
            <input
              type="number"
              min="0"
              value={progressMissesCount}
              onChange={(e) => setProgressMissesCount(parseInt(e.target.value) || 0)}
              disabled={isSubmitting || externalIsSubmitting}
              className={styles.progressInput}
            />
            <span className={styles.progressHint}>шт.</span>
          </label>
        </div>
      </div>
      
      <div className={styles.actions}>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || externalIsSubmitting}
          className={styles.submitButton}
        >
          {isSubmitting || externalIsSubmitting ? '💾 Сохранение...' : 'Оценить'}
        </button>
      </div>
    </div>
  );
};