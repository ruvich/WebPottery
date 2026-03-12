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
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("Нет токена авторизации");

  const { data } = await axios.get<StudentPerformanceResponse>(
    `http://localhost:8080/api/students/${studentId}/performance`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return data;
};