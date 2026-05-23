import axios from "axios";

import type { CreateSolutionResponse } from "../Solution/getMySolution";

export const fetchSelectedSolution = async (postId: string): Promise<CreateSolutionResponse> => {
  try {
    const response = await axios.get(
      `http://localhost:8080/api/posts/${postId}/solutions/selected`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }
    );

    return response.data ?? null;
  } catch (e: any) {
    if (e.response?.status === 404) return null;
    throw e;
  }
};

export const fetchGrade = async (solutionId: string, studentId: string) => {
  try {
    const response = await axios.get(
      `http://localhost:8080/api/solutions/${solutionId}/members/${studentId}/grade`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }
    );

    return response.data ?? null;
  } catch (e: any) {
    if (e.response?.status === 404) return null;
    return null;
  }
};
export const fetchCreterionGrade = async (solutionId: string) => {
  try {
    const response = await axios.get(
      `http://localhost:8080/api/solutions/${solutionId}/criterion-grade`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }
    );

    return response.data ?? null;
  } catch (e: any) {
    if (e.response?.status === 404) return null;
    return null;
  }
};