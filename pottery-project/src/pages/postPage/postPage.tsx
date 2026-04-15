import { useEffect, useState } from "react";
import { Box, Grid, Typography, Button } from "@mui/material";
import { PostCard } from "../../entities/post/FullPostCard";
import { fetchPost } from "../../shared/lib/api/post";
import type { PostsResponse } from "../../shared/lib/api/post";
import { CreateSolution } from "../../features/createSolution/createSolution";
import { CommentsList } from "../../features/comment/commentList";
import { useParams, Link, useNavigate} from "react-router-dom";
import styles from '../solutionPage/SolutionPage.module.css';

export const PostPage = () => {
    const [post, setPost] = useState<PostsResponse | null>(null);
    const [openForm, setOpenForm] = useState(false);
    const navigate = useNavigate();
    const role = localStorage.getItem("userRole");
    const currentUserId = localStorage.getItem("userId")
    const postID = useParams().postId;
        
    const loadPost = async () => {
        
        try {
        const data: PostsResponse = await fetchPost(postID);
        setPost(data);
        } catch (err: any) {
        const status = err.response?.status;
        if (status === 401) navigate("/login");
        else if (status === 500) navigate("/error-500");
        else console.error("Неизвестная ошибка при загрузке поста", err);
        }
    };

  useEffect(() => {
    loadPost();
  }, []);


  return (
    <Box sx={{ p: 4 }}>
      
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 3 }}>
          <div className={styles.header}>
            <Link to={`/posts/${postID}/teams`} className={styles.backButton}>
              К списку всех команд →
            </Link>
          </div>
          {role !== "TEACHER" && post?.type == "TASK" &&(
            <Button
              variant="contained"
              sx={{ mt: 3 }}
              fullWidth
              onClick={() => setOpenForm(true)}
            >
              Прикрепить/изменить решение
            </Button>
          )}
          {role !== "TEACHER" && post?.task?.prioritySolution == "VOTING" &&(
            <Button
              variant="contained"
              sx={{ mt: 3 }}
              fullWidth
              onClick={() => setOpenForm(true)}
            >
              Проголосовать за решение
            </Button>
          )}
          {role === "TEACHER" && post?.type == "TASK" &&(
            <div className={styles.header}>
              <Link to={`/posts/${postID}/solutions`} className={styles.backButton}>
                К списку всех решений →
              </Link>
            </div>
          )}
          
        </Grid>

        <Grid size={{ xs: 12, md: 9 }}>
          <Box sx={{ display: "flex", flexDirection: "column", minHeight: 600 }}>
            <Box sx={{ flex: 1 }}>
              {!post ? (
                
                <Typography variant="body1" sx={{ textAlign: "center", mt: 4 }}>
                  Загрузка...
                </Typography>
              ) : (
                
                <PostCard post={post} />
              )}
            </Box>
            <CommentsList postId={postID} currentUserId={currentUserId} />
            <CreateSolution
              open={openForm}
              onClose={() => setOpenForm(false)}
              onPostCreated={loadPost}
            />

          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

