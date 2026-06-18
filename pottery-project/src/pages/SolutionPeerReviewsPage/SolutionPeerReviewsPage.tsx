import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { solutionApi } from '../../shared/api/solutionApi';
import type { PeerReview } from '../../shared/api/types/solutionApi';
import styles from './SolutionPeerReviewsPage.module.css';

export const SolutionPeerReviewsPage: React.FC = () => {
  const { solutionId } = useParams<{ solutionId: string }>();
  const navigate = useNavigate();

  const [reviews, setReviews] = useState<PeerReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setAuthError(true);
      setTimeout(() => navigate('/login'), 3000);
    }
  }, [navigate]);

  const fetchReviews = useCallback(async () => {
    if (!solutionId) {
      setError('ID решения не указан');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await solutionApi.getSolutionPeerReviews(solutionId);
      setReviews(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось загрузить проверки';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [solutionId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const formatDate = (date?: string | null) => {
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
    switch (status) {
      case 'ASSIGNED': return 'Ожидает проверки';
      case 'SUBMITTED': return 'Проверено';
      case 'EXPIRED': return 'Просрочено';
      default: return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'ASSIGNED': return styles.statusPending;
      case 'SUBMITTED': return styles.statusSubmitted;
      case 'EXPIRED': return styles.statusExpired;
      default: return styles.statusPending;
    }
  };

  const hasScore = (score: number | null | undefined): score is number => {
    return score !== null && score !== undefined && score > 0;
  };

  if (authError) {
    return (
      <div className={styles.page}>
        <div className={styles.error}>
          <h2>🔒 Требуется авторизация</h2>
          <p>Для просмотра проверок необходимо войти в систему.</p>
          <p>Перенаправление на страницу входа...</p>
          <Link to="/login" className={styles.button}>
            Войти сейчас
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>Загрузка проверок...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.error}>
          <h2>❌ Ошибка</h2>
          <p>{error}</p>
          <button onClick={fetchReviews} className={styles.button}>
            Попробовать снова
          </button>
          <button onClick={() => navigate(-1)} className={styles.button}>
            Вернуться назад
          </button>
        </div>
      </div>
    );
  }

  const submittedCount = reviews.filter(r => r.status === 'SUBMITTED').length;
  const gradedReviews = reviews.filter(r => hasScore(r.score));
  const averageScore = gradedReviews.length > 0
    ? gradedReviews.reduce((sum, r) => sum + (r.score || 0), 0) / gradedReviews.length
    : null;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link to={`/solutions/${solutionId}`} className={styles.backButton}>
          ← Назад к решению
        </Link>
        <button onClick={fetchReviews} className={styles.refreshButton}>
          🔄 Обновить
        </button>
      </div>

      <div className={styles.container}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>👥 Оценки от учеников</h1>
          <div className={styles.stats}>
            <span className={styles.statItem}>Всего: <strong>{reviews.length}</strong></span>
            <span className={styles.statItem}>Проверено: <strong>{submittedCount}</strong></span>
            {averageScore !== null && (
              <span className={styles.statItem}>
                Среднее: <strong>{averageScore.toFixed(2)} / 5</strong>
              </span>
            )}
          </div>
        </div>

        {reviews.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>📭</div>
            <h2>Проверок пока нет</h2>
            <p>Это решение ещё не назначено студентам на проверку.</p>
          </div>
        ) : (
          <div className={styles.reviewsList}>
            {reviews.map((review) => (
              <div key={review.id} className={styles.reviewCard}>
                <div className={styles.reviewHeader}>
                  <span className={styles.reviewerName}>
                    {review.reviewerName || `Студент ${review.reviewerId.slice(0, 8)}`}
                  </span>
                  <span className={`${styles.status} ${getStatusClass(review.status)}`}>
                    {getStatusLabel(review.status)}
                  </span>
                </div>

                <div className={styles.reviewBody}>
                  {hasScore(review.score) ? (
                    <div className={styles.scoreRow}>
                      <span className={styles.scoreValue}>{review.score} / 5</span>
                      <span className={styles.stars}>
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < (review.score || 0) ? styles.starFilled : styles.starEmpty}>
                            ★
                          </span>
                        ))}
                      </span>
                    </div>
                  ) : (
                    <span className={styles.noScore}>Оценка ещё не выставлена</span>
                  )}

                  {review.comment && (
                    <div className={styles.commentBox}>
                      <strong>💬 Комментарий:</strong>
                      <p>{review.comment}</p>
                    </div>
                  )}

                  <div className={styles.metaRow}>
                    <span>Назначено: {formatDate(review.createdAt)}</span>
                    {review.submittedAt && (
                      <span>Проверено: {formatDate(review.submittedAt)}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
