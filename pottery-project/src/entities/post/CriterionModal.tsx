import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Select, TextField } from "@mui/material";
import { useState } from "react";
import type { CriterionDto, CriterionImpactType, CriterionType } from "../../shared/lib/api/createPost";

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (criterion: CriterionDto) => void;
  displayOrder: number;
}

export const CriterionModal = ({ open, onClose, onAdd, displayOrder }: Props) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [type, setType] = useState<CriterionType>("POINTS");

  const [maxScore, setMaxScore] = useState(1);

  const [impactType, setImpactType] =
    useState<CriterionImpactType>("REGULAR");

  const handleAdd = () => {
    onAdd({
      title,
      description,
      type,
      maxScore,
      impactType,
      displayOrder,
    });

    setTitle("");
    setDescription("");
    setType("POINTS");
    setMaxScore(1);
    setImpactType("REGULAR");

    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Добавление критерия</DialogTitle>

      <DialogContent>
        <TextField
          fullWidth
          label="Название"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ mt: 1, mb: 2 }}
        />

        <TextField
          fullWidth
          multiline
          rows={3}
          label="Описание"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          sx={{ mb: 2 }}
        />

        <Select
          fullWidth
          value={type}
          onChange={(e) => setType(e.target.value as CriterionType)}
          sx={{ mb: 2 }}
        >
          <MenuItem value="POINTS">Баллы</MenuItem>
          <MenuItem value="YES_NO">Да / Нет</MenuItem>
          <MenuItem value="PERCENT">Проценты</MenuItem>
        </Select>

        <TextField
            fullWidth
            type="number"
            label="Максимальный балл"
            value={maxScore}
            onChange={(e) => setMaxScore(Number(e.target.value))}
            error={maxScore <= 0}
            helperText={
                maxScore <= 0
                ? "Максимальный балл должен быть больше 0"
                : ""
            }
            sx={{ mb: 2 }}
        />

        <Select
          fullWidth
          value={impactType}
          onChange={(e) =>
            setImpactType(e.target.value as CriterionImpactType)
          }
        >
          <MenuItem value="REGULAR">Обычный</MenuItem>
          <MenuItem value="BONUS">Бонусный</MenuItem>
        </Select>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>

        <Button variant="contained" onClick={handleAdd} disabled={!title.trim() || maxScore <= 0}>Добавить</Button>
      </DialogActions>
    </Dialog>
  );
};