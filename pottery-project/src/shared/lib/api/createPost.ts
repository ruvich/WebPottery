import axios from "axios";
import type { PostType } from "./posts";

export type MaterialType = "LINK" | "TEXT";

export type TaskMode = "SOLO" | "TEAM";
export type TeamDistributionType = "MANUAL" | "RANDOM" | "SELF_SELECTION";
export type PrioritySolution = "CAPITAIN" | "LAST" | "FIRST" | "VOTING";

export type CriterionType = "POINTS" | "YES_NO" | "PERCENT";
export type CriterionImpactType = "REGULAR" | "BONUS";

export interface CriterionDto {
  title: string;
  description: string;
  type: CriterionType;
  maxScore: number;
  impactType: CriterionImpactType;
  displayOrder: number;
}

export interface TaskGradingSettings {
  enabled: boolean;
  maxFinalScore: number;

  selfAssessmentRequired: boolean;

  latePenaltyEnabled: boolean;
  latePenaltyPerDay: number;

  progressPenaltyEnabled: boolean;
  progressPenaltyPerMiss: number;
}

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
    gradingSettings?: TaskGradingSettings | null;
    criteria?: CriterionDto[];
  } | null;
}

export interface Material {
  type: "LINK" | "TEXT";
  title: string;
  url?: string | null;
  text?: string | null;
}

export interface Task {
  description?: string | null;
  deadline?: string | null;

  mode: "SOLO" | "TEAM";

  teamDistributionType?: "MANUAL" | "RANDOM" | "SELF_SELECTION";

  teamRules?: {
    formationDeadline?: string | null;
    minTeamsCount?: number;
    maxTeamsCount?: number;
    minMembersPerTeam?: number;
    maxMembersPerTeam?: number;
  };

  prioritySolution?: "CAPITAIN" | "LAST" | "FIRST" | "VOTING";
  gradingSettings?: TaskGradingSettings | null;
  criteria?: CriterionDto[];
}

export interface Post {
  id: string;
  type: "MATERIAL" | "TASK";
  title: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;

  material?: Material | null;
  task?: Task | null;
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

export const fetchPostById = async (postId: string) => {
  const token = localStorage.getItem("accessToken");

  const { data } = await axios.get(
    `http://localhost:8080/api/posts/${postId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return data;
};

export const updatePost = async (postId: string, body: any) => {
  const token = localStorage.getItem("accessToken");

  const { data } = await axios.patch(
    `http://localhost:8080/api/posts/${postId}`,
    body,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return data;
};