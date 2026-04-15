import { useEffect, useState } from "react";
import { Box, Grid, Typography, Button } from "@mui/material";
import { PostCard } from "../../entities/post/FullPostCard";
import { fetchPost } from "../../shared/lib/api/post";
import type { PostsResponse } from "../../shared/lib/api/post";
import { fetchSelectedSolution } from "../../shared/lib/api/Grade/getGrade";
import { fetchGrade } from "../../shared/lib/api/Grade/getGrade";
import { CreateSolution } from "../../features/createSolution/createSolution";
import { VoteSolution } from "../../features/voteSolution/voteSolution";
import { CommentsList } from "../../features/comment/commentList";
import { useParams, Link, useNavigate} from "react-router-dom";
import styles from '../solutionPage/SolutionPage.module.css';

export const PostPage = () => {
    const [post, setPost] = useState<PostsResponse | null>(null);
    const [openFormCreate, setOpenFormCreate] = useState(false);
    const [openFormVote, setOpenFormVote] = useState(false);
    const [score, setScore] = useState<number | null>(null);

    const navigate = useNavigate();
    const role = localStorage.getItem("userRole");
    const currentUserId = localStorage.getItem("userId");
    const postID = useParams().postId;

    const loadPost = async () => {
        try {
            const data: PostsResponse = await fetchPost(postID);
            setPost(data);
            if (role !== "TEACHER" && data?.type === "TASK") {
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
        <Box sx={{ p: 4 }}>
            <Grid container spacing={4}>
                <Grid size={{ xs: 12, md: 3 }}>
                    
                    {post?.type === "TASK" && post?.task.mode === "TEAM" &&(
                      <div className={styles.header}>
                          <Link to={`/posts/${postID}/teams`} className={styles.backButton}>
                              К списку всех команд →
                          </Link>
                      </div>

                    )}
                    {role === "TEACHER" && post?.type === "TASK" &&(
                        <div className={styles.header}>
                            <Link to={`/posts/${postID}/solutions`} className={styles.backButton}>
                                К списку всех решений →
                            </Link>
                        </div>
                    )}
                    {post?.type === "TASK" && (
                      <Typography variant="body2">
                          Тип задания: {post.task.mode === "TEAM" ? "Групповое" : "Индивидуальное"}
                      </Typography>
                    )}  
                    {role !== "TEACHER" && post?.type === "TASK" && (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="body2">
                        Оценка: {score !== null ? score : "Оценка отсутствует"}
                        </Typography>
                    </Box>
                    )}
                    {role !== "TEACHER" && post?.type === "TASK" &&(
                        <Button
                            variant="contained"
                            sx={{ mt: 3 }}
                            fullWidth
                            onClick={() => setOpenFormCreate(true)}
                        >
                            Прикрепить/изменить решение
                        </Button>
                    )}
                    {role !== "TEACHER" && post?.task?.prioritySolution == "VOTING" &&(
                      <Button
                        variant="contained"
                        sx={{ mt: 3 }}
                        fullWidth
                        onClick={() => setOpenFormVote(true)}
                      >
                        Проголосовать за решение
                      </Button>
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
                            open={openFormCreate}
                            onClose={() => setOpenFormCreate(false)}
                            onPostCreated={loadPost}
                        />
                        <VoteSolution
                            open={openFormVote}
                            onClose={() => setOpenFormVote(false)}
                        />
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};