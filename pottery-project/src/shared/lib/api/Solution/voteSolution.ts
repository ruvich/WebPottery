import axios from "axios";

export const voteSolution = async (id: string) => {
    const data = '';      
    const token = localStorage.getItem("accessToken");
    const response = await axios.post("http://localhost:8080/api/solutions/" + id + "/vote" , data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};