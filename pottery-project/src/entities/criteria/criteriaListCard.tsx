import { useEffect, useState } from "react";
import { Box, Button, Grid, Dialog, DialogTitle, DialogContent, DialogActions, Alert, Typography, Stack, FormControlLabel, Switch, Divider,} from "@mui/material";
import type { PostsResponse } from "../../shared/lib/api/post";
import { fetchPost } from "../../shared/lib/api/post";
import { CriteriaCard } from "../../entities/criteria/criteriaCard";
import { useParams } from "react-router-dom";

type Props = {
  open: boolean;
  onClose: () => void;
};

export const CriteriaListCard = ({ open, onClose }: Props) => {
  const postID = useParams().postId;
  const [post, setPost] = useState<PostsResponse | null>(null);

    const handleClose = () => {
        onClose();
    };

    const loadPost = async () => {
        try {
            const data: PostsResponse = await fetchPost(postID);
            setPost(data);
            
        } catch (err: any) {
            console.error("Ошибка загрузки поста", err);
        }
    };

    useEffect(() => {
        loadPost();
    }, []);
 
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
     
    >
      <DialogTitle
        sx={{
          px: 3,
          py: 2.5,
          background: "linear-gradient(135deg, #dbeeff 0%, #dbeeff 100%)",
          borderBottom: "1px solid rgba(120, 90, 60, 0.08)",
        }}
      >
        <Typography
          variant="h5"
          sx={{ fontWeight: 800, color: "#000000", mb: 0.5 }}
        >
          {"Список критериев:"}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 3 }}>
        <Stack spacing={2.5} sx={{ mt: 1 }}>

            <Grid container spacing={2}>
                {post?.task?.criteria.map(criteria => (
                <Grid size={{ xs: 12 }} key={criteria.id}>
                    <CriteriaCard
                    criteria={criteria}
                    />
                </Grid>
                ))}
            </Grid>

          <Divider />

          {post?.task?.gradingSettings?.latePenaltyEnabled === true &&(
            <Typography
            variant="h4"
            sx={{
                fontWeight: 800,
                color: "#0c0400",
                mb: 2,
                fontSize: { xs: "1.2rem", md: "1.4rem" },
                lineHeight: 1.2,
            }}
            >
            Штраф за просроченный дедлайн: {post?.task?.gradingSettings?.latePenaltyPerDay}
            </Typography>            
          )}

          {post?.task?.gradingSettings?.progressPenaltyEnabled === true &&(
            <Typography
            variant="h4"
            sx={{
                fontWeight: 800,
                color: "#0c0400",
                mb: 2,
                fontSize: { xs: "1.2rem", md: "1.4rem" },
                lineHeight: 1.2,
            }}
            >
            Штраф за просроченный показ прогресса: {post?.task?.gradingSettings?.progressPenaltyPerMiss}
            </Typography>            
          )}
          
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 3,
          pt: 0,
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1.5,
        }}
      >
        <Button
          variant="outlined"
          onClick={handleClose}
          sx={{
            borderRadius: 3,
            px: 3,
            py: 1.1,
            textTransform: "none",
            fontWeight: 700,
            borderColor: "#1976d2",
            color: "#1976d2",
            "&:hover": {
              borderColor: "#8d5a32",
              backgroundColor: "rgba(183, 121, 70, 0.05)",
            },
          }}
        >
          Закрыть
        </Button>
      </DialogActions>
    </Dialog>
  );
};