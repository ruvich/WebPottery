// features/grading/GradingPanel.tsx
import React, { useState } from 'react';
import styles from './GradingPanel.module.css';

interface GradingPanelProps {
  initialScore: number;
  initialComment?: string;
  onSubmit: (score: number, comment?: string) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  showComment?: boolean;
  title?: string;
}

export const GradingPanel: React.FC<GradingPanelProps> = ({
  initialScore,
  initialComment = '',
  onSubmit,
  onCancel,
  isSubmitting = false,
  showComment = true,
  title
}) => {
  const [score, setScore] = useState(initialScore);
  const [comment, setComment] = useState(initialComment);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (showComment) {
      await onSubmit(score, comment);
    } else {
      await onSubmit(score);
    }
  };

  const getScoreColor = (score: number) => {
    if (score <= 2) return '#e74c3c';
    if (score <= 3) return '#f39c12';
    if (score <= 4) return '#3498db';
    return '#27ae60';
  };

  const getScoreLabel = (score: number) => {
    if (score === 1) return 'Очень плохо';
    if (score === 2) return 'Плохо';
    if (score === 3) return 'Удовлетворительно';
    if (score === 4) return 'Хорошо';
    if (score === 5) return 'Отлично';
    return '';
  };

  return (
    <div className={styles.gradingPanel}>
      {title && <h3 className={styles.title}>{title}</h3>}
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          
          {}
          <input
            type="range"
            min="1"
            max="5"
            step="1"
            value={score}
            onChange={(e) => setScore(Number(e.target.value))}
            disabled={isSubmitting}
            className={styles.slider}
            style={{
              background: `linear-gradient(to right, ${getScoreColor(1)} 0%, ${getScoreColor(score)} ${(score-1)*25}%, #e0e0e0 ${(score-1)*25}%)`
            }}
          />
          
          
          
          <div className={styles.scoreInfo}>
            <span className={styles.scoreValue} style={{ color: getScoreColor(score) }}>
              {score}/5
            </span>
            <span className={styles.scoreLabel}>{getScoreLabel(score)}</span>
          </div>
        </div>
        
        {showComment && (
          <div className={styles.formGroup}>
            <label>Комментарий (необязательно):</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={isSubmitting}
              rows={3}
              placeholder="Добавьте комментарий к оценке..."
              className={styles.textarea}
            />
          </div>
        )}
        
        <div className={styles.actions}>
          <button type="submit" disabled={isSubmitting} className={styles.submitButton}>
            {isSubmitting ? 'Сохранение...' : 'Сохранить оценку'}
          </button>
          {onCancel && (
            <button type="button" onClick={onCancel} disabled={isSubmitting} className={styles.cancelButton}>
              Отмена
            </button>
          )}
        </div>
      </form>
    </div>
  );
};