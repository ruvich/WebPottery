import { useEffect, useState, useMemo } from "react";
import { Box, Button, TextField, MenuItem, Select, Typography, Alert } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import type { PostType } from "../../shared/lib/api/posts";
import { fetchPostById, updatePost } from "../../shared/lib/api/createPost";

export const EditPostPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [type, setType] = useState<PostType>("MATERIAL");
  const [taskMode, setTaskMode] = useState<"SOLO" | "TEAM">("SOLO");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [materialType, setMaterialType] = useState<"LINK" | "TEXT">("LINK");
  const [materialTitle, setMaterialTitle] = useState("");
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");

  const [taskDescription, setTaskDescription] = useState("");
  const [deadline, setDeadline] = useState("");

  const [teamDistributionType, setTeamDistributionType] = useState<"MANUAL" | "RANDOM" | "SELF_SELECTION">("MANUAL");

  const [prioritySolution, setPrioritySolution] = useState<"CAPITAIN" | "LAST" | "FIRST" | "VOTING">("CAPITAIN");

  const [formationDeadline, setFormationDeadline] = useState("");

  const [minTeamsCount, setMinTeamsCount] = useState(0);
  const [maxTeamsCount, setMaxTeamsCount] = useState(0);
  const [minMembersPerTeam, setMinMembersPerTeam] = useState(1);
  const [maxMembersPerTeam, setMaxMembersPerTeam] = useState(5);

  const isTeam = taskMode === "TEAM";

  useEffect(() => {
    if (!postId) {
      setLoading(false);
      navigate("/error-500");
      return;
    }

    (async () => {
      try {
        const d = await fetchPostById(postId);

        setType(d.type);
        setTitle(d.title);
        setDescription(d.description ?? "");

        if (d.material) {
          setMaterialType(d.material.type);
          setMaterialTitle(d.material.title ?? "");
          setUrl(d.material.url ?? "");
          setText(d.material.text ?? "");
        }

        if (d.task) {
          setTaskDescription(d.task.description ?? "");
          setDeadline(d.task.deadline?.slice(0, 16) ?? "");

          setTaskMode(d.task.mode);

          setTeamDistributionType(d.task.teamDistributionType ?? "MANUAL");
          setPrioritySolution(d.task.prioritySolution ?? "CAPITAIN");

          const r = d.task.teamRules;
          if (r) {
            setFormationDeadline(r.formationDeadline?.slice(0, 16) ?? "");
            setMinTeamsCount(r.minTeamsCount ?? 0);
            setMaxTeamsCount(r.maxTeamsCount ?? 0);
            setMinMembersPerTeam(r.minMembersPerTeam ?? 1);
            setMaxMembersPerTeam(r.maxMembersPerTeam ?? 5);
          }
        }
      } catch {
        navigate("/error-500");
      } finally {
        setLoading(false);
      }
    })();
  }, [postId]);

  const isInvalid = useMemo(() => {
    if (!title.trim()) return true;
    if (isTeam && minTeamsCount > maxTeamsCount) return true;
    if (isTeam && minMembersPerTeam > maxMembersPerTeam) return true;
    return false;
  }, [title, isTeam, minTeamsCount, maxTeamsCount, minMembersPerTeam, maxMembersPerTeam]);

  const handleSubmit = async () => {
    if (!postId) return;

    try {
      await updatePost(postId, {
        title,
        description: description || null,

        material: type === "MATERIAL"
          ? {
              type: materialType,
              title: materialTitle,
              url: materialType === "LINK" ? url : null,
              text: materialType === "TEXT" ? text : null,
            }
          : null,

        task: type === "TASK"
          ? {
              description: taskDescription || null,
              deadline: deadline ? new Date(deadline).toISOString() : null,
              mode: taskMode,

              ...(isTeam
                ? {
                    teamDistributionType,
                    prioritySolution,
                    teamRules: {
                      formationDeadline: formationDeadline
                        ? new Date(formationDeadline).toISOString()
                        : null,
                      minTeamsCount,
                      maxTeamsCount,
                      minMembersPerTeam,
                      maxMembersPerTeam,
                    },
                  }
                : {}),
            }
          : null,
      });

      navigate(`/posts/${postId}`);
    } catch {
      setError("Ошибка при сохранении");
    }
  };

  if (loading) return <Typography>Загрузка...</Typography>;

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 4 }}>
      <Typography variant="h5" mb={2}>
        Редактирование поста
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Select fullWidth value={type} disabled sx={{ mb: 2 }}>
        <MenuItem value="MATERIAL">Материал</MenuItem>
        <MenuItem value="TASK">Задание</MenuItem>
      </Select>

      <TextField fullWidth label="Название" value={title}
        onChange={e => setTitle(e.target.value)} sx={{ mb: 2 }} />

      <TextField fullWidth label="Описание" value={description}
        onChange={e => setDescription(e.target.value)} sx={{ mb: 2 }} />

      {type === "MATERIAL" && (
        <>
          <Select fullWidth value={materialType}
            onChange={e => setMaterialType(e.target.value as any)} sx={{ mb: 2 }}>
            <MenuItem value="LINK">Ссылка</MenuItem>
            <MenuItem value="TEXT">Текст</MenuItem>
          </Select>

          <TextField fullWidth label="Название материала"
            value={materialTitle}
            onChange={e => setMaterialTitle(e.target.value)}
            sx={{ mb: 2 }} />

          {materialType === "LINK" && (
            <TextField fullWidth label="URL"
              value={url}
              onChange={e => setUrl(e.target.value)}
              sx={{ mb: 2 }} />
          )}

          {materialType === "TEXT" && (
            <TextField fullWidth multiline rows={4}
              label="Текст"
              value={text}
              onChange={e => setText(e.target.value)}
              sx={{ mb: 2 }} />
          )}
        </>
      )}

      {type === "TASK" && (
        <>
          <TextField fullWidth label="Описание задания"
            value={taskDescription}
            onChange={e => setTaskDescription(e.target.value)}
            sx={{ mb: 2 }} />

          <TextField fullWidth type="datetime-local"
            value={deadline}
            onChange={e => setDeadline(e.target.value)}
            sx={{ mb: 2 }} />

          <Select fullWidth value={taskMode} disabled sx={{ mb: 2 }}>
            <MenuItem value="SOLO">Индивидуальное</MenuItem>
            <MenuItem value="TEAM">Командное</MenuItem>
          </Select>

          {isTeam && (
            <>
              <Select fullWidth value={teamDistributionType}
                onChange={e => setTeamDistributionType(e.target.value as any)}
                sx={{ mb: 2 }}>
                <MenuItem value="MANUAL">Ручное</MenuItem>
                <MenuItem value="RANDOM">Случайное</MenuItem>
                <MenuItem value="SELF_SELECTION">Самостоятельное</MenuItem>
              </Select>

              <TextField fullWidth label="Мин. команд"
                value={minTeamsCount}
                onChange={e => setMinTeamsCount(Number(e.target.value))}
                sx={{ mb: 2 }} />

              <TextField fullWidth label="Макс. команд"
                value={maxTeamsCount}
                onChange={e => setMaxTeamsCount(Number(e.target.value))}
                sx={{ mb: 2 }} />

              <TextField fullWidth label="Мин. участников"
                value={minMembersPerTeam}
                onChange={e => setMinMembersPerTeam(Number(e.target.value))}
                sx={{ mb: 2 }} />

              <TextField fullWidth label="Макс. участников"
                value={maxMembersPerTeam}
                onChange={e => setMaxMembersPerTeam(Number(e.target.value))}
                sx={{ mb: 2 }} />
            </>
          )}
        </>
      )}

      <Button variant="contained" disabled={isInvalid} onClick={handleSubmit}>Сохранить</Button>
    </Box>
  );
};