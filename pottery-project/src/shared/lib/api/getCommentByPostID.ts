import axios from 'axios';

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: string;
}

export const getCommentsByPostId = async (
  postId: string,
  token: string
): Promise<Comment[]> => {
  const response = await axios.get<Comment[]>(
    `http://localhost:8080/api/posts/${postId}/comments`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: '*/*',
      },
    }
  );

  return response.data;
};

export const postComment = async (
  postId: string,
  body: string,
  token: string
): Promise<Comment> => {
  const response = await axios.post<Comment>(
    `http://localhost:8080/api/posts/${postId}/comments`,
    { body },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data;
};

export const deleteComment = async (commentId: string, token: string): Promise<void> => {
  await axios.delete(`http://localhost:8080/api/comments/${commentId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
