import React from "react";
import { useParams } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import { StudentPerformanceBlock } from "../../features/studentPerformance/StudentPerformanceBlock";

export const StudentProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) return <Typography>Студент не найден</Typography>;

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4">Профиль студента</Typography>
      <Typography variant="body1" sx={{ mt: 2 }}>
        ID студента: {id}
      </Typography>

      <StudentPerformanceBlock studentId={id} />
    </Box>
  );
};