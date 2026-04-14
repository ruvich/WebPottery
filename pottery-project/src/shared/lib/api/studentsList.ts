import axios from "axios";

export type Student = {
  id: string;
  fullName: string;
};

export type StudentsResponse = {
  items: Student[];
  page: number;
  size: number;
  total: number;
};

export const getStudents = async (page = 0, size = 1000, q?: string): Promise<StudentsResponse> => {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("Нет токена авторизации");

  const params: Record<string, any> = { page, size };
  if (q) params.q = q;

  const response = await axios.get<StudentsResponse>("http://localhost:8080/api/students", {
    headers: { Authorization: `Bearer ${token}` },
    params,
  });

  return response.data;
};