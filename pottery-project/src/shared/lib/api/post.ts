import axios from "axios";

export type PostType = "MATERIAL" | "TASK";

export type MaterialType = "LINK" | "TEXT";

export interface Material {
  type: MaterialType;
  title: string;
  url: string;
  text: string;
}

export interface 	TaskDetails {
  description: string;
  deadline: string;
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