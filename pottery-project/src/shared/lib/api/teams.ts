import axios from "axios";

export const distributeTeamsRandom = async (postId: string) => {
  const token = localStorage.getItem("accessToken");

  try {
    await axios.post(`http://localhost:8080/api/posts/${postId}/teams/distribute/random`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("Команды успешно распределены");
  } catch (error) {
    console.error("Ошибка при распределении команд", error);
    throw error;
  }
};