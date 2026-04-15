import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Alert,
  Paper,
  Stack,
} from "@mui/material";
import type { Solution } from "../../shared/lib/api/Solution/getTeamSolution";
import { getMyTeamSolution } from "../../shared/lib/api/Solution/getTeamSolution";
import { SolutionCard } from "../../entities/solution/FullSolutionCard";
import { useParams } from "react-router-dom";

type Props = {
  open: boolean;
  onClose: () => void;
};

export const VoteSolution = ({ open, onClose }: Props) => {
  const postID = useParams().postId;
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const getSolution = async () => {
    if (!postID || !open) return;

    setLoading(true);
    setError("");

    try {
      const data: Solution[] = await getMyTeamSolution(postID);
      setSolutions(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("GET MY TEAM SOLUTION ERROR", e);
      setError("Ошибка получения решений команды");
      setSolutions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      getSolution();
    }
  }, [open, postID]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 5,
          overflow: "hidden",
          background: "linear-gradient(180deg, #fffdfb 0%, #ffffff 100%)",
          boxShadow: "0 24px 60px rgba(90, 60, 30, 0.18)",
        },
      }}
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
          Выбор решения
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 3 }}>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}

          {loading ? (
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 4,
                textAlign: "center",
                backgroundColor: "#dbeeff",
                border: "1px solid rgba(120, 90, 60, 0.08)",
              }}
            >
              <Typography sx={{ color: "#5d5147" }}>Загрузка решений...</Typography>
            </Paper>
          ) : solutions.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: 5,
                borderRadius: 4,
                textAlign: "center",
                backgroundColor: "#dbeeff",
                border: "1px dashed rgba(120, 90, 60, 0.16)",
              }}
            >
              <Typography
                variant="body1"
                sx={{ fontWeight: 700, color: "#5d5147", mb: 0.5 }}
              >
                Решения не найдены
              </Typography>
              <Typography variant="body2" sx={{ color: "#8b7d72" }}>
                Когда участники команды добавят решения, они появятся здесь
              </Typography>
            </Paper>
          ) : (
            <Box
              sx={{
                p: 1,
                borderRadius: 4,
                backgroundColor: "#dbeeff",
                border: "1px solid rgba(120, 90, 60, 0.08)",
              }}
            >
              <Grid container spacing={2}>
                {solutions.map((solution) => (
                  <Grid size={{ xs: 12 }} key={solution.id}>
                    <SolutionCard solution={solution} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 3,
          pt: 0,
        }}
      >
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{
            borderRadius: 3,
            px: 3,
            py: 1.1,
            textTransform: "none",
            fontWeight: 700,
            borderColor: "#1976d2",
            color: "#1976d2",
            "&:hover": {
              borderColor: "#1976d2",
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