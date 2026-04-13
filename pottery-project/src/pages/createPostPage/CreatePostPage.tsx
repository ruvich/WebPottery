import { useState, useMemo } from "react";
import { Box, Button, TextField, MenuItem, Select, Typography, Alert } from "@mui/material";
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

  const [taskMode, setTaskMode] = useState<"SOLO" | "TEAM">("SOLO");

  const [teamDistributionType, setTeamDistributionType] = useState<"MANUAL" | "RANDOM" | "SELF_SELECTION">("MANUAL");

  const [prioritySolution, setPrioritySolution] = useState<"CAPITAIN" | "LAST" | "FIRST" | "VOTING">("CAPITAIN");

  const [formationDeadline, setFormationDeadline] = useState("");

  const [minTeamsCount, setMinTeamsCount] = useState(0);
  const [maxTeamsCount, setMaxTeamsCount] = useState(0);

  const [minMembersPerTeam, setMinMembersPerTeam] = useState(1);
  const [maxMembersPerTeam, setMaxMembersPerTeam] = useState(5);

  const [error, setError] = useState("");

  const handleMinTeams = (v: number) => {
    setMinTeamsCount(v);
    if (v > maxTeamsCount) setMaxTeamsCount(v);
  };

  const handleMaxTeams = (v: number) => {
    setMaxTeamsCount(v);
    if (v < minTeamsCount) setMinTeamsCount(v);
  };

  const handleMinMembers = (v: number) => {
    setMinMembersPerTeam(v);
    if (v > maxMembersPerTeam) setMaxMembersPerTeam(v);
  };

  const handleMaxMembers = (v: number) => {
    setMaxMembersPerTeam(v);
    if (v < minMembersPerTeam) setMinMembersPerTeam(v);
  };

  const toNumber = (v: string) => {
    const cleaned = v.replace(/\D/g, "");
    return cleaned === "" ? 0 : Number(cleaned);
  };

  const isInvalid = useMemo(() => {
    if (!title.trim()) return true;

    if (type === "TASK" && taskMode === "TEAM") {
      if (minTeamsCount > maxTeamsCount) return true;
      if (minMembersPerTeam > maxMembersPerTeam) return true;
    }

    return false;
  }, [title, type, taskMode, minTeamsCount, maxTeamsCount, minMembersPerTeam, maxMembersPerTeam]);

  const handleSubmit = async () => {
    setError("");

    if (!title.trim()) return setError("Название обязательно");

    const body = {
      type,
      title,
      description: description || null,

      material:
        type === "MATERIAL"
          ? {
              type: materialType,
              title: materialTitle,
              url: materialType === "LINK" ? url : null,
              text: materialType === "TEXT" ? text : null,
            }
          : null,

      task:
        type === "TASK"
          ? {
              description: taskDescription || null,
              deadline: deadline ? new Date(deadline).toISOString() : null,
              mode: taskMode,

              ...(taskMode === "TEAM"
                ? {
                    teamDistributionType,
                    teamRules: {
                      formationDeadline: formationDeadline
                        ? new Date(formationDeadline).toISOString()
                        : null,

                      minTeamsCount,
                      maxTeamsCount,

                      minMembersPerTeam,
                      maxMembersPerTeam,
                    },
                    prioritySolution,
                  }
                : {}),
            }
          : null,
    };

    try {
      await createPost(body);
      navigate("/course");
    } catch (e) {
      console.error(e);
      setError("Ошибка при создании поста");
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 4 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Создание поста
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Select fullWidth value={type} onChange={(e) => setType(e.target.value as PostType)} sx={{ mb: 2 }}>
        <MenuItem value="MATERIAL">Материал</MenuItem>
        <MenuItem value="TASK">Задание</MenuItem>
      </Select>

      <TextField fullWidth label="Название" value={title} onChange={(e) => setTitle(e.target.value)} sx={{ mb: 2 }} />

      <TextField fullWidth label="Подзаголовок" value={description} onChange={(e) => setDescription(e.target.value)} sx={{ mb: 2 }} />

      {type === "MATERIAL" && (
        <>
          <Select fullWidth value={materialType} onChange={(e) => setMaterialType(e.target.value as any)} sx={{ mb: 2 }}>
            <MenuItem value="LINK">Ссылка</MenuItem>
            <MenuItem value="TEXT">Текст</MenuItem>
          </Select>

          <TextField fullWidth label="Название материала" value={materialTitle} onChange={(e) => setMaterialTitle(e.target.value)} sx={{ mb: 2 }} />

          {materialType === "LINK" && (
            <TextField fullWidth label="URL" value={url} onChange={(e) => setUrl(e.target.value)} sx={{ mb: 2 }} />
          )}

          {materialType === "TEXT" && (
            <TextField fullWidth multiline rows={4} label="Текст материала" value={text} onChange={(e) => setText(e.target.value)} sx={{ mb: 2 }} />
          )}
        </>
      )}

      {type === "TASK" && (
        <>
          <TextField fullWidth label="Описание задания" value={taskDescription} onChange={(e) => setTaskDescription(e.target.value)} sx={{ mb: 2 }} />

          <TextField fullWidth type="datetime-local" InputLabelProps={{ shrink: true }} value={deadline} onChange={(e) => setDeadline(e.target.value)} sx={{ mb: 2 }} />

          <Select fullWidth value={taskMode} onChange={(e) => setTaskMode(e.target.value as any)} sx={{ mb: 2 }}>
            <MenuItem value="SOLO">Индивидуальное</MenuItem>
            <MenuItem value="TEAM">Командное</MenuItem>
          </Select>

          {taskMode === "TEAM" && (
            <>
              <Select fullWidth value={teamDistributionType} onChange={(e) => setTeamDistributionType(e.target.value as any)} sx={{ mb: 2 }}>
                <MenuItem value="MANUAL">Ручное распределение (преподавателем)</MenuItem>
                <MenuItem value="RANDOM">Случайное распределение</MenuItem>
                <MenuItem value="SELF_SELECTION">Самостоятельное формирование (студентами)</MenuItem>
              </Select>

              <TextField
                fullWidth
                type="datetime-local"
                label="Дедлайн формирования команд"
                InputLabelProps={{ shrink: true }}
                value={formationDeadline}
                onChange={(e) => setFormationDeadline(e.target.value)}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Мин. команд"
                value={minTeamsCount}
                onChange={(e) => handleMinTeams(toNumber(e.target.value))}
                sx={{ mb: 2 }}
                />

                <TextField
                fullWidth
                label="Макс. команд"
                value={maxTeamsCount}
                onChange={(e) => handleMaxTeams(toNumber(e.target.value))}
                sx={{ mb: 2 }}
                />

              <TextField
                fullWidth
                label="Мин. участников"
                value={minMembersPerTeam}
                onChange={(e) => handleMinMembers(toNumber(e.target.value))}
                sx={{ mb: 2 }}
                />

                <TextField
                fullWidth
                label="Макс. участников"
                value={maxMembersPerTeam}
                onChange={(e) => handleMaxMembers(toNumber(e.target.value))}
                sx={{ mb: 2 }}
                />

              <Select fullWidth value={prioritySolution} onChange={(e) => setPrioritySolution(e.target.value as any)} sx={{ mb: 2 }}>
                <MenuItem value="CAPITAIN">Капитан</MenuItem>
                <MenuItem value="LAST">Последний</MenuItem>
                <MenuItem value="FIRST">Первый</MenuItem>
                <MenuItem value="VOTING">Голосование</MenuItem>
              </Select>
            </>
          )}
        </>
      )}

      <Box sx={{ display: "flex", gap: 2 }}>
        <Button variant="contained" onClick={handleSubmit} disabled={isInvalid}>Создать</Button>
        <Button variant="outlined" onClick={() => navigate("/course")}>Отмена</Button>
      </Box>
    </Box>
  );
};