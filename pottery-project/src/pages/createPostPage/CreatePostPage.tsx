import { useState } from "react";
import {Box, Button, TextField, MenuItem, Select, Typography, Alert} from "@mui/material";
import { useNavigate } from "react-router-dom";
import type { PostType } from "../../shared/lib/api/posts";
import { createPost } from "../../shared/lib/api/createPost";

export const CreatePostPage = () => {
  const navigate = useNavigate();

  const [type, setType] = useState<PostType>("MATERIAL");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [materialType, setMaterialType] = useState<"LINK" | "TEXT">("LINK");
  const [materialTitle, setMaterialTitle] = useState("");
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");

  const [taskDescription, setTaskDescription] = useState("");
  const [deadline, setDeadline] = useState("");

  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!title.trim()) return setError("Название поста обязательно");

    if (type === "MATERIAL") {
      if (!materialTitle.trim()) return setError("Название материала обязательно");
      if (materialType === "LINK" && !url.trim()) return setError("URL обязателен");
      if (materialType === "TEXT" && !text.trim()) return setError("Текст обязателен");
    }

    const body =
      type === "MATERIAL"
        ? {
            type,
            title,
            description,
            material: {
              type: materialType,
              title: materialTitle,
              url: materialType === "LINK" ? url : null,
              text: materialType === "TEXT" ? text : null,
            },
            task: null,
          }
        : {
            type,
            title,
            description,
            material: null,
            task: {
              description: taskDescription || null,
              deadline: deadline || null,
            },
          };

    try {
      await createPost(body as any);
      navigate("/course");
    } catch (e) {
      console.error(e);
      setError("Ошибка при создании поста");
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 4 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Создание поста
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Select
        fullWidth
        value={type}
        onChange={(e) => setType(e.target.value as PostType)}
        sx={{ mb: 2 }}
      >
        <MenuItem value="MATERIAL">Материал</MenuItem>
        <MenuItem value="TASK">Задание</MenuItem>
      </Select>

      <TextField
        fullWidth
        label="Название"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        label="Описание"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        sx={{ mb: 2 }}
      />

      {type === "MATERIAL" && (
        <>
          <Select
            fullWidth
            value={materialType}
            onChange={(e) => setMaterialType(e.target.value as any)}
            sx={{ mb: 2 }}
          >
            <MenuItem value="LINK">LINK</MenuItem>
            <MenuItem value="TEXT">TEXT</MenuItem>
          </Select>

          <TextField
            fullWidth
            label="Название материала"
            value={materialTitle}
            onChange={(e) => setMaterialTitle(e.target.value)}
            sx={{ mb: 2 }}
          />

          {materialType === "LINK" && (
            <TextField
              fullWidth
              label="URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              sx={{ mb: 2 }}
            />
          )}

          {materialType === "TEXT" && (
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Текст"
              value={text}
              onChange={(e) => setText(e.target.value)}
              sx={{ mb: 2 }}
            />
          )}
        </>
      )}

      {type === "TASK" && (
        <>
          <TextField
            fullWidth
            label="Текст задания"
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            type="datetime-local"
            label="Deadline"
            InputLabelProps={{ shrink: true }}
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            sx={{ mb: 2 }}
          />
        </>
      )}

      <Box sx={{ display: "flex", gap: 2 }}>
        <Button variant="contained" onClick={handleSubmit}>Создать</Button>
        <Button variant="outlined" onClick={() => navigate("/course")}>Отмена</Button>
      </Box>
    </Box>
  );
};