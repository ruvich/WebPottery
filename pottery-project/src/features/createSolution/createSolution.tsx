import { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Typography,
  Stack,
  FormControlLabel,
  Switch,
  Divider,
} from "@mui/material";
import type { CreateSolutionResponse } from "../../shared/lib/api/Solution/getMySolution";
import { createSolution } from "../../shared/lib/api/Solution/createSolution";
import { getMySolution } from "../../shared/lib/api/Solution/getMySolution";
import { editSolution, submitSolution } from "../../shared/lib/api/Solution/editSolution";
import { getMyTeamID } from "../../shared/lib/api/Solution/getMyTeamID";
import type { GetTeamIdResponse } from "../../shared/lib/api/Solution/getMyTeamID";
import { useParams } from "react-router-dom";

type Props = {
  open: boolean;
  onClose: () => void;
  onPostCreated: () => void;
};

export const CreateSolution = ({ open, onClose, onPostCreated }: Props) => {
  const postID = useParams().postId;

  const [text, setText] = useState("");
  const [solutionID, setSolutionID] = useState("");
  const [url, setUrl] = useState("");
  const [submit, setSubmit] = useState(false);
  const [teamId, setTeamId] = useState("");
  const [oldSubmit, setOldSubmit] = useState(false);
  const [created, setCreated] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const resetState = () => {
    setError("");
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const getSolution = async () => {
    if (!postID || !open) return;

    setError("");

    try {
      const data: CreateSolutionResponse = await getMySolution(postID);

      setText(data?.text || "");
      setUrl(data?.videoUrl || "");
      setSolutionID(data?.id || "");

      if (!data?.id) {
        setCreated(false);
        setSubmit(false);
        setOldSubmit(false);
      } else {
        setCreated(true);

        if (data.status === "SUBMITTED") {
          setSubmit(true);
          setOldSubmit(true);
        } else {
          setSubmit(false);
          setOldSubmit(false);
        }
      }
    } catch (e) {
      console.error("GET MY SOLUTION ERROR", e);
      setCreated(false);
      setText("");
      setUrl("");
      setSolutionID("");
    }

    try {
      const data: GetTeamIdResponse = await getMyTeamID(postID);
      setTeamId(data.id);
    } catch (e) {
      console.error("GET TEAM ERROR", e);
      setError("Не удалось получить данные команды");
    }
  };

  const handleSubmit = async () => {
    if (!text.trim()) {
      setError("Описание решения обязательно");
      return;
    }

    if (!url.trim()) {
      setError("Ссылка на видео обязательна");
      return;
    }

    if (!postID) {
      setError("Не найден id задания");
      return;
    }

    const body = { text, videoUrl: url, submit, teamId };

    setSaving(true);
    setError("");

    try {
      if (created) {
        await editSolution(body, solutionID);

        if (submit !== oldSubmit) {
          await submitSolution(submit, solutionID);
        }
      } else {
        await createSolution(body, postID);
      }

      onPostCreated();
      handleClose();
    } catch (e) {
      console.error("SOLUTION SAVE ERROR", e);
      setError(created ? "Ошибка изменения решения" : "Ошибка создания решения");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (open) {
      getSolution();
    }
  }, [open, postID]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 5,
          overflow: "hidden",
          background: "linear-gradient(180deg, #fffdfb 0%, #ffffff 100%)",
          boxShadow: "0 24px 60px rgba(90, 60, 30, 0.18)",
        },
      }}
    >
      <DialogTitle
        sx={{
          px: 3,
          py: 2.5,
          background: "linear-gradient(135deg, #dbeeff 0%, #dbeeff 100%)",
          borderBottom: "1px solid rgba(120, 90, 60, 0.08)",
        }}
      >
        <Typography
          variant="h5"
          sx={{ fontWeight: 800, color: "#000000", mb: 0.5 }}
        >
          {created ? "Редактирование решения" : "Новое решение"}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 3 }}>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            fullWidth
            label="Описание решения"
            value={text}
            onChange={(e) => setText(e.target.value)}
            multiline
            minRows={4}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                backgroundColor: "#fffdfb",
              },
            }}
          />

          <TextField
            fullWidth
            label="Ссылка на видео"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                backgroundColor: "#fffdfb",
              },
            }}
          />

          <Divider />

          <Box
            sx={{
              p: 2,
              borderRadius: 3,
              backgroundColor: "#ebf6ff",
              border: "1px solid rgba(120, 90, 60, 0.08)",
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={submit}
                  onChange={(e) => setSubmit(e.target.checked)}
                />
              }
              label={
                <Box>
                  <Typography sx={{ fontWeight: 700, color: "#000000" }}>
                    {submit ? "Сдать решение сейчас" : "Оставить как черновик"}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#131414", mt: 0.3 }}>
                    {submit
                      ? "Решение будет отправлено"
                      : "Вы сможете доработать позже"}
                  </Typography>
                </Box>
              }
              sx={{ alignItems: "flex-start", m: 0 }}
            />
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 3,
          pt: 0,
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1.5,
        }}
      >
        <Button
          variant="outlined"
          onClick={handleClose}
          sx={{
            borderRadius: 3,
            px: 3,
            py: 1.1,
            textTransform: "none",
            fontWeight: 700,
            borderColor: "#1976d2",
            color: "#1976d2",
            "&:hover": {
              borderColor: "#8d5a32",
              backgroundColor: "rgba(183, 121, 70, 0.05)",
            },
          }}
        >
          Отмена
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={saving}
          sx={{
            borderRadius: 3,
            px: 3,
            py: 1.1,
            textTransform: "none",
            fontWeight: 700,
            background: "linear-gradient(135deg, #1976d2 0%, #1976d2 100%)",
            boxShadow: "0 8px 18px rgba(141, 90, 50, 0.22)",
            "&:hover": {
              background: "linear-gradient(135deg, ##1976d2 0%, #1976d2 100%)",
            },
          }}
        >
          {saving ? "Сохранение..." : created ? "Сохранить изменения" : "Создать решение"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};