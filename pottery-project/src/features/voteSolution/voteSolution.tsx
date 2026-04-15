import { useEffect, useState } from "react";
import { Box, Button, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Grid, Alert } from "@mui/material";
import type {Solution} from "../../shared/lib/api/Solution/getTeamSolution"
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

  const getSolution = async () => {       
    try {
      const data: Solution[] = await getMyTeamSolution(postID);
      setSolutions(data);
    } catch (e) {
      console.error("GET MY TEAM SOLUTION ERROR", e);
      setError("Ошибка получения решениё команды");
    }
    console.log(solutions);
  };

  useEffect(() => {
    getSolution();
  }, []);  

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Выбирете наилучшее решение</DialogTitle>

      <DialogContent>
        <Box sx={{ mt:1 }}>
          {error && <Alert severity="error" sx={{ mb:2 }}>{error}</Alert>}
          {solutions.length === 0 ? (
            <Typography variant="body1" sx={{ textAlign: "center", mt: 4 }}>
              Решения не найдены
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {solutions.map(solution => (
                <Grid size={{ xs: 12 }} key={solution.id}>
                  <SolutionCard solution={solution} />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button variant="outlined" onClick={onClose}>Отмена</Button>
      </DialogActions>
    </Dialog>
  );
};