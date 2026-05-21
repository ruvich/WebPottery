
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { solutionApi } from '../../shared/api/solutionApi';
import { taskApi } from '../../shared/api/taskApi';
import type { Solution, MemberGrade, CriterionGradeRequestItem, IndividualGradeResponse } from '../../shared/api/types/solutionApi';
import type { Criterion } from '../../shared/api/taskApi';
import { SolutionDetails } from '../../entities/solution/SolutionDetails';
import { GradingPanel } from '../../features/grading/GradingPanel';
import { CriteriaGradingPanel } from '../../features/grading/CriteriaGradingPanel';
import { CriterionGradeDisplay } from '../../features/grading/CriterionGradeDisplay';
import styles from './SolutionPage.module.css';

export const SolutionPage: React.FC = () => {
  const { solutionId } = useParams<{ solutionId: string }>();
  const navigate = useNavigate();
  
  const [solution, setSolution] = useState<Solution | null>(null);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditingTeamGrade, setIsEditingTeamGrade] = useState(false);
  const [isEditingCriteriaGrade, setIsEditingCriteriaGrade] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedStudentForGrade, setSelectedStudentForGrade] = useState<string | null>(null);
  const [selectedStudentGrade, setSelectedStudentGrade] = useState<IndividualGradeResponse | null>(null);
  const [loadingStudentGrade, setLoadingStudentGrade] = useState(false);
  const [maxFinalScore, setMaxFinalScore] = useState<number | null>(null); // Начинаем с null
  const [loadingMaxScore, setLoadingMaxScore] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
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
      console.log('✅ Solution loaded:', data);
      setSolution(data);
      
      if (data.postId) {
        try {
          const criteriaData = await taskApi.getCriteriaByPostId(data.postId);
          console.log('📋 Criteria loaded:', criteriaData);
          setCriteria(criteriaData);
        } catch (err) {
          console.warn('Failed to load criteria:', err);
          setCriteria([]);
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось загрузить решение';
      setError(message);
      console.error('❌ Error loading solution:', err);
    } finally {
      setLoading(false);
    }
  }, [solutionId]);

  const fetchMaxFinalScore = useCallback(async () => {
    if (!solutionId) return;
    
    try {
      setLoadingMaxScore(true);
      const criterionData = await solutionApi.getCriterionGrade(solutionId);
      if (criterionData.maxFinalScore) {
        setMaxFinalScore(criterionData.maxFinalScore);
        console.log('📊 Max final score loaded:', criterionData.maxFinalScore);
      }
    } catch (err) {
      console.warn('Failed to fetch criterion grade:', err);
      setMaxFinalScore(100);
    } finally {
      setLoadingMaxScore(false);
    }
  }, [solutionId]);

  useEffect(() => {
    fetchSolution();
    fetchMaxFinalScore();
  }, [fetchSolution, fetchMaxFinalScore, refreshKey]);

  useEffect(() => {
    const fetchStudentGrade = async () => {
      if (!solutionId || !selectedStudentForGrade) return;
      
      try {
        setLoadingStudentGrade(true);
        const grade = await solutionApi.getMemberGrade(solutionId, selectedStudentForGrade);
        setSelectedStudentGrade(grade);
        console.log('👤 Student grade loaded:', grade);
      } catch (err) {
        console.error('Failed to fetch student grade:', err);
        setSelectedStudentGrade(null);
      } finally {
        setLoadingStudentGrade(false);
      }
    };
    
    fetchStudentGrade();
  }, [solutionId, selectedStudentForGrade]);

  const handleTeamGradeSubmit = async (score: number, comment?: string) => {
    if (!solutionId || !solution) return;

    try {
      setIsSubmitting(true);
      setError(null);
      
      await solutionApi.gradeTeam(solutionId, { score, teacherComment: comment || null });
      
      setIsEditingTeamGrade(false);
      await fetchSolution();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось сохранить оценку команде';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMemberGradeSubmit = async (studentId: string, score: number, comment?: string) => {
    if (!solutionId || !solution) return;

    try {
      setIsSubmitting(true);
      setError(null);
      
      console.log(`📤 Submitting grade for student ${studentId}: ${score}/${maxFinalScore}`);
      
      await solutionApi.gradeMember(solutionId, studentId, {
        score,
        teacherComment: comment || null
      });
      
      setSelectedStudentForGrade(null);
      setSelectedStudentGrade(null);
      await fetchSolution();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось сохранить оценку студенту';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCriteriaGradeSubmit = async (items: CriterionGradeRequestItem[], progressMissesCount?: number) => {
    if (!solutionId) return;

    try {
      setIsSubmitting(true);
      setError(null);
      
      await solutionApi.gradeByCriteria(solutionId, { items, progressMissesCount });
      
      setIsEditingCriteriaGrade(false);
      await fetchSolution();
      await fetchMaxFinalScore(); 
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось сохранить оценку по критериям';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const getMemberGrade = (studentId: string): MemberGrade | undefined => {
    return solution?.memberGrades?.find(grade => grade.studentId === studentId);
  };

  const getStudentName = (studentId: string): string => {
    if (solution?.studentName && solution?.studentId === studentId) {
      return solution.studentName;
    }
    return studentId.slice(0, 8);
  };

  const getStep = (maxScore: number): number => {
    if (maxScore <= 10) return 0.5;
    if (maxScore <= 20) return 1;
    if (maxScore <= 50) return 2;
    return 5;
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

  if (loading || loadingMaxScore) {
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

  const hasTeamGrade = solution.teamGrade !== null && solution.teamGrade !== undefined;
  const hasCriteria = criteria.length > 0;

  console.log('🎯 Current maxFinalScore:', maxFinalScore);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link to={`/posts/${solution.postId}/solutions`} className={styles.backButton}>
          ← Назад к списку решений
        </Link>
        <button onClick={handleRefresh} className={styles.refreshButton}>
          🔄 Обновить
        </button>
      </div>

      <div className={styles.container}>
        <SolutionDetails solution={solution} />

       

        {}
        {hasCriteria && (
          <div className={styles.criteriaGradingSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>📋 Оценка по критериям</h2>
              {!isEditingCriteriaGrade && (
                <button 
                  onClick={() => setIsEditingCriteriaGrade(true)}
                  className={styles.editButton}
                  disabled={isSubmitting}
                >
                  {solution.criterionGrade ? 'Изменить оценку' : 'Оценить'}
                </button>
              )}
            </div>
            
            {isEditingCriteriaGrade ? (
              <CriteriaGradingPanel
                solutionId={solution.id}
                criteria={criteria}
                onGradeSubmitted={() => {
                  setIsEditingCriteriaGrade(false);
                  fetchSolution();
                  fetchMaxFinalScore();
                }}
                isSubmitting={isSubmitting}
              />
            ) : (
              <CriterionGradeDisplay solutionId={solution.id} />
            )}
          </div>
        )}

        {}
        {solution.ownerType === 'TEAM' && solution.memberGrades && solution.memberGrades.length > 0 && (
          <div className={styles.memberGradingSection}>
            <h2 className={styles.sectionTitle}>👥 Индивидуальные оценки участников</h2>
            
            <div className={styles.memberGradesList}>
              {solution.memberGrades.map((grade) => {
                const currentGrade = getMemberGrade(grade.studentId);
                return (
                  <div key={grade.studentId} className={styles.memberGradeCard}>
                    <div className={styles.memberInfo}>
                      <div className={styles.memberName}>
                        <strong>{getStudentName(grade.studentId)}</strong>
                      </div>
                      <div className={styles.memberGrade}>
                        <span className={styles.gradeLabel}>Оценка:</span>
                        <span className={styles.gradeValue}>
                          {grade.score}/{maxFinalScore ?? '?'}
                        </span>
                      </div>
                    </div>
                    
                    <div className={styles.gradeMeta}>
                      <span className={styles.gradeDate}>
                        Оценена: {new Date(grade.gradedAt).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                    
                    {grade.teacherComment && (
                      <div className={styles.memberComment}>
                        <strong>💬 Комментарий:</strong>
                        <p>{grade.teacherComment}</p>
                      </div>
                    )}
                    
                    <button
                      onClick={() => setSelectedStudentForGrade(grade.studentId)}
                      className={styles.editButton}
                      disabled={isSubmitting}
                    >
                      {currentGrade?.score !== undefined && currentGrade.score !== null 
                        ? '✏️ Изменить оценку' 
                        : '➕ Оценить'}
                    </button>
                  </div>
                );
              })}
            </div>

            {}
            {selectedStudentForGrade && maxFinalScore !== null && (
              <div className={styles.memberGradingModal}>
                <div className={styles.memberGradingModalContent}>
                  <div className={styles.memberGradingModalHeader}>
                    <h3>Оценка студента</h3>
                    <button 
                      className={styles.closeButton}
                      onClick={() => {
                        setSelectedStudentForGrade(null);
                        setSelectedStudentGrade(null);
                      }}
                    >
                      ✕
                    </button>
                  </div>
                  
                  {loadingStudentGrade ? (
                    <div className={styles.loadingGrade}>Загрузка оценки...</div>
                  ) : (
                    <GradingPanel
                      key={`member-${selectedStudentForGrade}-${maxFinalScore}`}
                      initialScore={selectedStudentGrade?.score ?? 0}
                      initialComment={selectedStudentGrade?.teacherComment ?? ''}
                      onSubmit={(score, comment) => 
                        handleMemberGradeSubmit(selectedStudentForGrade, score, comment)
                      }
                      onCancel={() => {
                        setSelectedStudentForGrade(null);
                        setSelectedStudentGrade(null);
                      }}
                      isSubmitting={isSubmitting}
                      showComment={true}
                      title={`Оценка: ${getStudentName(selectedStudentForGrade)}`}
                      minScore={0}
                      maxScore={maxFinalScore}
                      step={getStep(maxFinalScore)}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};