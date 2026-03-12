import React, { useEffect, useState } from "react";
import { Box, Typography, CircularProgress, Pagination, TextField } from "@mui/material";
import { getStudents, type Student } from "../../shared/lib/api/studentsList";
import { StudentCard } from "../../entities/students/StudentCard";

type Props = {
  studentsFromProps?: Student[];
};

export const StudentsListPage: React.FC<Props> = ({ studentsFromProps }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 10;
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (studentsFromProps) {
      setStudents(studentsFromProps.slice(0, pageSize));
      setTotal(studentsFromProps.length);
      return;
    }

    const loadStudents = async () => {
      setLoading(true);
      try {
        const data = await getStudents(page, pageSize, search);
        setStudents(data?.items ?? []);
        setTotal(data?.total ?? 0);
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, [page, search, studentsFromProps]);

  const filteredStudents = studentsFromProps
    ? studentsFromProps.filter((s) =>
        s.fullName.toLowerCase().includes(search.toLowerCase())
      )
    : students;

  const totalPages = Math.ceil(total / pageSize);
  const studentsOnPage = filteredStudents.slice(page * pageSize, (page + 1) * pageSize);

  const handlePageChange = (_: any, value: number) => {
    setPage(value - 1);
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Список студентов
      </Typography>

      <TextField
        label="Поиск по имени"
        variant="outlined"
        fullWidth
        sx={{ mb: 4 }}
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(0);
        }}
      />

      {loading ? (
        <CircularProgress />
      ) : studentsOnPage.length === 0 ? (
        <Typography>Студенты не найдены</Typography>
      ) : (
        <>
          {studentsOnPage.map((s) => (
            <StudentCard key={s.id} student={s} />
          ))}

          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page + 1}
                onChange={handlePageChange}
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};