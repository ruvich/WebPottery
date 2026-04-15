import { useEffect, useState } from "react";
import { Card, CardContent, Typography, Chip, Box} from "@mui/material";
import type { PostsResponse} from "../../shared/lib/api/post";
import { fetchSelectedSolution } from "../../shared/lib/api/Grade/getGrade";
import { fetchGrade } from "../../shared/lib/api/Grade/getGrade";
import { useParams} from "react-router-dom";
type Props = {
  post: PostsResponse;
};

export const PostCard = ({ post }: Props) => {
  const [score, setScore] = useState<number | null>(null);
  const role = localStorage.getItem("userRole");
  const postID = useParams().postId;
  const loadPost = async () => {
    if (role !== "TEACHER" && post.type === "TASK") {
      try {
          const studentId = localStorage.getItem("userId");

          const selectedSolution = await fetchSelectedSolution(postID);

          if (!selectedSolution || !studentId) {
          setScore(null);
          return;
          }

          const grade = await fetchGrade(selectedSolution.id, studentId);

          if (!grade) {
          setScore(null);
          return;
          }

          setScore(grade.score);

      } catch {
          setScore(null);
      }
    }
  }
  useEffect(() => {
      loadPost();
  });


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
          <Typography variant="caption" display="block" sx={{ mt: 2 }}>
            Назначенная дата: {new Date(post.task.deadline).toLocaleString()}
          </Typography>
        ): (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        </Typography>
        )}
        {post.type === "TASK" && (
          <Typography variant="body2">
              Тип задания: {post.task.mode === "TEAM" ? "Групповое" : "Индивидуальное"}
          </Typography>
        )}  
        {role !== "TEACHER" && post.type === "TASK" && (
        <Box sx={{ mt: 2 }}>
            <Typography variant="body2">
            Оценка: {score !== null ? score : " отсутствует"}
            </Typography>
        </Box>
        )}
      </CardContent>
    </Card>
  );
};