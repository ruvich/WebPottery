import { useEffect, useState, useMemo } from "react";
import {
  Box, Button, TextField, MenuItem, Select, Typography, Alert,
  Divider, FormControlLabel, Checkbox
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import type { PostType } from "../../shared/lib/api/posts";
import { fetchPostById, updatePost } from "../../shared/lib/api/createPost";
import type { CriterionDto } from "../../shared/lib/api/createPost";
import { CriteriaSection } from "../../entities/post/CriteriaSection";

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

  const [teamDistributionType, setTeamDistributionType] =
    useState<"MANUAL" | "RANDOM" | "SELF_SELECTION">("MANUAL");

  const [prioritySolution, setPrioritySolution] =
    useState<"CAPITAIN" | "LAST" | "FIRST" | "VOTING">("CAPITAIN");

  const [formationDeadline, setFormationDeadline] = useState("");

  const [minTeamsCount, setMinTeamsCount] = useState(0);
  const [maxTeamsCount, setMaxTeamsCount] = useState(0);
  const [minMembersPerTeam, setMinMembersPerTeam] = useState(1);
  const [maxMembersPerTeam, setMaxMembersPerTeam] = useState(5);

  const [gradingEnabled, setGradingEnabled] = useState(false);
  const [maxFinalScore, setMaxFinalScore] = useState(10);
  const [selfAssessmentRequired, setSelfAssessmentRequired] = useState(false);
  const [latePenaltyEnabled, setLatePenaltyEnabled] = useState(false);
  const [latePenaltyPerDay, setLatePenaltyPerDay] = useState(0);
  const [progressPenaltyEnabled, setProgressPenaltyEnabled] = useState(false);
  const [progressPenaltyPerMiss, setProgressPenaltyPerMiss] = useState(0);

  const [criteria, setCriteria] = useState<CriterionDto[]>([]);

  const isTeam = taskMode === "TEAM";

  const toNumber = (v: string) => (v.replace(/\D/g, "") === "" ? 0 : Number(v.replace(/\D/g, "")));

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

  useEffect(() => {
    if (!postId) return;

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

          const g = d.task.gradingSettings;
          if (g) {
            setGradingEnabled(g.enabled);
            setMaxFinalScore(g.maxFinalScore);
            setSelfAssessmentRequired(g.selfAssessmentRequired);
            setLatePenaltyEnabled(g.latePenaltyEnabled);
            setLatePenaltyPerDay(g.latePenaltyPerDay ?? 0);
            setProgressPenaltyEnabled(g.progressPenaltyEnabled);
            setProgressPenaltyPerMiss(g.progressPenaltyPerMiss ?? 0);
          }

          setCriteria(d.task.criteria ?? []);
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

    if (gradingEnabled && maxFinalScore <= 0) return true;
    if (gradingEnabled && latePenaltyEnabled && latePenaltyPerDay <= 0) return true;
    if (gradingEnabled && progressPenaltyEnabled && progressPenaltyPerMiss <= 0) return true;

    return false;
  }, [
    title, isTeam,
    minTeamsCount, maxTeamsCount,
    minMembersPerTeam, maxMembersPerTeam,
    gradingEnabled,
    maxFinalScore,
    latePenaltyEnabled, latePenaltyPerDay,
    progressPenaltyEnabled, progressPenaltyPerMiss
  ]);

  const handleSubmit = async () => {
    if (!postId) return;

    setError("");
    if (!title.trim()) return setError("Название обязательно");

    if (type === "TASK" && gradingEnabled && criteria.length === 0) {
      setError("Добавьте хотя бы один критерий оценивания");
      return;
    }


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

              gradingSettings: gradingEnabled
                ? {
                    enabled: true,
                    maxFinalScore,
                    selfAssessmentRequired,
                    latePenaltyEnabled,
                    latePenaltyPerDay,
                    progressPenaltyEnabled,
                    progressPenaltyPerMiss,
                  }
                : null,

              criteria: gradingEnabled ? criteria : [],
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
    <Box sx={{ maxWidth: 1200, mx: "auto", mt: 4 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Редактирование поста
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {type === "MATERIAL" && (
        <Box sx={{ display: "flex", flexDirection: "column" }}>

          <Select fullWidth value={type} disabled sx={{ mb: 2 }}>
            <MenuItem value="MATERIAL">Материал</MenuItem>
            <MenuItem value="TASK">Задание</MenuItem>
          </Select>

          <TextField fullWidth label="Название"
            value={title}
            onChange={e => setTitle(e.target.value)}
            sx={{ mb: 2 }} />

          <TextField fullWidth label="Подзаголовок"
            value={description}
            onChange={e => setDescription(e.target.value)}
            sx={{ mb: 2 }} />

          <Select fullWidth value={materialType}
            onChange={e => setMaterialType(e.target.value as any)}
            sx={{ mb: 2 }}>

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
        </Box>
      )}

      {type === "TASK" && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: gradingEnabled ? "1fr 1fr" : "1fr",
            },
            gap: 3,
            alignItems: "start",
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column" }}>

            <Select fullWidth value={type} disabled sx={{ mb: 2 }}>
              <MenuItem value="MATERIAL">Материал</MenuItem>
              <MenuItem value="TASK">Задание</MenuItem>
            </Select>

            <TextField fullWidth label="Название"
              value={title}
              onChange={e => setTitle(e.target.value)}
              sx={{ mb: 2 }} />

            <TextField fullWidth label="Подзаголовок"
              value={description}
              onChange={e => setDescription(e.target.value)}
              sx={{ mb: 2 }} />

            <TextField fullWidth label="Описание задания"
              value={taskDescription}
              onChange={e => setTaskDescription(e.target.value)}
              sx={{ mb: 2 }} />

            <TextField fullWidth type="datetime-local"
              InputLabelProps={{ shrink: true }}
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
                  <MenuItem value="SELF_SELECTION">Самоорганизация</MenuItem>
                </Select>

                {teamDistributionType === "SELF_SELECTION" && (
                <TextField
                    fullWidth
                    type="datetime-local"
                    label="Дедлайн формирования команд"
                    InputLabelProps={{ shrink: true }}
                    value={formationDeadline}
                    onChange={e => setFormationDeadline(e.target.value)}
                    sx={{ mb: 2 }}
                />
                )}

                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 2 }}>
                  <TextField
                    label="Мин команд"
                    value={minTeamsCount}
                    onChange={(e) => handleMinTeams(toNumber(e.target.value))}
                  />

                  <TextField
                    label="Макс команд"
                    value={maxTeamsCount}
                    onChange={(e) => handleMaxTeams(toNumber(e.target.value))}
                  />

                  <TextField
                    label="Мин участников"
                    value={minMembersPerTeam}
                    onChange={(e) => handleMinMembers(toNumber(e.target.value))}
                  />

                  <TextField
                    label="Макс участников"
                    value={maxMembersPerTeam}
                    onChange={(e) => handleMaxMembers(toNumber(e.target.value))}
                  />

                </Box>

                <Select fullWidth value={prioritySolution}
                  onChange={e => setPrioritySolution(e.target.value as any)}
                  sx={{ mb: 2 }}>

                  <MenuItem value="CAPITAIN">Капитан</MenuItem>
                  <MenuItem value="LAST">Последний</MenuItem>
                  <MenuItem value="FIRST">Первый</MenuItem>
                  <MenuItem value="VOTING">Голосование</MenuItem>
                </Select>
              </>
            )}

            <Divider sx={{ my: 2 }} />

            <FormControlLabel
              control={
                <Checkbox
                  checked={gradingEnabled}
                  onChange={e => setGradingEnabled(e.target.checked)}
                />
              }
              label="Система критериев оценки"
            />

            {gradingEnabled && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>

                <TextField
                  type="number"
                  label="Максимальный балл"
                  value={maxFinalScore}
                  onChange={e => setMaxFinalScore(Number(e.target.value))}
                  error={maxFinalScore <= 0}
                  helperText={maxFinalScore <= 0 ? "Максимальный балл должен быть больше 0" : ""}
                />

                <Box sx={{ border: "1px solid #eee", borderRadius: 2, p: 2 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selfAssessmentRequired}
                        onChange={e => setSelfAssessmentRequired(e.target.checked)}
                      />
                    }
                    label="Самооценка студента"
                  />
                </Box>

                <Box sx={{ border: "1px solid #eee", borderRadius: 2, p: 2 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={latePenaltyEnabled}
                        onChange={e => setLatePenaltyEnabled(e.target.checked)}
                      />
                    }
                    label="Штраф за просрочку"
                  />

                  {latePenaltyEnabled && (
                    <TextField
                      fullWidth
                      sx={{ mt: 1 }}
                      type="number"
                      label="Штраф за день"
                      value={latePenaltyPerDay}
                      onChange={e => setLatePenaltyPerDay(Number(e.target.value))}
                      error={latePenaltyPerDay <= 0}
                      helperText={latePenaltyPerDay <= 0 ? "Штраф должен быть больше 0" : ""}
                    />
                  )}
                </Box>

                <Box sx={{ border: "1px solid #eee", borderRadius: 2, p: 2 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={progressPenaltyEnabled}
                        onChange={e => setProgressPenaltyEnabled(e.target.checked)}
                      />
                    }
                    label="Штраф за прогресс"
                  />

                  {progressPenaltyEnabled && (
                    <TextField
                      fullWidth
                      sx={{ mt: 1 }}
                      type="number"
                      label="Штраф за пропуск"
                      value={progressPenaltyPerMiss}
                      onChange={e => setProgressPenaltyPerMiss(Number(e.target.value))}
                      error={progressPenaltyPerMiss <= 0}
                      helperText={progressPenaltyPerMiss <= 0 ? "Штраф должен быть больше 0" : ""}
                    />
                  )}
                </Box>

                <Divider sx={{ my: 1 }} />
              </Box>
            )}
          </Box>

          {gradingEnabled && (
            <Box sx={{ position: "sticky", top: 20, height: "fit-content" }}>
              <CriteriaSection criteria={criteria} setCriteria={setCriteria} />
            </Box>
          )}
        </Box>
      )}

      <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
        <Button variant="contained" onClick={handleSubmit} disabled={isInvalid}>
          Сохранить
        </Button>

        <Button variant="outlined" onClick={() => navigate("/course")}>
          Отмена
        </Button>
      </Box>
    </Box>
  );
};