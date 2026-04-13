import axios from "axios";

export interface EditSolutionRequest {
  text: string;
  videoUrl: string;
}

export const editSolution = async (data: EditSolutionRequest, solutionID: string) => {
    
  const token = localStorage.getItem("accessToken");
  console.log("Solution BODY:", data);
  const response = await axios.patch("http://localhost:8080/api/solutions/" + solutionID, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};


export const submitSolution = async (data: boolean, solutionID: string) => {
  const token = localStorage.getItem("accessToken");
  const response = await axios.post("http://localhost:8080/api/solutions/" + solutionID + "/submit", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};