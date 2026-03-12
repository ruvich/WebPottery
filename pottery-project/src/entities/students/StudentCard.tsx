import React from "react";
import { Card, CardContent, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import type { Student } from "../../shared/lib/api/studentsList";

type Props = { student: Student };

export const StudentCard: React.FC<Props> = ({ student }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/profile/student/${student.id}`);
  };

  return (
    <Card
      sx={{ mb: 2, cursor: "pointer" }}
      onClick={handleClick}
    >
      <CardContent>
        <Typography variant="h6">{student.fullName}</Typography>
        <Typography variant="body2" color="text.secondary">
          ID: {student.id}
        </Typography>
      </CardContent>
    </Card>
  );
};