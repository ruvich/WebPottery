import axios from "axios";

export type TeamMember = {
  id: string;
  fullName: string;
};

export type Team = {
  id: string;
  name: string;
  captainId: string | null;
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

export const addStudentToTeam = async (
  postId: string,
  teamId: string,
  studentId: string
): Promise<Team> => {
  const token = localStorage.getItem("accessToken");

  const response = await axios.post(
    `http://localhost:8080/api/posts/${postId}/teams/${teamId}/members/${studentId}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const removeStudentFromTeam = async (
  postId: string,
  teamId: string,
  studentId: string
): Promise<void> => {
  const token = localStorage.getItem("accessToken");

  await axios.delete(
    `http://localhost:8080/api/posts/${postId}/teams/${teamId}/members/${studentId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export type TeamCreateRequest = {
  name: string;
  captainId: string | null;
  memberIds: string[] | null;
};

export const createTeam = async (
  postId: string,
  request: TeamCreateRequest
): Promise<Team> => {
  const token = localStorage.getItem("accessToken");

  const response = await axios.post(
    `http://localhost:8080/api/posts/${postId}/teams`,
    request,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const deleteTeam = async (
  postId: string,
  teamId: string
): Promise<void> => {
  const token = localStorage.getItem("accessToken");

  await axios.delete(
    `http://localhost:8080/api/posts/${postId}/teams/${teamId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export type TeamUpdateRequest = {
  name?: string;
  captainId: string | null;
};

export const updateTeam = async (
  postId: string,
  teamId: string,
  request: TeamUpdateRequest
): Promise<Team> => {
  const token = localStorage.getItem("accessToken");

  const response = await axios.patch(
    `http://localhost:8080/api/posts/${postId}/teams/${teamId}`,
    request,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};