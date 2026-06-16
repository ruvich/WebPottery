import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { solutionApi } from '../../shared/api/solutionApi';
import type { PeerReviewWithSolution } from '../../shared/api/types/solutionApi';
import styles from './MyPeerReviewsPage.module.css';

export const MyPeerReviewsPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  
  const [reviews, setReviews] = useState<PeerReviewWithSolution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authError, setAuthError] = useState(false);

  // Проверка авторизации
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setAuthError(true);
      setTimeout(() => navigate('/login'), 3000);
    }
  }, [navigate]);

  // Загрузка списка ревью
  useEffect(() => {
    const fetchReviews = async () => {
      if (!postId) {
        setError('ID задания не указан');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        console.log('📥 Fetching peer reviews for post:', postId);
        
        const data = await solutionApi.getMyPeerReviews(postId);
        console.log('✅ Peer reviews loaded:', data);
        setReviews(data);
        
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Не удалось загрузить список проверок';
        setError(message);
        console.error('❌ Error loading peer reviews:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [postId]);

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

  const isDeadlineExpired = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  const getTimeRemaining = (deadline: string) => {
    const diff = new Date(deadline).getTime() - new Date().getTime();
    if (diff <= 0) return 'Просрочено';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days} дн. ${hours} ч.`;
    }
    return `${hours} ч.`;
  };

  // Функция для безопасной проверки наличия оценки
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
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Загрузка ваших проверок...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.error}>
          <h2>❌ Ошибка</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className={styles.button}>
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>📋 Мои проверки</h1>
        <div className={styles.stats}>
          <span className={styles.statItem}>
            Всего: <strong>{reviews.length}</strong>
          </span>
          <span className={styles.statItem}>
            Ожидают: <strong>{reviews.filter(r => r.review.status === 'ASSIGNED').length}</strong>
          </span>
          <span className={styles.statItem}>
            Проверено: <strong>{reviews.filter(r => r.review.status === 'SUBMITTED').length}</strong>
          </span>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>📭</div>
          <h2>Нет назначенных проверок</h2>
          <p>Вам пока не назначены решения для проверки.</p>
        </div>
      ) : (
        <div className={styles.reviewsGrid}>
          {reviews.map(({ review, solution, reviewDeadline }) => {
            const isExpired = isDeadlineExpired(reviewDeadline);
            const isSubmitted = review.status === 'SUBMITTED';
            const reviewScore = review.score; // может быть null
            
            return (
              <Link
                key={review.id}
                to={`/peer-review/${solution.id}`}
                className={`${styles.reviewCard} ${isExpired ? styles.expired : ''} ${isSubmitted ? styles.submitted : ''}`}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitle}>
                    <span className={styles.solutionId}>
                      Решение #{solution.id.slice(0, 8)}
                    </span>
                    <span className={`${styles.status} ${getStatusClass(review.status)}`}>
                      {getStatusLabel(review.status)}
                    </span>
                  </div>
                </div>

                <div className={styles.cardContent}>
                  <div className={styles.studentInfo}>
                    <span className={styles.label}>Студент:</span>
                    <span className={styles.value}>
                      {solution.studentName || solution.studentId || 'Не указан'}
                    </span>
                  </div>

                  <div className={styles.solutionPreview}>
                    <span className={styles.label}>Текст:</span>
                    <span className={styles.value}>
                      {solution.text?.slice(0, 100) || 'Текст отсутствует'}
                      {solution.text && solution.text.length > 100 && '...'}
                    </span>
                  </div>

                  <div className={styles.metaInfo}>
                    <div className={styles.metaItem}>
                      <span className={styles.label}> Отправлено:</span>
                      <span className={styles.value}>{formatDate(solution.submittedAt)}</span>
                    </div>
                    
                    <div className={styles.metaItem}>
                      <span className={styles.label}> Дедлайн:</span>
                      <span className={`${styles.value} ${isExpired ? styles.expiredText : styles.activeText}`}>
                        {formatDate(reviewDeadline)}
                        {!isExpired && !isSubmitted && (
                          <span className={styles.timeRemaining}>
                            ({getTimeRemaining(reviewDeadline)})
                          </span>
                        )}
                      </span>
                    </div>

                    {/* Проверяем наличие оценки перед отображением */}
                    {hasScore(reviewScore) && (
                      <div className={styles.metaItem}>
                        <span className={styles.label}>Оценка:</span>
                        <span className={styles.scoreValue}>
                          {reviewScore} / 5
                          <span className={styles.stars}>
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={i < reviewScore ? styles.starFilled : styles.starEmpty}>
                                ★
                              </span>
                            ))}
                          </span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.cardFooter}>
                  {isSubmitted ? (
                    <span className={styles.submittedLabel}> Уже проверено</span>
                  ) : isExpired ? (
                    <span className={styles.expiredLabel}> Дедлайн просрочен</span>
                  ) : (
                    <button className={styles.reviewButton}>
                      📝 Проверить решение
                    </button>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};