// features/grading/MemberGradingList.tsx
import React from 'react';
import type { MemberGrade } from '../../shared/api/types/solutionApi';
import styles from './MemberGradingList.module.css';

interface MemberGradingListProps {
  members: { studentId: string; studentName: string }[];
  memberGrades: MemberGrade[];
  onGradeMember: (studentId: string) => void;
  isSubmitting?: boolean;
}

export const MemberGradingList: React.FC<MemberGradingListProps> = ({
  members,
  memberGrades,
  onGradeMember,
  isSubmitting = false
}) => {
  const getGradeForMember = (studentId: string): MemberGrade | undefined => {
    return memberGrades.find(grade => grade.studentId === studentId);
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Участники команды</h3>
      <div className={styles.membersList}>
        {members.map((member) => {
          const grade = getGradeForMember(member.studentId);
          return (
            <div key={member.studentId} className={styles.memberCard}>
              <div className={styles.memberInfo}>
                <div className={styles.memberName}>
                  {member.studentName || `Студент ${member.studentId.substring(0, 8)}`}
                </div>
                {grade && (
                  <div className={styles.memberGrade}>
                    <span className={styles.gradeValue}>{grade.score}/5</span>
                    <span className={styles.gradeDate}>
                      {new Date(grade.gradedAt).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                )}
              </div>
              {grade?.teacherComment && (
                <div className={styles.memberComment}>
                  <strong>Комментарий:</strong> {grade.teacherComment}
                </div>
              )}
              <button
                onClick={() => onGradeMember(member.studentId)}
                className={styles.gradeButton}
                disabled={isSubmitting}
              >
                {grade ? 'Изменить оценку' : 'Оценить'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};