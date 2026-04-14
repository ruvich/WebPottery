// types/solutionApi.ts

// Информация об оценке члена команды
export interface MemberGrade {
  gradedAt: string;
  score: number;
  solutionId: string;
  studentId: string;
  teacherComment: string | null;
  teacherId: string;
}

// Основной интерфейс Solution (соответствует реальным данным)
export interface Solution {
  id: string;
  attachmentUrl: string;
  authorStudentId: string;
  createdAt: string;
  memberGrades: MemberGrade[];  // массив оценок членов команды
  ownerType: 'STUDENT' | 'TEAM';
  postId: string;
  status: 'DRAFT' | 'SUBMITTED';
  studentId: string;
  studentName: string | null;
  submittedAt: string;
  teamGrade: number | null;  // ⚠️ teamGrade - это число, а не объект!
  teamId: string;
  text: string;
  updatedAt: string;
  videoUrl: string;
  votesCount: number;
}

// Запрос на оценку решения
export interface GradeSolutionRequest {
  score: number;
  teacherComment?: string | null;
}

// Если нужно создать новое решение
export interface CreateSolutionRequest {
  postId: string;
  text: string;
  videoUrl?: string;
  attachmentUrl?: string;
  ownerType: 'STUDENT' | 'TEAM';
}