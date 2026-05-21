// shared/api/types/solutionApi.ts
export interface CriterionGradeRequestItem {
  criterionId: string;
  valueType: 'POINTS' | 'PERCENT' | 'YES_NO';
  pointsValue?: number | null;
  booleanValue?: boolean | null;
  percentValue?: number | null;
  teacherComment?: string | null;
}

export interface CriterionGradeRequest {
  items: CriterionGradeRequestItem[];
  progressMissesCount?: number;
}

export interface Criterion {
  id: string;
  postId: string;
  title: string;
  description?: string;
  type: 'POINTS' | 'PERCENT' | 'YES_NO' | 'RANGE' | 'BOOLEAN' | 'SCALE';
  maxScore: number;
  impactType: 'REGULAR' | 'BONUS';
  displayOrder: number;
}

export interface SelfAssessmentItem {
  criterionId: string;
  valueType: string;
  pointsValue: number | null;
  booleanValue: boolean | null;
  percentValue: number | null;
  calculatedScore: number;
  comment: string | null;
}

export interface TeacherAssessmentItem {
  criterionId: string;
  valueType: string;
  pointsValue: number | null;
  booleanValue: boolean | null;
  percentValue: number | null;
  calculatedScore: number;
  teacherComment: string | null;
}

export interface CriterionGradeResponseItem {
  criterion: Criterion;
  selfAssessment: SelfAssessmentItem | null;
  teacherAssessment: TeacherAssessmentItem | null;
}

export interface CriterionGradeResponse {
  solutionId: string;
  postId: string;
  maxFinalScore: number;
  regularScore: number;
  bonusScore: number;
  lateDays: number;
  latePenalty: number;
  progressMissesCount: number;
  progressPenalty: number;
  rawScore: number;
  finalScore: number;
  gradedAt: string;
  teacherId: string;
  items: CriterionGradeResponseItem[];
}
export interface CriterionGradeItem {
  criterionId: string;
  valueType: 'POINTS' | 'PERCENT' | 'YES_NO';
  pointsValue?: number | null;
  booleanValue?: boolean | null;
  percentValue?: number | null;
  teacherComment?: string | null;
}


export interface GradeTeamRequest {
  score: number;
  teacherComment: string | null;
}

export interface GradeMemberRequest {
  score: number;
  teacherComment: string | null;
}

export interface MemberGrade {
  solutionId: string;
  studentId: string;
  score: number;
  teacherComment: string | null;
  gradedAt: string;
  teacherId: string;
}

export interface Solution {
  id: string;
  postId: string;
  ownerType: 'STUDENT' | 'TEAM';
  studentName?: string;
  studentId?: string;
  teamId?: string;
  status: 'SUBMITTED' | 'DRAFT';
  text: string;
  videoUrl?: string;
  attachmentUrl?: string;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  authorStudentId?: string;
  votesCount?: number;
  teamGrade?: number;
  memberGrades?: MemberGrade[];
  selfAssessment?: SelfAssessmentItem[];
  criterionGrade?: CriterionGradeResponse;
}

export interface SelfAssessmentItem {
  criterionId: string;
  valueType: string;
  pointsValue: number | null;
  booleanValue: boolean | null;
  percentValue: number | null;
  calculatedScore: number;
  comment: string | null;
}


export interface Criterion {
  id: string;
  postId: string;
  title: string;
  description?: string;
  type: 'POINTS' | 'PERCENT' | 'YES_NO' | 'RANGE' | 'BOOLEAN' | 'SCALE';
  maxScore: number;
  impactType: 'REGULAR' | 'BONUS';
  displayOrder: number;
}

export interface SelfAssessmentItem {
  criterionId: string;
  valueType: string;
  pointsValue: number | null;
  booleanValue: boolean | null;
  percentValue: number | null;
  calculatedScore: number;
  comment: string | null;
}

export interface TeacherAssessmentItem {
  criterionId: string;
  valueType: string;
  pointsValue: number | null;
  booleanValue: boolean | null;
  percentValue: number | null;
  calculatedScore: number;
  teacherComment: string | null;
}

export interface CriterionGradeItem {
  criterion: Criterion;
  selfAssessment: SelfAssessmentItem | null;
  teacherAssessment: TeacherAssessmentItem | null;
}
export interface IndividualGradeResponse {
  solutionId: string;
  studentId: string;
  score: number;
  teacherComment: string | null;
  gradedAt: string;
  teacherId: string;
}