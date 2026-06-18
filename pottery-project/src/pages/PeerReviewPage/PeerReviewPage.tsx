import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
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
  const location = useLocation();
  
  // Получаем данные из state (при переходе со списка ревью)
  const state = location.state as {
    peerReview?: PeerReview;
    solution?: Solution;
    reviewDeadline?: string;
  } | null;
  
  // Состояния - инициализируем из state, если есть
  const [peerReview, setPeerReview] = useState<PeerReview | null>(state?.peerReview || null);
  const [solution, setSolution] = useState<Solution | null>(state?.solution || null);
  const [loading, setLoading] = useState(!state?.peerReview || !state?.solution);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [authError, setAuthError] = useState(false);
  const [reviewDeadline, setReviewDeadline] = useState<string | null>(state?.reviewDeadline || null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Проверка авторизации
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setAuthError(true);
      setTimeout(() => navigate('/login'), 3000);
    }
  }, [navigate]);

  // Загрузка данных (только если нет данных в state)
  const fetchPeerReview = useCallback(async () => {
    // Если данные уже есть в state, не загружаем
    if (state?.peerReview && state?.solution) {
      console.log('✅ Using data from navigation state');
      setLoading(false);
      return;
    }

    if (!solutionId) {
      setError('ID решения не указан');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching peer review for solution:', solutionId);
      const review = await solutionApi.getPeerReviewBySolutionId(solutionId);
      setPeerReview(review);
      
      // Пытаемся получить решение через API
      try {
        const solutionData = await solutionApi.getSolutionById(solutionId);
        setSolution(solutionData);
      } catch (apiError) {
        console.warn('Could not fetch solution from API');
        // Если не получилось, но у нас есть ревью - создаем минимальный объект
        if (review) {
          setSolution({
            id: solutionId,
            postId: review.postId,
            text: 'Текст решения недоступен',
            status: 'SUBMITTED',
            ownerType: 'STUDENT',
            studentId: '',
            studentName: 'Студент',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            submittedAt: new Date().toISOString()
          });
        }
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Не удалось загрузить данные';
      
      if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
        setError('У вас нет прав для проверки этого решения');
      } else if (errorMessage.includes('404')) {
        setError('Ревью для этого решения не найдено');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [solutionId, state]);

  // Альтернативный метод загрузки через список ревью
  const fetchPeerReviewViaList = useCallback(async () => {
    if (!solutionId || state?.peerReview) return;
    
    try {
      const solutionData = await solutionApi.getSolutionById(solutionId);
      
      if (solutionData.postId) {
        const myReviews = await solutionApi.getMyPeerReviews(solutionData.postId);
        const myReview = myReviews.find(r => r.review.solutionId === solutionId);
        
        if (myReview) {
          setPeerReview(myReview.review);
          setSolution(myReview.solution);
          setReviewDeadline(myReview.reviewDeadline);
          setError(null);
        }
      }
    } catch {
      // Игнорируем ошибку, если альтернативный метод не сработал
    }
  }, [solutionId, state]);

  // Загрузка при монтировании и обновлении
  useEffect(() => {
    fetchPeerReview();
  }, [fetchPeerReview, refreshKey]);

  // Если первый метод не сработал, пробуем альтернативный
  useEffect(() => {
    if (!loading && error && !state?.peerReview) {
      fetchPeerReviewViaList();
    }
  }, [loading, error, fetchPeerReviewViaList, state]);

  // Автоматическое скрытие сообщения об успехе
  useEffect(() => {
    if (showSuccessMessage) {
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
        setSuccessMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessMessage]);

  // Отправка ревью
  const handleSubmitReview = useCallback(async (score: number, comment?: string) => {
    if (!solutionId) {
      setError('ID решения не указан');
      return;
    }

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
      setSuccessMessage(updatedReview.score ? 'Оценка успешно обновлена!' : 'Оценка успешно сохранена!');
      setShowSuccessMessage(true);
      
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось сохранить ревью';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [solutionId]);

  // Удаление ревью
  const handleDeleteReview = useCallback(async () => {
    if (!solutionId) {
      setError('ID решения не указан');
      return;
    }
    
    const confirmDelete = window.confirm(
      'Вы уверены, что хотите удалить свою оценку? Это действие нельзя отменить.'
    );
    
    if (!confirmDelete) return;
    
    try {
      setIsSubmitting(true);
      
      const deleteData: SubmitPeerReviewRequest = {
        score: 0,
        comment: ''
      };
      
      const updatedReview = await solutionApi.submitPeerReview(solutionId, deleteData);
      setPeerReview(updatedReview);
      setSuccessMessage('Оценка успешно удалена');
      setShowSuccessMessage(true);
      
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось удалить оценку';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [solutionId]);

  // Обновление страницы
  const handleRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  // Форматирование даты
  const formatDate = useCallback((date?: string | null) => {
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
  }, []);

  // Получение статуса
  const getStatusLabel = useCallback((status: string) => {
    const statusMap: Record<string, string> = {
      'ASSIGNED': 'Ожидает проверки',
      'SUBMITTED': 'Проверено',
      'EXPIRED': 'Просрочено'
    };
    return statusMap[status] || status;
  }, []);

  const getStatusClass = useCallback((status: string) => {
    const classMap: Record<string, string> = {
      'ASSIGNED': styles.statusPending,
      'SUBMITTED': styles.statusSubmitted,
      'EXPIRED': styles.statusExpired
    };
    return classMap[status] || styles.statusPending;
  }, []);

  // Вычисляемые значения
  const isReviewSubmitted = peerReview?.status === 'SUBMITTED';
  const isReviewExpired = peerReview?.status === 'EXPIRED';
  const canEdit = !isReviewExpired;
  const hasExistingGrade = Boolean(peerReview?.score && peerReview.score > 0);

  // Рендер ошибки авторизации
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

  // Рендер загрузки
  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Загрузка данных для проверки...</p>
          <span className={styles.loadingId}>ID: {solutionId}</span>
        </div>
      </div>
    );
  }

  // Рендер ошибки
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
                <li>Решение уже было проверено</li>
                <li>Неправильный ID решения</li>
              </ul>
            </div>
          )}
          
          <div className={styles.errorActions}>
            <button onClick={handleRefresh} className={styles.button}>
              Попробовать снова
            </button>
            <button onClick={() => navigate(-1)} className={styles.buttonSecondary}>
              Вернуться назад
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Основной рендер
  return (
    <div className={styles.page}>
      {/* Хедер */}
      <header className={styles.header}>
        <button 
          onClick={() => navigate(-1)} 
          className={styles.backButton}
          aria-label="Назад"
        >
          ← Назад
        </button>
        <button 
          onClick={handleRefresh} 
          className={styles.refreshButton}
          aria-label="Обновить"
        >
          🔄 Обновить
        </button>
      </header>

      <div className={styles.container}>
        {/* Сообщение об успехе */}
        {showSuccessMessage && (
          <div className={styles.successMessage}>
            ✅ {successMessage}
          </div>
        )}

        {/* Информация о ревью */}
        <section className={styles.reviewInfo}>
          <div className={styles.reviewHeader}>
            <h1 className={styles.title}>Проверка решения</h1>
            <span className={`${styles.status} ${getStatusClass(peerReview.status)}`}>
              {getStatusLabel(peerReview.status)}
            </span>
          </div>
          
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Назначено:</span>
              <span className={styles.infoValue}>{formatDate(peerReview.createdAt)}</span>
            </div>
            {peerReview.submittedAt && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Проверено:</span>
                <span className={styles.infoValue}>{formatDate(peerReview.submittedAt)}</span>
              </div>
            )}
          </div>
        </section>

        {/* Детали решения */}
        {solution && (
          <section className={styles.solutionSection}>
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
                      <span className={styles.attachmentIcon}>🎥</span>
                      <div className={styles.attachmentInfo}>
                        <span className={styles.attachmentName}>Видео</span>
                        <a 
                          href={solution.videoUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={styles.attachmentLink}
                        >
                          Смотреть видео
                        </a>
                      </div>
                    </div>
                  )}
                  {solution.attachmentUrl && (
                    <div className={styles.attachmentCard}>
                      <span className={styles.attachmentIcon}>📎</span>
                      <div className={styles.attachmentInfo}>
                        <span className={styles.attachmentName}>Вложение</span>
                        <a 
                          href={solution.attachmentUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={styles.attachmentLink}
                        >
                          Скачать файл
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Панель оценивания */}
        <section className={styles.gradingSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              {hasExistingGrade && !isEditing ? '⭐ Ваша оценка' : '📝 Оценка решения'}
            </h2>
            
            {canEdit && !isEditing && (
              <div className={styles.buttonGroup}>
                <button 
                  onClick={() => setIsEditing(true)}
                  className={styles.editButton}
                  disabled={isSubmitting}
                >
                  {hasExistingGrade ? '✏️ Редактировать' : '➕ Оценить'}
                </button>
              </div>
            )}
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
                💡 Нажмите "Редактировать", чтобы изменить оценку
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
        </section>

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