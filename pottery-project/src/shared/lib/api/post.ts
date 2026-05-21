import axios from "axios";

export type PostType = "MATERIAL" | "TASK";

export type MaterialType = "LINK" | "TEXT";

export type TaskType = "SOLO" | "TEAM";

export type SolutionType = "CAPITAIN" | "LAST" | "FIRST" | "VOTING";

export type CriteriaType = "POINTS" | "YES_NO" | "PERCENT";

export type ImpactCriteriaType = "REGULAR" | "BONUS ";

export interface Material {
  type: MaterialType;
  title: string;
  url: string;
  text: string;
}

export interface 	TaskGradingSettings{
  enabled: boolean;
  maxFinalScore: string;
  selfAssessmentRequired: boolean;
  latePenaltyEnabled: boolean;
  latePenaltyPerDay: string;
  progressPenaltyEnabled: boolean;
  progressPenaltyPerMiss: string;
}

export interface 	TaskCriteria{
  id: string;
  postId: string;
  title: string;
  description: string;
  type: CriteriaType;
  maxScore: string;
  pointsValue: string;
  booleanValue: boolean;
  percentValue: string;
  impactType: ImpactCriteriaType;
  displayOrder: string;
}

export interface 	TaskDetails {
  description: string;
  deadline: string;
  mode: TaskType;
  prioritySolution: SolutionType;
  gradingSettings: TaskGradingSettings;
  criteria: TaskCriteria[];
}

export interface PostsResponse {
  id: string;
  type: PostType;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  material: Material;
  task: TaskDetails;
}

export const fetchPost = async (postID: string): Promise<PostsResponse> => {
  const response = await axios.get("http://localhost:8080/api/posts/" + postID, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
    
  });

  return response.data;
};