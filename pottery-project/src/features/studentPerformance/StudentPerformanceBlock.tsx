import React, { useEffect, useState } from "react";
import { Box, Typography, CircularProgress, Paper, Stack } from "@mui/material";
import { getStudentPerformance, type StudentPerformanceResponse } from "../../shared/lib/api/studentPerformanceApi";

type Props = { studentId: string };

export const StudentPerformanceBlock: React.FC<Props> = ({ studentId }) => {
  const [data, setData] = useState<StudentPerformanceResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadPerformance = async () => {
      setLoading(true);
      try {
        const result = await getStudentPerformance(studentId);
        setData(result);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadPerformance();
  }, [studentId]);

  if (loading) return <CircularProgress sx={{ mt: 2 }} />;

  if (!data || !data.items || data.items.length === 0) {
    return <Typography sx={{ mt: 2 }}>Данные об успеваемости не найдены</Typography>;
  }

  const getGradeColor = (score: number) => {
    if (score >= 4) return "#4caf50";
    if (score >= 3) return "#ff9800"; 
    return "#f44336"; 
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Успеваемость
      </Typography>
      <Typography sx={{ mb: 3 }}>
        Средний балл: <strong>{data.averageGrade}</strong>
      </Typography>

      <Stack spacing={2}>
        {data.items.map((item) => (
          <Paper
            key={item.solutionId}
            elevation={3}
            sx={{
              p: 2,
              borderRadius: 2,
              backgroundColor: "#f9f9f9",
              borderLeft: `5px solid ${getGradeColor(item.grade.score)}`,
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {item.postTitle}
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              Оценка: <strong style={{ color: getGradeColor(item.grade.score) }}>{item.grade.score}</strong>
            </Typography>
            {item.grade.teacherComment && (
              <Typography variant="body2" sx={{ mt: 0.5, fontStyle: "italic", color: "text.secondary" }}>
                Комментарий: {item.grade.teacherComment}
              </Typography>
            )}
          </Paper>
        ))}
      </Stack>
    </Box>
  );
};
