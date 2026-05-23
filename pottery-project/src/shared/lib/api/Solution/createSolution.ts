import axios from "axios";

export interface CreateSolutionRequest {
  teamID: string;
  text: string;
  videoUrl: string;
  submit: boolean;
}

export const createSolution = async (data: CreateSolutionRequest, id: string) => {
    
  const token = localStorage.getItem("accessToken");
  console.log("Solution BODY:", data);
  const response = await axios.post("http://localhost:8080/api/posts/" + id + "/solutions" , data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};