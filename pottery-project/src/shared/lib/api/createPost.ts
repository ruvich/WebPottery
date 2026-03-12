import axios from "axios";
import type { PostType } from "./posts";

export type MaterialType = "LINK" | "TEXT";

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
  } | null;
}

export const createPost = async (data: CreatePostRequest) => {
  const token = localStorage.getItem("accessToken");
  console.log("POST BODY:", data);
  const response = await axios.post("http://localhost:8080/api/posts", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};