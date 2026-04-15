import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Stack,
  Divider,
} from "@mui/material";
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
    <Card
      elevation={0}
      sx={{
        borderRadius: 5,
        overflow: "hidden",
        background: "linear-gradient(180deg, #fffdfb 0%, #ffffff 100%)",
        border: "1px solid rgba(120, 90, 60, 0.10)",
        boxShadow: "0 18px 40px rgba(90, 60, 30, 0.08)",
      }}
    >
      <Box
        sx={{
          px: 3,
          py: 2,
          background: "linear-gradient(135deg, #eef6ff 0%, #e2f0ff 100%)",
          borderBottom: "1px solid rgba(120, 90, 60, 0.08)",
        }}
      >
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Chip
            label={post.type === "TASK" ? "Задание" : "Материал"}
            size="small"
            sx={{
              fontWeight: 700,
              backgroundColor: "#1976d2",
              color: "#fff",
            }}
          />

          {post.type === "TASK" && (
            <Chip
              label={post.task.mode === "TEAM" ? "Групповое" : "Индивидуальное"}
              size="small"
              sx={{
                fontWeight: 600,
                backgroundColor: "#ffffff",
                border: "1px solid #1976d2",
                color: "#1976d2",
              }}
            />
          )}
        </Stack>
      </Box>

      <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            color: "#0c0400",
            mb: 2,
            fontSize: { xs: "1.6rem", md: "2rem" },
            lineHeight: 1.2,
          }}
        >
          {post.title}
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: "#3d352f",
            fontSize: "1rem",
            lineHeight: 1.8,
            mb: 3,
          }}
        >
          {post.description}
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Box
          sx={{
            p: 2.5,
            borderRadius: 3,
            backgroundColor: "#f0f8ff",
            border: "1px solid rgba(120, 90, 60, 0.08)",
            mb: 3,
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{ mb: 1, color: "#000000", fontWeight: 700 }}
          >
            Дополнительные материалы
          </Typography>

          <Typography variant="body2" sx={{ color: "#000000", lineHeight: 1.7 }}>
            {post.material ? post.material.text : "Без доп. материала"}
          </Typography>
        </Box>

        {post.task && (
          <Stack spacing={1.2}>
            <Typography variant="body2" sx={{ color: "#000000" }}>
              <Box component="span" sx={{ fontWeight: 700, color: "#000000" }}>
                Назначенная дата:
              </Box>{" "}
              {new Date(post.task.deadline).toLocaleString()}
            </Typography>

            {post.type === "TASK" && (
              <Typography variant="body2" sx={{ color: "#000000" }}>
                <Box component="span" sx={{ fontWeight: 700, color: "#000000" }}>
                  Тип задания:
                </Box>{" "}
                {post.task.mode === "TEAM" ? "Групповое" : "Индивидуальное"}
              </Typography>
            )}
            
            {post.type === "TASK" && post.task.mode === "TEAM" &&(
              <Typography variant="body2" sx={{ color: "#000000" }}>
                <Box component="span" sx={{ fontWeight: 700, color: "#000000" }}>
                  Тип приоритетного решения:
                </Box>{" "}
                {post.task.prioritySolution}
              </Typography>
            )}
            {role !== "TEACHER" && post.type === "TASK" && (
              <Box
                sx={{
                  mt: 2,
                  display: "inline-flex",
                  alignItems: "center",
                  px: 2,
                  py: 1,
                  borderRadius: 999,
                  backgroundColor: "#1976d2",
                  width: "fit-content",
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 700, color: "#ffffff" }}>
                  Оценка: {score !== null ? score : "отсутствует"}
                </Typography>
              </Box>
            )}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
};