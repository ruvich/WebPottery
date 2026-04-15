import axios from "axios";

export type SubmitType = "SUBMITTED" | "DRAFT";

export interface Solution {
  id: string;
  studentName: string;
  studentId: string;
  text: string;
  videoUrl: string;  
  status: SubmitType;
  createdAt: string;
  submittedAt: string;
  votesCount: string;
}

export const getMyTeamSolution = async (id: string): Promise<Solution[]> => {
  const token = localStorage.getItem("accessToken");
  const response = await axios.get("http://localhost:8080/api/posts/" + id + "/solutions/team", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};