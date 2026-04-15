import React, { useEffect, useState } from 'react';
import {
  Box,
  CircularProgress,
  Paper,
  Typography,
  Divider,
  TextField,
  Button,
  Stack,
} from "@mui/material";
import { CommentBlock } from '../../entities/comment/commentCard';
import { getCommentsByPostId, postComment, deleteComment } from '../../shared/lib/api/getCommentByPostID';
import type { Comment } from '../../shared/lib/api/getCommentByPostID';

interface CommentsListProps {
  postId: string;
  currentUserId: string;
}

export const CommentsList: React.FC<CommentsListProps> = ({ postId, currentUserId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [sending, setSending] = useState(false);

  const token = localStorage.getItem('accessToken') || '';

  const fetchComments = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getCommentsByPostId(postId, token);
      setComments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Ошибка загрузки комментариев:', err);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleSendComment = async () => {
    if (!newComment.trim() || !token) return;
    setSending(true);
    try {
      await postComment(postId, newComment, token);
      setNewComment('');
      await fetchComments();
    } catch (err) {
      console.error('Ошибка отправки комментария:', err);
    } finally {
      setSending(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!token) return;
    try {
      await deleteComment(commentId, token);
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (err) {
      console.error('Ошибка удаления комментария:', err);
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 3 },
        borderRadius: 5,
        background: "linear-gradient(180deg, #ffffff 0%, #fffdfb 100%)",
        border: "1px solid rgba(120, 90, 60, 0.10)",
        boxShadow: "0 18px 40px rgba(90, 60, 30, 0.06)",
      }}
    >
      <Box sx={{ mb: 2.5 }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 800,
            color: "#000000",
            mb: 0.5,
          }}
        >
          Комментарии
        </Typography>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {loading ? (
        <Box display="flex" justifyContent="center" mt={3} mb={2}>
          <CircularProgress />
        </Box>
      ) : comments.length === 0 ? (
        <Box
          sx={{
            py: 5,
            textAlign: "center",
            borderRadius: 3,
            backgroundColor: "#f0f8ff",
            border: "1px dashed rgba(120, 90, 60, 0.16)",
          }}
        >
          <Typography variant="body1" sx={{ fontWeight: 600, color: "#000000" }}>
            Пока нет комментариев
          </Typography>
        </Box>
      ) : (
        <Stack spacing={2}>
          {comments.map((comment) => (
            <CommentBlock
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              onDelete={handleDeleteComment}
            />
          ))}
        </Stack>
      )}

      <Box
        sx={{
          mt: 3,
          p: 2,
          borderRadius: 4,
          backgroundColor: "#ffffff",
          border: "1px solid rgba(120, 90, 60, 0.08)",
        }}
      >
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          <TextField
            fullWidth
            multiline
            minRows={2}
            placeholder="Напишите комментарий..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                backgroundColor: "#fff",
              },
            }}
          />

          <Button
            variant="contained"
            onClick={handleSendComment}
            disabled={sending || !newComment.trim()}
            sx={{
              minWidth: { xs: "100%", sm: 160 },
              borderRadius: 3,
              textTransform: "none",
              fontWeight: 700,
              px: 3,
              background: "linear-gradient(135deg, #1976d2 0%, #1976d2 100%)",
              boxShadow: "0 8px 18px rgba(255, 255, 255, 0.22)",
              "&:hover": {
                background: "linear-gradient(135deg, #1976d2 0%, #1976d2 100%)",
              },
              "&.Mui-disabled": {
                color: "white",
                background: "#1976d2",
              },
            }}
          >
            {sending ? "Отправка..." : "Отправить"}
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
};