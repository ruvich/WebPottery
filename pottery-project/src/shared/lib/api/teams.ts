import axios from "axios";

export type TeamMember = {
  id: string;
  fullName: string;
};

export type Team = {
  id: string;
  name: string;
  members: TeamMember[];
};

export const getTeamDetails = async (postId: string): Promise<Team[]> => {
  const token = localStorage.getItem("accessToken");

  const response = await axios.get(
    `http://localhost:8080/api/posts/${postId}/teams/details`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

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

export const joinTeam = async (postId: string, teamId: string): Promise<Team> => {
  const token = localStorage.getItem("accessToken");

  const response = await axios.post(
    `http://localhost:8080/api/posts/${postId}/teams/${teamId}/join`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const leaveTeam = async (postId: string, teamId: string): Promise<Team> => {
  const token = localStorage.getItem("accessToken");

  const response = await axios.post(
    `http://localhost:8080/api/posts/${postId}/teams/${teamId}/leave`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

