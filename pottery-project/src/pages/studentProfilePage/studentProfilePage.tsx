import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { 
  Box, 
  Typography, 
  Avatar, 
  Paper, 
  CircularProgress,
  Alert,
  Chip
} from "@mui/material";
import { StudentPerformanceBlock } from "../../features/studentPerformance/StudentPerformanceBlock";

interface StudentProfile {
  id: string;
  profile: {
    userId: string;
    fullName: string;
    about: string;
  };
}

export const StudentProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!id) {
        setError("ID студента не указан");
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('accessToken');
        
        const response = await fetch(`http://localhost:8080/api/students/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Не авторизован. Пожалуйста, войдите в систему.');
          }
          if (response.status === 404) {
            throw new Error('Студент не найден');
          }
          throw new Error(`Ошибка загрузки данных: ${response.status}`);
        }
        
        const data: StudentProfile = await response.json();
        setStudent(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Произошла ошибка при загрузке данных');
        console.error('Error fetching student:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [id]);

  // Ранний возврат для случаев без id
  if (!id) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">ID студента не указан</Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!student) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="warning">Данные студента не найдены</Alert>
      </Box>
    );
  }

  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Box sx={{ p: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Avatar 
            sx={{ 
              width: 100, 
              height: 100,
              bgcolor: 'primary.main',
              fontSize: '2.5rem'
            }}
          >
            {getInitials(student.profile.fullName)}
          </Avatar>
          
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Typography variant="h4">
                {student.profile.fullName}
              </Typography>
              <Chip 
                label="Студент" 
                color="primary" 
                size="small" 
                variant="outlined"
              />
            </Box>
            
            <Typography variant="body2" color="text.secondary" gutterBottom>
              ID: {student.id}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" gutterBottom>
              User ID: {student.profile.userId}
            </Typography>
            
            {student.profile.about && (
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 2, 
                  mt: 2,
                  bgcolor: 'background.default'
                }}
              >
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  О себе:
                </Typography>
                <Typography variant="body1">
                  {student.profile.about}
                </Typography>
              </Paper>
            )}
          </Box>
        </Box>
      </Paper>

      <StudentPerformanceBlock studentId={id} />
    </Box>
  );
};