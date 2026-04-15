import React, { useState } from 'react';
import styles from './GradingPanel.module.css';

interface GradingPanelProps {
  title?: string;
  initialScore?: number;
  initialComment?: string;
  onSubmit: (score: number, comment: string) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export const GradingPanel: React.FC<GradingPanelProps> = ({
  initialScore = 3,
  initialComment = '',
  onSubmit,
  onCancel,
  isSubmitting = false
}) => {
  const [score, setScore] = useState(initialScore);
  const [comment, setComment] = useState(initialComment);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(score, comment);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.panel}>
      <div className={styles.sliderContainer}>
        <label className={styles.label}>
          Оценка: <span className={styles.score}>{score}</span>/5
        </label>
        <input
          type="range"
          min="1"
          max="5"
          value={score}
          onChange={(e) => setScore(parseInt(e.target.value))}
          className={styles.slider}
          disabled={isSubmitting}
        />
        <div className={styles.scoreLabels}>
          <span>1</span>
          <span>2</span>
          <span>3</span>
          <span>4</span>
          <span>5</span>
        </div>
      </div>

      <div className={styles.commentContainer}>
        <label className={styles.label} htmlFor="comment">
          Комментарий (опционально)
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className={styles.textarea}
          placeholder="Добавьте комментарий к оценке..."
          rows={4}
          disabled={isSubmitting}
        />
      </div>

      <div className={styles.actions}>
        {onCancel && (
          <button 
            type="button" 
            onClick={onCancel} 
            className={styles.cancelButton}
            disabled={isSubmitting}
          >
            Отмена
          </button>
        )}
        <button 
          type="submit" 
          className={styles.submitButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Сохранение...' : 'Оценить'}
        </button>
      </div>
    </form>
  );
};