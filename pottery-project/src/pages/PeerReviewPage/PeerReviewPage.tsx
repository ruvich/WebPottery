import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { solutionApi } from '../../shared/api/solutionApi';
import type { 
  PeerReview, 
  SubmitPeerReviewRequest,
  Solution 
} from '../../shared/api/types/solutionApi';
import { GradingPanel } from '../../features/grading/GradingPanel';
import styles from './PeerReviewPage.module.css';

export const PeerReviewPage: React.FC = () => {
  const { solutionId } = useParams<{ solutionId: string }>();
  const navigate = useNavigate();
  
  const [peerReview, setPeerReview] = useState<PeerReview | null>(null);
  const [solution, setSolution] = useState<Solution | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [authError, setAuthError] = useState(false);
  const [reviewDeadline, setReviewDeadline] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Проверка авторизации
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setAuthError(true);
      setTimeout(() => navigate('/login'), 3000);
    }
  }, [navigate]);

  // Загрузка данных
  const fetchPeerReview = useCallback(async () => {
    if (!solutionId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const review = await solutionApi.getPeerReviewBySolutionId(solutionId);
      setPeerReview(review);
      
      try {
        const solutionData = await solutionApi.getSolutionById(solutionId);
        setSolution(solutionData);
      } catch (solutionErr) {
        if (review) {
          const minimalSolution: Solution = {
            id: solutionId,
            postId: review.postId,
            text: 'Данные решения не загружены',
            status: 'SUBMITTED',
            ownerType: 'STUDENT',
            studentId: '',
            studentName: 'Неизвестный студент',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            submittedAt: new Date().toISOString()
          };
          setSolution(minimalSolution);
        } else {
          throw solutionErr;
        }
      }
      
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось загрузить данные';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [solutionId]);

  // Альтернативный метод загрузки через список ревью
  const fetchPeerReviewViaList = useCallback(async () => {
    if (!solutionId) return;
    
    try {
      const solutionData = await solutionApi.getSolutionById(solutionId);
      
      if (solutionData.postId) {
        const myReviews = await solutionApi.getMyPeerReviews(solutionData.postId);
        const myReview = myReviews.find(r => r.review.solutionId === solutionId);
        
        if (myReview) {
          setPeerReview(myReview.review);
          setSolution(myReview.solution);
          setReviewDeadline(myReview.reviewDeadline);
        } else {
          setError('Ревью не назначено на вас');
        }
      }
    } catch (err) {
      console.error('Alternative method failed:', err);
    }
  }, [solutionId]);

  useEffect(() => {
    fetchPeerReview();
  }, [fetchPeerReview, refreshKey]);

  useEffect(() => {
    if (!loading && error && error.includes('прав')) {
      fetchPeerReviewViaList();
    }
  }, [loading, error, fetchPeerReviewViaList]);

  // Автоматическое скрытие сообщения об успехе
  useEffect(() => {
    if (showSuccessMessage) {
      const timer = setTimeout(() => setShowSuccessMessage(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessMessage]);

  const handleSubmitReview = async (score: number, comment?: string) => {
    if (!solutionId) return;

    try {
      setIsSubmitting(true);
      setError(null);
      
      const submitData: SubmitPeerReviewRequest = {
        score,
        comment: comment || undefined
      };
      
      const updatedReview = await solutionApi.submitPeerReview(solutionId, submitData);
      
      setPeerReview(updatedReview);
      setIsEditing(false);
      setShowSuccessMessage(true);
      
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось сохранить ревью';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!solutionId || !peerReview?.score) return;
    
    const confirmDelete = window.confirm('Вы уверены, что хотите удалить свою оценку? Это действие нельзя отменить.');
    if (!confirmDelete) return;
    
    try {
      setIsSubmitting(true);
      const deleteData: SubmitPeerReviewRequest = {
        score: 0,
        comment: ''
      };
      const updatedReview = await solutionApi.submitPeerReview(solutionId, deleteData);
      setPeerReview(updatedReview);
      setShowSuccessMessage(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось удалить оценку';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

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

  const isReviewSubmitted = peerReview?.status === 'SUBMITTED';
  const isReviewExpired = peerReview?.status === 'EXPIRED';
  const canEdit = !isReviewExpired;
  const hasExistingGrade = peerReview?.score !== null && peerReview?.score !== undefined && peerReview?.score > 0;

  if (authError) {
    return (
      <div className={styles.page}>
        <div className={styles.error}>
          <h2>🔒 Требуется авторизация</h2>
          <p>Для проверки решения необходимо войти в систему.</p>
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
          <div>Загрузка данных для проверки...</div>
          <div style={{ fontSize: '12px', marginTop: '10px', color: '#666' }}>
            Solution ID: {solutionId}
          </div>
        </div>
      </div>
    );
  }

  if (error || !peerReview) {
    return (
      <div className={styles.page}>
        <div className={styles.error}>
          <h2>❌ {error?.includes('прав') ? 'Доступ запрещен' : 'Ошибка'}</h2>
          <p>{error || 'Ревью не найдено'}</p>
          
          {error?.includes('прав') && (
            <div className={styles.hint}>
              <h3>💡 Возможные причины:</h3>
              <ul>
                <li>Ревью не назначено на вас</li>
                <li>Истек срок проверки</li>
                <li>Решение уже было проверено ранее</li>
                <li>Неправильный ID решения</li>
              </ul>
            </div>
          )}
          
          <div style={{ marginTop: '20px' }}>
            <button onClick={handleRefresh} className={styles.button}>
              Попробовать снова
            </button>
            <button onClick={() => navigate(-1)} className={styles.button}>
              Вернуться назад
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button onClick={() => navigate(-1)} className={styles.backButton}>
          ← Назад
        </button>
        <button onClick={handleRefresh} className={styles.refreshButton}>
          🔄 Обновить
        </button>
      </div>

      <div className={styles.container}>
        {/* Сообщение об успехе */}
        {showSuccessMessage && (
          <div className={styles.successMessage}>
            ✅ {hasExistingGrade ? 'Оценка успешно обновлена!' : 'Оценка успешно сохранена!'}
          </div>
        )}

        {/* Информация о ревью */}
        <div className={styles.reviewInfo}>
          <div className={styles.reviewHeader}>
            <h1 className={styles.title}>Проверка решения</h1>
            <span className={`${styles.status} ${getStatusClass(peerReview.status)}`}>
              {getStatusLabel(peerReview.status)}
            </span>
          </div>
          
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>📅 Назначено:</span>
              <span className={styles.infoValue}>{formatDate(peerReview.createdAt)}</span>
            </div>
            {peerReview.submittedAt && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>✅ Проверено:</span>
                <span className={styles.infoValue}>{formatDate(peerReview.submittedAt)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Детали решения */}
        {solution && (
          <div className={styles.solutionSection}>
            <h2 className={styles.sectionTitle}>📄 Решение студента</h2>
            
            <div className={styles.solutionMeta}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Студент:</span>
                <span className={styles.metaValue}>
                  {solution.studentName || solution.studentId || 'Не указан'}
                </span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Статус:</span>
                <span className={styles.metaValue}>
                  {solution.status === 'SUBMITTED' ? 'Отправлено на проверку' : 'Черновик'}
                </span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Отправлено:</span>
                <span className={styles.metaValue}>{formatDate(solution.submittedAt)}</span>
              </div>
            </div>

            <div className={styles.solutionContent}>
              <h3 className={styles.subsectionTitle}>Текст решения</h3>
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

            {/* Вложения */}
            {(solution.videoUrl || solution.attachmentUrl) && (
              <div className={styles.attachmentsSection}>
                <h3 className={styles.subsectionTitle}>📎 Вложения</h3>
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
          </div>
        )}

        {/* Панель оценивания */}
        <div className={styles.gradingSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              {hasExistingGrade && !isEditing ? '⭐ Ваша оценка' : '📝 Оценка решения'}
            </h2>
            <div className={styles.buttonGroup}>
              {canEdit && !isEditing && (
                <>
                  <button 
                    onClick={() => setIsEditing(true)}
                    className={styles.editButton}
                    disabled={isSubmitting}
                  >
                    {hasExistingGrade ? '✏️ Редактировать оценку' : '➕ Оценить решение'}
                  </button>
                  
                 
                </>
              )}
            </div>
          </div>

          {isReviewExpired && (
            <div className={styles.expiredWarning}>
              ⚠️ Срок проверки истек. Вы не можете изменить оценку.
            </div>
          )}

          {/* Отображение существующей оценки */}
          {hasExistingGrade && !isEditing && (
            <div className={styles.submittedGrade}>
              <div className={styles.gradeDisplay}>
                <span className={styles.gradeLabel}>Оценка:</span>
                <div className={styles.gradeWithStars}>
                  <span className={styles.gradeValue}>{peerReview.score}</span>
                  <span className={styles.gradeMax}>/5</span>
                  <div className={styles.starsDisplay}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <span 
                        key={star} 
                        className={star <= (peerReview.score || 0) ? styles.starFilled : styles.starEmpty}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              {peerReview.comment && (
                <div className={styles.commentDisplay}>
                  <strong>💬 Комментарий:</strong>
                  <p>{peerReview.comment}</p>
                </div>
              )}
              <div className={styles.editHint}>
                💡 Нажмите "Редактировать оценку", чтобы изменить
              </div>
            </div>
          )}

          {/* Форма редактирования/создания оценки */}
          {(isEditing || (!hasExistingGrade && !isReviewExpired && !isEditing)) && (
            <GradingPanel
              key={`peer-review-${solutionId}`}
              initialScore={peerReview.score || 3}
              initialComment={peerReview.comment || ''}
              onSubmit={handleSubmitReview}
              onCancel={() => setIsEditing(false)}
              isSubmitting={isSubmitting}
              showComment={true}
              title={hasExistingGrade ? "Редактирование оценки" : "Новая оценка"}
              minScore={1}
              maxScore={5}
              step={1}
            />
          )}
        </div>

        {/* Информация о дедлайне */}
        {reviewDeadline && (
          <div className={styles.deadlineInfo}>
            <span className={styles.deadlineIcon}>⏰</span>
            <span className={styles.deadlineText}>
              Дедлайн проверки: {formatDate(reviewDeadline)}
              {new Date(reviewDeadline) < new Date() && (
                <span className={styles.expiredText}> (Просрочено)</span>
              )}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};