import React from 'react';
import { Box, Paper, Typography, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Comment } from '../../shared/lib/api/getCommentByPostID';

interface CommentBlockProps {
  comment: Comment;
  currentUserId: string;
  onDelete?: (commentId: string) => void;
}

export const CommentBlock: React.FC<CommentBlockProps> = ({ comment, currentUserId, onDelete }) => {
  const isMine = comment.authorId === currentUserId;

  return (
    <Box display="flex" justifyContent={isMine ? 'flex-end' : 'flex-start'} mb={1}>
      <Paper
        sx={{
          p: 2,
          width: '60%',
          maxWidth: '75%',
          backgroundColor: isMine ? '#DCF8C6' : '#F0F0F0',
          borderRadius: 2,
          position: 'relative',
        }}
        elevation={1}
      >
        {!isMine && (
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
            {comment.authorName}
          </Typography>
        )}
        <Typography variant="body1">{comment.body}</Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          display="block"
          textAlign="right"
          sx={{ mt: 0.5 }}
        >
          {new Date(comment.createdAt).toLocaleString()}
        </Typography>

        {isMine && onDelete && (
          <IconButton
            size="small"
            sx={{ position: 'absolute', top: 4, right: 4 }}
            onClick={() => onDelete(comment.id)}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        )}
      </Paper>
    </Box>
  );
};