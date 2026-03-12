import axios from "axios";

export type StudentPerformanceItem = {
  postId: string;
  postTitle: string;
  solutionId: string;
  grade: {
    solutionId: string;
    score: number;
    teacherComment: string;
    gradedAt: string;
    teacherId: string;
  };
};

export type StudentPerformanceResponse = {
  studentId: string;
  averageGrade: number;
  items: StudentPerformanceItem[];
};

export const getStudentPerformance = async (studentId: string): Promise<StudentPerformanceResponse> => {
  const { data } = await axios.get<StudentPerformanceResponse>(`/students/${studentId}/performance`);
  return data;
};