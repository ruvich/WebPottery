import React, { useEffect, useState, useCallback } from 'react'; 
import { useParams, Link, useNavigate } from 'react-router-dom';
import { solutionApi } from '../../shared/api/solutionApi';
import { studentApi } from '../../shared/api/studentApi';
import type { Solution, MemberGrade } from '../../shared/api/types/solutionApi';
import { SolutionDetails } from '../../entities/solution/SolutionDetails';
import { GradingPanel } from '../../features/grading/GradingPanel';
import styles from './SolutionPage.module.css';

export const SolutionPage: React.FC = () => {
  const { solutionId } = useParams<{ solutionId: string }>();
  const navigate = useNavigate();
  const [solution, setSolution] = useState<Solution | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditingTeamGrade, setIsEditingTeamGrade] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedStudentForGrade, setSelectedStudentForGrade] = useState<string | null>(null);
  
  const [studentNames, setStudentNames] = useState<Map<string, string>>(new Map());

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
      
      // Загружаем имена студентов для memberGrades
      if (data.memberGrades && data.memberGrades.length > 0) {
        const studentIds = data.memberGrades.map(grade => grade.studentId);
        const uniqueStudentIds = [...new Set(studentIds)]; // Убираем дубликаты
        const namesMap = await studentApi.getStudentsByIds(uniqueStudentIds);
        setStudentNames(namesMap);
      }
      
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

  const handleTeamGradeSubmit = async (score: number, comment: string) => {
    if (!solutionId || !solution) return;

    try {
      setIsSubmitting(true);
      setError(null);
      
      console.log(`📤 Submitting team grade: ${score} for solution ${solutionId}`);
      
      await solutionApi.gradeTeam(solutionId, {
        score,
        teacherComment: comment || null
      });
      
      setIsEditingTeamGrade(false);
      await fetchSolution();
      
      console.log('✅ Team grade submitted');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось сохранить оценку команде';
      setError(message);
      console.error('❌ Error submitting team grade:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMemberGradeSubmit = async (studentId: string, score: number, comment: string) => {
    if (!solutionId || !solution) return;

    try {
      setIsSubmitting(true);
      setError(null);
      
      console.log(`📤 Submitting member grade: ${score} for student ${studentId}`);
      
      await solutionApi.gradeMember(solutionId, studentId, {
        score,
        teacherComment: comment || null
      });
      
      setSelectedStudentForGrade(null);
      await fetchSolution();
      
      console.log('✅ Member grade submitted');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось сохранить оценку студенту';
      setError(message);
      console.error('❌ Error submitting member grade:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const getMemberGrade = (studentId: string): MemberGrade | undefined => {
    if (!solution?.memberGrades) return undefined;
    return solution.memberGrades.find(grade => grade.studentId === studentId);
  };

  const getStudentName = (studentId: string): string => {
    return studentNames.get(studentId) || `${studentId.substring(0, 8)}...`;
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

  const hasTeamGrade = solution.teamGrade !== null && solution.teamGrade !== undefined;

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

        {/* Блок оценки команды */}
        <div className={styles.gradingSection}>
          <h2 className={styles.sectionTitle}>Оценка команды</h2>
          
          {hasTeamGrade && !isEditingTeamGrade ? (
            <div className={styles.gradeDisplay}>
              <div className={styles.gradeCard}>
                <div className={styles.gradeHeader}>
                  <div className={styles.gradeInfo}>
                    <span className={styles.gradeLabel}>Оценка команды:</span>
                    <span className={styles.gradeValue}>{solution.teamGrade}/5</span>
                  </div>
                </div>
                <button 
                  onClick={() => setIsEditingTeamGrade(true)}
                  className={styles.editButton}
                  disabled={isSubmitting}
                >
                  Изменить оценку
                </button>
              </div>
            </div>
          ) : (
            <GradingPanel
              initialScore={solution.teamGrade || 3}
              initialComment=""
              onSubmit={handleTeamGradeSubmit}
              onCancel={hasTeamGrade ? () => setIsEditingTeamGrade(false) : undefined}
              isSubmitting={isSubmitting}
            />
          )}
        </div>

        {/* Блок индивидуальных оценок участников */}
        {solution.ownerType === 'TEAM' && solution.memberGrades && solution.memberGrades.length > 0 && (
          <div className={styles.memberGradingSection}>
            <h2 className={styles.sectionTitle}>Индивидуальные оценки участников</h2>
            
            <div className={styles.memberGradesList}>
              {solution.memberGrades.map((grade) => (
                <div key={grade.studentId} className={styles.memberGradeCard}>
                  <div className={styles.memberInfo}>
                    <div className={styles.memberName}>
                      <strong>{getStudentName(grade.studentId)}</strong>
                    </div>
                    <div className={styles.memberGrade}>
                      <span className={styles.gradeLabel}>Оценка:</span>
                      <span className={styles.gradeValue}>{grade.score}/5</span>
                    </div>
                  </div>
                  
                  <div className={styles.gradeMeta}>
                    <span className={styles.gradeDate}>
                      Оценена: {new Date(grade.gradedAt).toLocaleDateString('ru-RU')}
                    </span>
                    <span className={styles.teacherId}>
                      {}
                    </span>
                  </div>
                  
                  {grade.teacherComment && (
                    <div className={styles.memberComment}>
                      <strong>Комментарий преподавателя:</strong>
                      <p>{grade.teacherComment}</p>
                    </div>
                  )}
                  
                  <button
                    onClick={() => setSelectedStudentForGrade(grade.studentId)}
                    className={styles.editButton}
                    disabled={isSubmitting}
                  >
                    Изменить оценку
                  </button>
                </div>
              ))}
            </div>

            {/* Форма для оценки конкретного студента */}
            {selectedStudentForGrade && (
              <div className={styles.memberGradingForm}>
                <h3>
                  Оценка студента: {getStudentName(selectedStudentForGrade)}
                </h3>
                <GradingPanel
                  initialScore={getMemberGrade(selectedStudentForGrade)?.score || 3}
                  initialComment={getMemberGrade(selectedStudentForGrade)?.teacherComment || ''}
                  onSubmit={(score, comment) => 
                    handleMemberGradeSubmit(selectedStudentForGrade, score, comment)
                  }
                  onCancel={() => setSelectedStudentForGrade(null)}
                  isSubmitting={isSubmitting}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};