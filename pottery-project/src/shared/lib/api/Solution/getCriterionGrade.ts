// Добавь это в твой файл с API (например, getCriterionGrade.ts или Grade/getGrade.ts)

import axios from "axios";

// Типы для ответа /api/solutions/{solutionId}/criterion-grade
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
  items: CriterionGradeItem[];
}

export interface CriterionGradeItem {
  criterion: Criterion;
  selfAssessment: Assessment | null;
  teacherAssessment: Assessment | null;
}

export interface Criterion {
  id: string;
  postId: string;
  title: string;
  description: string;
  type: "POINTS" | "YES_NO" | "PERCENT";
  maxScore: number;
  impactType: "REGULAR" | "BONUS";
  displayOrder: number;
}

export interface Assessment {
  criterionId: string;
  valueType: "POINTS" | "YES_NO" | "PERCENT";
  pointsValue: number;
  booleanValue: boolean;
  percentValue: number;
  calculatedScore: number;
  comment?: string;
  teacherComment?: string;
}

// GET запрос для получения оценки по критериям
export const fetchCriterionGrade = async (solutionId: string): Promise<CriterionGradeResponse> => {
  const response = await axios.get(
    `http://localhost:8080/api/solutions/${solutionId}/criterion-grade`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    }
  );
  return response.data;
};

// Типы для ответа /api/posts/{postId}/solutions/mine
export interface MySolutionResponse {
  id: string;
  postId: string;
  ownerType: "STUDENT" | "TEAM";
  studentName: string;
  studentId: string;
  teamId: string;
  status: "DRAFT" | "SUBMITTED" | "GRADED";
  text: string;
  videoUrl: string;
  attachmentUrl: string;
  createdAt: string;
  updatedAt: string;
  submittedAt: string;
  authorStudentId: string;
  votesCount: number;
}

// GET запрос для получения моего решения
export const fetchMySolution = async (postId: string): Promise<MySolutionResponse> => {
  const response = await axios.get(
    `http://localhost:8080/api/posts/${postId}/solutions/mine`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    }
  );
  return response.data;
};