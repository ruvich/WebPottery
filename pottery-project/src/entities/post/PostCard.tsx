import { Card, CardContent, Typography, Chip } from "@mui/material";
import type { Post } from "../../shared/lib/api/posts";

type Props = {
  post: Post;
};

export const PostCard = ({ post }: Props) => {
  return (
    <Card>
      <CardContent>
        <Chip
          label={post.type}
          color={post.type === "TASK" ? "primary" : "default"}
          size="small"
          sx={{ mb: 1 }}
        />

        <Typography variant="h6">{post.title}</Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {post.description}
        </Typography>

        <Typography variant="caption" display="block" sx={{ mt: 2 }}>
          {new Date(post.createdAt).toLocaleString()}
        </Typography>
      </CardContent>
    </Card>
  );
};