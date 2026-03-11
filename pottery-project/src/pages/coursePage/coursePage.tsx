import { useEffect, useState } from "react";
import { Box, Grid, Select, MenuItem, Pagination, Typography } from "@mui/material";
import type { Post, PostType, PostsResponse } from "../../shared/lib/api/posts";
import { PostCard } from "../../entities/post/PostCard";
import { useNavigate } from "react-router-dom";
import { fetchPosts } from "../../shared/lib/api/posts";

export const PostsPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [typeFilter, setTypeFilter] = useState<PostType | "ALL">("ALL");

  const pageSize = 6;
  const navigate = useNavigate();

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const type = typeFilter === "ALL" ? undefined : typeFilter;
        const data: PostsResponse = await fetchPosts(page, pageSize, type);

        setPosts(data.items);
        setTotal(data.total);
      } catch (err: any) {
        const status = err.response?.status;
        if (status === 401) navigate("/login");
        else if (status === 500) navigate("/error-500");
        else console.error("Неизвестная ошибка при загрузке постов", err);
      }
    };

    loadPosts();
  }, [page, typeFilter, navigate]);

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
        </Grid>

        <Grid size={{ xs: 12, md: 9 }}>
          <Box sx={{ display: "flex", flexDirection: "column", minHeight: 600 }}>
            <Box sx={{ flex: 1 }}>
              <Grid container spacing={2}>
                {posts.map(post => (
                  <Grid size={{ xs: 12 }} key={post.id}>
                    <PostCard post={post} />
                  </Grid>
                ))}
              </Grid>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Pagination
                page={page}
                count={totalPages}
                onChange={(_, value) => setPage(value)}
                color="primary"
              />
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};