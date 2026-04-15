import { useEffect, useState } from "react";
import { Box, Grid, Typography, Button, Paper, Stack } from "@mui/material";
import { PostCard } from "../../entities/post/FullPostCard";
import { fetchPost } from "../../shared/lib/api/post";
import type { PostsResponse } from "../../shared/lib/api/post";
import { CreateSolution } from "../../features/createSolution/createSolution";
import { VoteSolution } from "../../features/voteSolution/voteSolution";
import { CommentsList } from "../../features/comment/commentList";
import { useParams, Link, useNavigate} from "react-router-dom";
import styles from '../solutionPage/SolutionPage.module.css';

export const PostPage = () => {
    const [post, setPost] = useState<PostsResponse | null>(null);
    const [openFormCreate, setOpenFormCreate] = useState(false);
    const [openFormVote, setOpenFormVote] = useState(false);
    const navigate = useNavigate();
    const role = localStorage.getItem("userRole");
    const currentUserId = localStorage.getItem("userId");
    const postID = useParams().postId;

    const loadPost = async () => {
        try {
            const data: PostsResponse = await fetchPost(postID);
            setPost(data);
            
        } catch (err: any) {
            const status = err.response?.status;
            if (status === 401) navigate("/login");
            else if (status === 500) navigate("/error-500");
            else console.error("Ошибка загрузки поста", err);
        }
    };

    useEffect(() => {
        loadPost();
    }, []);

    return (
    <Box
      sx={{
        minHeight: "100vh",
        py: 5,
        px: { xs: 2, md: 4 },
      }}
    >
      <Grid container spacing={4} alignItems="flex-start">
        <Grid size={{ xs: 12, md: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              position: { md: "sticky" },
              top: 24,
              backgroundColor: "#f4faff",
              border: "1px solid rgba(120, 90, 60, 0.08)",
              boxShadow: "0 10px 30px rgba(90, 60, 30, 0.06)",
            }}
          >
            <Typography
              variant="overline"
              sx={{
                color: "#1976d2",
                letterSpacing: 1.2,
                fontWeight: 700,
              }}
            >
              Навигация
            </Typography>

            <Stack spacing={2} mt={2.5}>
              {post?.type === "TASK" && post?.task.mode === "TEAM" && (
                <Button
                  component={Link}
                  to={`/posts/${postID}/teams`}
                  variant="text"
                  sx={{
                    justifyContent: "flex-start",
                    textTransform: "none",
                    color: "#1976d2",
                    fontWeight: 600,
                    px: 0,
                  }}
                >
                  ← К списку всех команд
                </Button>
              )}

              {role === "TEACHER" && post?.type === "TASK" && (
                <Button
                  component={Link}
                  to={`/posts/${postID}/solutions`}
                  variant="text"
                  sx={{
                    justifyContent: "flex-start",
                    textTransform: "none",
                    color: "#1976d2",
                    fontWeight: 600,
                    px: 0,
                  }}
                >
                  ← К списку всех решений
                </Button>
              )}

              {role !== "TEACHER" && post?.type === "TASK" && (
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => setOpenFormCreate(true)}
                  sx={{
                    mt: 1,
                    py: 1.4,
                    borderRadius: 3,
                    textTransform: "none",
                    fontWeight: 700,
                    background: "linear-gradient(135deg, #1976d2 0%, #1976d2 100%)",
                    boxShadow: "0 8px 18px rgba(141, 90, 50, 0.25)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #4e7cdf 0%, #4e7cdf 100%)",
                    },
                  }}
                >
                  Прикрепить / изменить решение
                </Button>
              )}

              {role !== "TEACHER" && post?.task?.prioritySolution === "VOTING" && (
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => setOpenFormVote(true)}
                  sx={{
                    py: 1.3,
                    borderRadius: 3,
                    textTransform: "none",
                    fontWeight: 700,
                    borderColor: "#1976d2",
                    color: "#1976d2",
                    "&:hover": {
                      borderColor: "#377abd",
                      backgroundColor: "rgba(49, 25, 5, 0.07)",
                    },
                  }}
                >
                  Проголосовать за решение
                </Button>
              )}
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 9 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {!post ? (
              <Paper
                sx={{
                  p: 4,
                  borderRadius: 4,
                  textAlign: "center",
                  backgroundColor: "#fff",
                }}
              >
                <Typography variant="body1">Загрузка...</Typography>
              </Paper>
            ) : (
              <PostCard post={post} />
            )}

            <CommentsList postId={postID!} currentUserId={currentUserId!} />
          </Box>

          <CreateSolution
            open={openFormCreate}
            onClose={() => setOpenFormCreate(false)}
            onPostCreated={loadPost}
          />

          <VoteSolution
            open={openFormVote}
            onClose={() => setOpenFormVote(false)}
          />
        </Grid>
      </Grid>
    </Box>
  );
};