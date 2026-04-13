import { Card, CardContent, Typography, Chip, IconButton, Box } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate } from "react-router-dom";
import type { Post } from "../../shared/lib/api/posts";

type Props = {
  post: Post;
  canDelete?: boolean;
  canEdit?: boolean;
  onDelete?: (id: string) => void;
};

export const PostCard = ({ post, canDelete, canEdit, onDelete }: Props) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/posts/${post.id}`);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(post.id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/posts/${post.id}/edit`);
  };

  return (
    <Card onClick={handleClick} sx={{ cursor: "pointer", position: "relative" }}>

      <Box sx={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 1 }}>
        {canEdit && (
          <IconButton onClick={handleEdit}>
            <EditIcon />
          </IconButton>
        )}

        {canDelete && (
          <IconButton onClick={handleDelete}>
            <DeleteIcon />
          </IconButton>
        )}
      </Box>

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