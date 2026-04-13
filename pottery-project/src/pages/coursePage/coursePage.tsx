import { useEffect, useState } from "react";
import { Box, Grid, Select, MenuItem, Pagination, Typography, Button } from "@mui/material";
import type { Post, PostType, PostsResponse } from "../../shared/lib/api/posts";
import { PostCard } from "../../entities/post/PostCard";
import { useNavigate } from "react-router-dom";
import { fetchPosts } from "../../shared/lib/api/posts";
import { deletePost } from "../../shared/lib/api/createPost";

export const PostsPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [typeFilter, setTypeFilter] = useState<PostType | "ALL">("ALL");

  const pageSize = 6;
  const navigate = useNavigate();
  const role = localStorage.getItem("userRole");

  const handleDelete = async (id: string) => {
    try {
      await deletePost(id);
      await loadPosts();
    } catch (e) {
      console.error("Ошибка удаления поста", e);
    }
  };

  const loadPosts = async () => {
    try {
      const type = typeFilter === "ALL" ? undefined : typeFilter;
      const data: PostsResponse = await fetchPosts(page, pageSize, type);

      setPosts(data?.items ?? []);
      setTotal(data.total);
    } catch (err: any) {
      const status = err.response?.status;
      if (status === 401) navigate("/login");
      else if (status === 500) navigate("/error-500");
      else console.error("Неизвестная ошибка при загрузке постов", err);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [page, typeFilter]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <Box sx={{ p: 4 }}>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Фильтр</Typography>
          <Select
            fullWidth
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value as PostType | "ALL"); setPage(1); }}
          >
            <MenuItem value="ALL">Все</MenuItem>
            <MenuItem value="MATERIAL">Материалы</MenuItem>
            <MenuItem value="TASK">Задания</MenuItem>
          </Select>
          {role === "TEACHER" && (
            <Button
              variant="contained"
              sx={{ mt: 3 }}
              fullWidth
              onClick={() => navigate("/posts/create")}
            >
              Создать пост
            </Button>
          )}
        </Grid>

        <Grid size={{ xs: 12, md: 9 }}>
          <Box sx={{ display: "flex", flexDirection: "column", minHeight: 600 }}>
            <Box sx={{ flex: 1 }}>
              {posts.length === 0 ? (
                <Typography variant="body1" sx={{ textAlign: "center", mt: 4 }}>
                  Посты не найдены
                </Typography>
              ) : (
                <Grid container spacing={2}>
                  {posts.map(post => (
                    <Grid size={{ xs: 12 }} key={post.id}>
                      <PostCard
                        post={post}
                        canDelete={role === "TEACHER"}
                        canEdit={role === "TEACHER"}
                        onDelete={handleDelete}
                      />
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
            {totalPages > 0 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <Pagination
                  page={page}
                  count={totalPages}
                  onChange={(_, value) => setPage(value)}
                  color="primary"
                />
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};