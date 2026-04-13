import { Card, CardContent, Typography, Chip } from "@mui/material";
import type { PostsResponse } from "../../shared/lib/api/post";

type Props = {
  post: PostsResponse;
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

        

        {post.material ? (      
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3}}>
          {post.material.text}
        </Typography>
        ) : (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Без доп. материала
        </Typography>
        )}
        {post.task ? (      
          <Typography>{"Назначенная дата:"}</Typography>
        ): (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        </Typography>
        )}
        {post.task ? (      
          <Typography variant="caption" display="block" sx={{ mt: 2 }}>
            {new Date(post.task.deadline).toLocaleString()}
          </Typography>
        ): (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        </Typography>
        )}
        
      </CardContent>
    </Card>
  );
};