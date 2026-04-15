import { useState } from "react";
import { Card, CardContent, Typography, Button, Alert, Grid} from "@mui/material";
import type {Solution} from "../../shared/lib/api/Solution/getTeamSolution"
import { voteSolution } from "../../shared/lib/api/Solution/voteSolution";

type Props = {
  solution: Solution;
};

export const SolutionCard = ({ solution: solution }: Props) => {
    const [error, setError] = useState("");
    const vote = async () => {  
        try {
            await voteSolution(solution.id);
            
            } catch (e) {
            console.error("VOTE SOLUTION ERROR", e);
            setError("Ошибка голосования решения");
        }
    }

    return (
        <Card
        sx={{ cursor: "pointer" }}>
        <CardContent>
            {error && <Alert severity="error" sx={{ mb:2 }}>{error}</Alert>}
    
            <Grid container spacing={1}>
                <Grid size={{xs: 6}} >
                    <Typography variant="subtitle1">Имя студента:</Typography>
                </Grid>
                <Grid size={{xs: 6}} >
                    <Typography variant="subtitle1"><strong>{solution.studentName}</strong></Typography>
                </Grid>
            </Grid>

            <Grid container spacing={1}>
                <Grid size={{xs: 6}} >
                    <Typography variant="subtitle1">Решение:</Typography>
                </Grid>
                <Grid size={{xs: 6}} >
                    <Typography variant="h6">{solution.text}</Typography>
                </Grid>
            </Grid>
            <Grid container spacing={1}>
                <Grid size={{xs: 6}} >
                    <Typography variant="subtitle1">Доп материал:</Typography>
                </Grid>
                <Grid size={{xs: 6}} >
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{solution.videoUrl}</Typography>
                </Grid>
            </Grid>            
            {solution.submittedAt === null ? (
                <Typography variant="body1" sx={{ textAlign: "center", mt: 4 }}>
                    Решение не сдано!!
                </Typography>
                ) : (
                <Grid container spacing={1}>
                    <Grid size={{xs: 6}} >
                        <Typography variant="subtitle1">Время отправки:</Typography>
                    </Grid>
                    <Grid size={{xs: 6}} >
                        <Typography variant="caption" display="block" sx={{ mt: 2 }}>{new Date(solution.submittedAt).toLocaleString()}</Typography>
                    </Grid>
                </Grid>
            )}
            <Grid container spacing={1}>
                <Grid size={{xs: 6}} >
                    <Typography variant="subtitle1">Количество голосов:</Typography>
                </Grid>
                <Grid size={{xs: 6}} >
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{solution.votesCount}</Typography>
                </Grid>
            </Grid>
            <Button variant="contained" onClick={vote}>Проголосовать</Button>
        </CardContent>
        </Card>
    );
};