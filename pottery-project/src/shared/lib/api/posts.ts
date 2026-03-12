import axios from "axios";

export type PostType = "MATERIAL" | "TASK";

export interface Post {
  id: string;
  type: PostType;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface PostsResponse {
  items: Post[];
  page: number;
  size: number;
  total: number;
}

export const fetchPosts = async (page: number, size: number, type?: PostType): Promise<PostsResponse> => {
  const response = await axios.get("http://localhost:8080/api/posts", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
    params: {
      page: page - 1,
      size,
      type: type || undefined,
    },
  });

  return response.data;
};