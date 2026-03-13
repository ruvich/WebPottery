import { useEffect, useState } from "react";
import { Box, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Alert } from "@mui/material";
import type {CreateSolutionResponse} from "../../shared/lib/api/getMySolution"
import { createSolution } from "../../shared/lib/api/createSolution";
import { getMySolution } from "../../shared/lib/api/getMySolution";
import { useParams } from "react-router-dom";


type Props = {
  open: boolean;
  onClose: () => void;
  onPostCreated: () => void;
};

export const CreateSolution = ({ open, onClose, onPostCreated }: Props) => {
  const postID = useParams().postId;
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [submit, setSubmit] = useState(false);
  const [error, setError] = useState("");

  const getSolution = async () => { 
      
    try {
      const data: CreateSolutionResponse = await getMySolution(postID);
      setText(data.text);
      setUrl(data.videoUrl);
      setSubmit(data.submit);
    } catch (e) {
      console.error("GET MY SOLUTION ERROR", e);
      setError("Видимо решений у тебя нет");
    }
  };

  const handleSubmit = async () => {    
    if (!text.trim()) return setError("Описание решения обязательно");
    if (!url.trim()) return setError("Ссылка на видио обязательна");
    const body = { text, videoUrl: url, submit};
      
    try {
      await createSolution(body, postID);
      console.log("Solution CREATED", body);
      setError("");

      setText("");
      setUrl("");
      onPostCreated();
      onClose();
      getSolution();
    } catch (e) {
      console.error("CREATE POST ERROR", e);
      setError("Ошибка отправки ответа");
    }
  };

  useEffect(() => {
      getSolution();
    }, []);
  

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Прикрепить/изменить решение</DialogTitle>

      <DialogContent>
        <Box sx={{ mt:1 }}>
          {error && <Alert severity="error" sx={{ mb:2 }}>{error}</Alert>}
          <TextField fullWidth label="Основной текст" value={text} onChange={e=>setText(e.target.value)} sx={{ mb:2 }} />
          <TextField fullWidth label="Ссылка на видео" value={url} onChange={e=>setUrl(e.target.value)} sx={{ mb:2 }} />
          <DialogContent>
          <p>{submit ? 'Сдать' : 'Сдать позже'}</p>
          <input type="checkbox" checked={submit} onChange={(e) => setSubmit(e.target.checked)}/>
          </DialogContent>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button variant="contained" onClick={handleSubmit}>Отправить</Button>
        <Button variant="outlined" onClick={onClose}>Отмена</Button>
      </DialogActions>
    </Dialog>
  );
};