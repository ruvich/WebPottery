import React, { useEffect, useState, useCallback } from 'react'; 
import { useParams, Link, useNavigate } from 'react-router-dom';
import { solutionApi } from '../../shared/api/solutionApi';
// import { solutionsApi } from '../../shared/api/types/solutionApi';
import type { Solution } from '../../shared/api/types/solutionApi';
import { SolutionDetails } from '../../entities/solution//SolutionDetails';
import { GradingPanel } from '../../features/grading//GradingPanel';
import styles from './SolutionPage.module.css';

export const SolutionPage: React.FC = () => {
  const { solutionId } = useParams<{ solutionId: string }>();
  const navigate = useNavigate();
  const [solution, setSolution] = useState<Solution | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setAuthError(true);
      setTimeout(() => navigate('/login'), 3000);
    }
  }, [navigate]);

  const fetchSolution = useCallback(async () => {
    if (!solutionId) return;
    
    try {
      setLoading(true);
      setError(null);
      console.log(`📥 Loading solution: ${solutionId}`);
      
      const data = await solutionApi.getSolutionById(solutionId);
      setSolution(data);
      console.log('✅ Solution loaded:', data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось загрузить решение';
      setError(message);
      console.error('❌ Error loading solution:', err);
    } finally {
      setLoading(false);
    }
  }, [solutionId]);

  useEffect(() => {
    fetchSolution();
  }, [fetchSolution, refreshKey]); 
  const handleGradeSubmit = async (score: number, comment: string) => {
    if (!solutionId || !solution) return;

    try {
      setIsSubmitting(true);
      setError(null);
      
      console.log(`📤 Submitting grade: ${score} for solution ${solutionId}`);
      
      await solutionApi.gradeSolution(solutionId, {
        score,
        teacherComment: comment || undefined
      });
      
      setIsEditing(false);
      
      console.log('🔄 Reloading solution data...');
      await fetchSolution(); 
      
      console.log('✅ Grade submitted and data reloaded');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось сохранить оценку';
      setError(message);
      console.error('❌ Error submitting grade:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1); 
  };

  if (authError) {
    return (
      <div className={styles.page}>
        <div className={styles.error}>
          <h2>🔒 Требуется авторизация</h2>
          <p>Для просмотра решения необходимо войти в систему.</p>
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
        <div className={styles.loading}>Загрузка решения...</div>
      </div>
    );
  }

  if (error || !solution) {
    return (
      <div className={styles.page}>
        <div className={styles.error}>
          <h2>❌ Ошибка</h2>
          <p>{error || 'Решение не найдено'}</p>
          <button onClick={handleRefresh} className={styles.button}>
            Попробовать снова
          </button>
          <button onClick={() => navigate(-1)} className={styles.button}>
            Вернуться назад
          </button>
        </div>
      </div>
    );
  }

  const hasGrade = !!solution.grade;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link to={`/posts/${solution.postId}/solutions`} className={styles.backButton}>
          ← Назад к списку решений
        </Link>
        {}
        <button onClick={handleRefresh} className={styles.refreshButton}>
          🔄 Обновить
        </button>
      </div>

      <div className={styles.container}>
        <SolutionDetails solution={solution} />

        <div className={styles.gradingSection}>
          <h2 className={styles.sectionTitle}>Оценка</h2>
          
          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}
          
          {hasGrade && !isEditing ? (
            <div className={styles.gradeDisplay}>
              <div className={styles.gradeCard}>
                <div className={styles.gradeHeader}>
                  <div className={styles.gradeInfo}>
                    <span className={styles.gradeLabel}>Текущая оценка:</span>
                    <span className={styles.gradeValue}>{solution.grade!.score}/5</span>
                  </div>
                  <span className={styles.gradeDate}>
                    {new Date(solution.grade!.gradedAt).toLocaleDateString('ru-RU')}
                  </span>
                </div>
                
                {solution.grade!.teacherComment && (
                  <div className={styles.commentBox}>
                    <div className={styles.commentLabel}>Комментарий:</div>
                    <p className={styles.commentText}>{solution.grade!.teacherComment}</p>
                  </div>
                )}

                <button 
                  onClick={() => setIsEditing(true)}
                  className={styles.editButton}
                  disabled={isSubmitting}
                >
                  Изменить оценку
                </button>
              </div>
            </div>
          ) : (
            // Режим редактирования
            <GradingPanel
              initialScore={solution.grade?.score || 3}
              initialComment={solution.grade?.teacherComment || ''}
              onSubmit={handleGradeSubmit}
              onCancel={hasGrade ? () => setIsEditing(false) : undefined}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      </div>
    </div>
  );
};