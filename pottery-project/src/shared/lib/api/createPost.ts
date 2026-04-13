import axios from "axios";
import type { PostType } from "./posts";

export type MaterialType = "LINK" | "TEXT";

export type TaskMode = "SOLO" | "TEAM";
export type TeamDistributionType = "MANUAL" | "RANDOM" | "SELF_SELECTION";
export type PrioritySolution = "CAPITAIN" | "LAST" | "FIRST" | "VOTING";

export interface CreatePostRequest {
  type: PostType;
  title: string;
  description?: string | null;

  material?: {
    type: MaterialType;
    title: string;
    url?: string | null;
    text?: string | null;
  } | null;

  task?: {
    description?: string | null;
    deadline?: string | null;

    mode?: TaskMode;
    teamDistributionType?: TeamDistributionType | null;

    teamRules?: {
      formationDeadline?: string | null;
      minTeamsCount?: number;
      maxTeamsCount?: number;
      minMembersPerTeam?: number;
      maxMembersPerTeam?: number;
    } | null;

    prioritySolution?: PrioritySolution;
  } | null;
}

export const createPost = async (data: CreatePostRequest) => {
  const token = localStorage.getItem("accessToken");

  const response = await axios.post("http://localhost:8080/api/posts", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const deletePost = async (postId: string) => {
  const token = localStorage.getItem("accessToken");

  return axios.delete(`http://localhost:8080/api/posts/${postId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};