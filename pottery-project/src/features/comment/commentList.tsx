import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Paper, Typography, Divider, TextField, Button } from '@mui/material';
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
      sx={{
        p: 3,
        mt: 4,
        borderRadius: 2,
        backgroundColor: '#fafafa',
        width: '80%',
        mx: 'auto',
      }}
      elevation={3}
    >
      <Typography variant="h6" sx={{ mb: 2, textAlign: 'left' }}>
        Комментарии
      </Typography>
      <Divider sx={{ mb: 2 }} />

      {loading ? (
        <Box display="flex" justifyContent="flex-start" mt={2}>
          <CircularProgress />
        </Box>
      ) : comments.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'left', mt: 2 }}>
          Комментариев пока нет
        </Typography>
      ) : (
        <Box display="flex" flexDirection="column" gap={2}>
          {comments.map((comment) => (
            <CommentBlock
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              onDelete={handleDeleteComment}
            />
          ))}
        </Box>
      )}

      <Box display="flex" gap={1} mt={3}>
        <TextField
          fullWidth
          placeholder="Напишите комментарий..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <Button
          variant="contained"
          onClick={handleSendComment}
          disabled={sending || !newComment.trim()}
        >
          {sending ? 'Отправка...' : 'Отправить'}
        </Button>
      </Box>
    </Paper>
  );
};