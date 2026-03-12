import React, { useEffect, useState } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";

type Props = { studentId: string };

export const StudentPerformanceBlock: React.FC<Props> = ({ studentId }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    setLoading(true);
    setData(null); 
    setLoading(false);
  }, [studentId]);

  if (loading) return <CircularProgress sx={{ mt: 2 }} />;
  if (!data) return <Typography sx={{ mt: 2 }}>Данные об успеваемости не загружены</Typography>;

  return <Box>Здесь будет блок успеваемости</Box>;
};