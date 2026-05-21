
import React, { useState, useEffect } from 'react';
import styles from './GradingPanel.module.css';

interface GradingPanelProps {
  initialScore?: number;
  initialComment?: string;
  onSubmit: (score: number, comment?: string) => void | Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  showComment?: boolean;
  title?: string;
  minScore?: number;
  maxScore: number;
  step?: number;
}

export const GradingPanel: React.FC<GradingPanelProps> = ({
  initialScore = 0,
  initialComment = '',
  onSubmit,
  onCancel,
  isSubmitting = false,
  showComment = true,
  title = 'Оценка',
  minScore = 0,
  maxScore,
  step = 0.5,
}) => {
  const [score, setScore] = useState(initialScore);
  const [comment, setComment] = useState(initialComment);

  useEffect(() => {
    console.log('🎯 GradingPanel mounted with:', {
      initialScore,
      maxScore,
      minScore,
      step,
      title
    });
  }, [initialScore, maxScore, minScore, step, title]);

  const handleScoreChange = (value: number) => {
    const rounded = Math.round(value * 10) / 10;
    const validScore = Math.min(Math.max(rounded, minScore), maxScore);
    setScore(validScore);
  };

  const handleSubmit = () => {
    onSubmit(score, showComment ? comment : undefined);
  };

  const scorePercentage = ((score - minScore) / (maxScore - minScore)) * 100;

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>{title}</h3>
      
      <div className={styles.scoreSection}>
        <div className={styles.scoreHeader}>
          <span className={styles.scoreLabel}>Оценка:</span>
          <span className={styles.scoreValue}>
            {score} / {maxScore}
          </span>
        </div>
        
        <div className={styles.sliderContainer}>
          <div className={styles.sliderHeader}>
            <span className={styles.sliderMin}>{minScore}</span>
            <span className={styles.sliderCurrent}>{score}</span>
            <span className={styles.sliderMax}>{maxScore}</span>
          </div>
          
          <input
            type="range"
            min={minScore}
            max={maxScore}
            step={step}
            value={score}
            onChange={(e) => handleScoreChange(parseFloat(e.target.value))}
            disabled={isSubmitting}
            className={styles.slider}
            style={{
              background: `linear-gradient(to right, #4caf50 0%, #4caf50 ${scorePercentage}%, #e0e0e0 ${scorePercentage}%, #e0e0e0 100%)`
            }}
          />
          
          <div className={styles.scoreInputWrapper}>
            <input
              type="number"
              min={minScore}
              max={maxScore}
              step={step}
              value={score}
              onChange={(e) => handleScoreChange(parseFloat(e.target.value))}
              disabled={isSubmitting}
              className={styles.scoreInput}
            />
            <span className={styles.scoreInputSuffix}>из {maxScore}</span>
          </div>
        </div>
      </div>
      
      {showComment && (
        <div className={styles.commentSection}>
          <label className={styles.commentLabel}>
            💬 Комментарий (необязательно):
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={isSubmitting}
            className={styles.commentInput}
            placeholder="Введите комментарий к оценке..."
            rows={3}
          />
        </div>
      )}
      
      <div className={styles.actions}>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className={styles.cancelButton}
          >
            Отмена
          </button>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={styles.submitButton}
        >
          {isSubmitting ? 'Сохранение...' : 'Сохранить оценку'}
        </button>
      </div>
    </div>
  );
};