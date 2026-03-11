import type { Post } from "../../shared/lib/api/posts";

type Props = {
  post: Post;
};

export const PostCard = ({ post }: Props) => {
  return (
    <div style={{ border: "1px solid #ccc", padding: 8, marginBottom: 8 }}>
      <div>{post.type}</div>
      <h6>{post.title}</h6>
      <p>{post.description}</p>
      <small>{new Date(post.createdAt).toLocaleString()}</small>
    </div>
  );
};