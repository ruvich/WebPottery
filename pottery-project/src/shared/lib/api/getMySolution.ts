import axios from "axios";

export interface CreateSolutionResponse {
  text: string;
  videoUrl: string;  
  submit: boolean;
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