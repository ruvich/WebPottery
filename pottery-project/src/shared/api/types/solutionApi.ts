export interface MemberGrade {
  gradedAt: string;
  score: number;
  solutionId: string;
  studentId: string;
  teacherComment: string | null;
  teacherId: string;
}

export interface Solution {
  id: string;
  attachmentUrl: string;
  authorStudentId: string;
  createdAt: string;
  memberGrades: MemberGrade[]; 
  ownerType: 'STUDENT' | 'TEAM';
  postId: string;
  status: 'DRAFT' | 'SUBMITTED';
  studentId: string;
  studentName: string | null;
  submittedAt: string;
  teamGrade: number | null;  
  teamId: string;
  text: string;
  updatedAt: string;
  videoUrl: string;
  votesCount: number;
}

export interface GradeTeamRequest {
  score: number;
  teacherComment?: string | null;
}

export interface GradeMemberRequest {
  score: number;
  teacherComment?: string | null;
}

export interface CreateSolutionRequest {
  postId: string;
  text: string;
  videoUrl?: string;
  attachmentUrl?: string;
  ownerType: 'STUDENT' | 'TEAM';
}