import { Card, CardContent, Typography, Chip, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import type { Post } from "../../shared/lib/api/posts";

type Props = {
  post: Post;
  canDelete?: boolean;
  onDelete?: (id: string) => void;
};

export const PostCard = ({ post, canDelete, onDelete }: Props) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/posts/${post.id}`);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(post.id);
  };

  return (
    <Card onClick={handleClick} sx={{ cursor: "pointer", position: "relative" }}>
      {canDelete && (
        <IconButton
          onClick={handleDelete}
          sx={{ position: "absolute", top: 8, right: 8 }}
        >
          <DeleteIcon />
        </IconButton>
      )}

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