import { useState } from "react";
import { Box, Button, Typography, Paper, Stack, Chip, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import type { CriterionDto } from "../../shared/lib/api/createPost";
import { CriterionModal } from "./CriterionModal";

type Props = {
  criteria: CriterionDto[];
  setCriteria: (v: CriterionDto[]) => void;
  disabled?: boolean;
};

export const CriteriaSection = ({ criteria, setCriteria, disabled }: Props) => {
  const [open, setOpen] = useState(false);

  const handleAdd = (c: CriterionDto) => setCriteria([...criteria, c]);
  const handleRemove = (i: number) => setCriteria(criteria.filter((_, idx) => idx !== i));

  return (
    <Paper sx={{ p: 2, borderRadius: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Box>
          <Typography variant="h6">Критерии оценивания</Typography>
          <Typography variant="body2" color="text.secondary">
            Настройка правил оценки работы
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
          disabled={disabled}
        >
          Добавить
        </Button>
      </Box>

      {criteria.length === 0 && (
        <Box sx={{ py: 3, textAlign: "center", color: "text.secondary" }}>
          Критерии пока не добавлены
        </Box>
      )}

      <Stack spacing={1}>
        {criteria.map((c, i) => (
          <Paper
            key={i}
            variant="outlined"
            sx={{
              p: 1.5,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderRadius: 2,
            }}
          >
            <Box>
              <Typography fontWeight={600}>
                {c.title} <Chip size="small" label={c.maxScore} sx={{ ml: 1 }} />
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {c.type} · {c.impactType}
              </Typography>
            </Box>

            <IconButton
              onClick={() => handleRemove(i)}
              disabled={disabled}
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          </Paper>
        ))}
      </Stack>

      <CriterionModal
        open={open}
        onClose={() => setOpen(false)}
        onAdd={handleAdd}
        displayOrder={criteria.length}
      />
    </Paper>
  );
};