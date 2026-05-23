import axios from "axios";

export interface GetTeamIdResponse {
  id: string;
}

export const getMyTeamID = async (id: string): Promise<GetTeamIdResponse> => {
  const token = localStorage.getItem("accessToken");
  const response = await axios.get("http://localhost:8080/api/posts/" + id + "/teams/mine", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};