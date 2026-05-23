import axios from "axios";

export type SubmitType = "SUBMITTED" | "DRAFT";

export interface CreateSolutionResponse {
  id: string;
  text: string;
  videoUrl: string;  
  status: SubmitType;
}

export const getMySolution = async (id: string): Promise<CreateSolutionResponse> => {
  const token = localStorage.getItem("accessToken");
  const response = await axios.get("http://localhost:8080/api/posts/" + id + "/solutions/mine", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};