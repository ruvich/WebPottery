import { useState } from "react";
import { Box, Button, TextField, MenuItem, Select, Dialog, DialogTitle, DialogContent, DialogActions, Alert } from "@mui/material";
import type { PostType } from "../../shared/lib/api/posts";
import { createPost } from "../../shared/lib/api/createPost";

type Props = {
  open: boolean;
  onClose: () => void;
  onPostCreated: () => void;
};

export const CreatePostForm = ({ open, onClose, onPostCreated }: Props) => {
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
      if (materialType === "LINK" && !url.trim()) return setError("URL обязателен для LINK");
      if (materialType === "TEXT" && !text.trim()) return setError("Текст обязателен для TEXT");
    }

    const body = type === "MATERIAL"
      ? { type, title, description, material: { type: materialType, title: materialTitle, url: materialType==="LINK"?url:null, text: materialType==="TEXT"?text:null }, task: null }
      : { type, title, description, material: null, task: { description: taskDescription || null, deadline: deadline || null } };

    try {
      await createPost(body as any);
      console.log("POST CREATED", body);
      setError("");

      setTitle("");
      setDescription("");
      setMaterialTitle("");
      setUrl("");
      setText("");
      setTaskDescription("");
      setDeadline("");

      onPostCreated();

      onClose();
    } catch (e) {
      console.error("CREATE POST ERROR", e);
      setError("Ошибка при создании поста");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Создать пост</DialogTitle>

      <DialogContent>
        <Box sx={{ mt:1 }}>
          {error && <Alert severity="error" sx={{ mb:2 }}>{error}</Alert>}

          <Select fullWidth value={type} onChange={e=>setType(e.target.value as PostType)} sx={{ mb:2 }}>
            <MenuItem value="MATERIAL">Материал</MenuItem>
            <MenuItem value="TASK">Задание</MenuItem>
          </Select>

          <TextField fullWidth label="Название" value={title} onChange={e=>setTitle(e.target.value)} sx={{ mb:2 }} />
          <TextField fullWidth label="Описание" value={description} onChange={e=>setDescription(e.target.value)} sx={{ mb:2 }} />

          {type==="MATERIAL" && <>
            <Select fullWidth value={materialType} onChange={e=>setMaterialType(e.target.value as any)} sx={{ mb:2 }}>
              <MenuItem value="LINK">LINK</MenuItem>
              <MenuItem value="TEXT">TEXT</MenuItem>
            </Select>

            <TextField fullWidth label="Название материала" value={materialTitle} onChange={e=>setMaterialTitle(e.target.value)} sx={{ mb:2 }} />

            {materialType==="LINK" && <TextField fullWidth label="URL" value={url} onChange={e=>setUrl(e.target.value)} sx={{ mb:2 }} />}
            {materialType==="TEXT" && <TextField fullWidth label="Текст" multiline rows={4} value={text} onChange={e=>setText(e.target.value)} sx={{ mb:2 }} />}
          </>}

          {type==="TASK" && <>
            <TextField fullWidth label="Текст задания" value={taskDescription} onChange={e=>setTaskDescription(e.target.value)} sx={{ mb:2 }} />
            <TextField fullWidth type="datetime-local" label="Deadline" InputLabelProps={{ shrink:true }} value={deadline} onChange={e=>setDeadline(e.target.value)} sx={{ mb:2 }} />
          </>}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button variant="contained" onClick={handleSubmit}>Создать</Button>
        <Button variant="outlined" onClick={onClose}>Отмена</Button>
      </DialogActions>
    </Dialog>
  );
};