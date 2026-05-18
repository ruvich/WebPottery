import { useState, useMemo } from "react";
import { Box, Button, TextField, MenuItem, Select, Typography, Alert, Divider, FormControlLabel, Checkbox } from "@mui/material";
import { useNavigate } from "react-router-dom";
import type { PostType } from "../../shared/lib/api/posts";
import { createPost } from "../../shared/lib/api/createPost";
import { distributeTeamsRandom } from "../../shared/lib/api/teams";
import { CriteriaSection } from "../../entities/post/CriteriaSection";
import type { CriterionDto } from "../../shared/lib/api/createPost";

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

  const [gradingEnabled, setGradingEnabled] = useState(false);
  const [maxFinalScore, setMaxFinalScore] = useState(10);
  const [selfAssessmentRequired, setSelfAssessmentRequired] = useState(false);
  const [latePenaltyEnabled, setLatePenaltyEnabled] = useState(false);
  const [latePenaltyPerDay, setLatePenaltyPerDay] = useState(0);
  const [progressPenaltyEnabled, setProgressPenaltyEnabled] = useState(false);
  const [progressPenaltyPerMiss, setProgressPenaltyPerMiss] = useState(0);

  const [criteria, setCriteria] = useState<CriterionDto[]>([]);

  const toNumber = (v: string) => (v.replace(/\D/g, "") === "" ? 0 : Number(v.replace(/\D/g, "")));

  const handleMinTeams = (v: number) => { setMinTeamsCount(v); if (v > maxTeamsCount) setMaxTeamsCount(v); };
  const handleMaxTeams = (v: number) => { setMaxTeamsCount(v); if (v < minTeamsCount) setMinTeamsCount(v); };
  const handleMinMembers = (v: number) => { setMinMembersPerTeam(v); if (v > maxMembersPerTeam) setMaxMembersPerTeam(v); };
  const handleMaxMembers = (v: number) => { setMaxMembersPerTeam(v); if (v < minMembersPerTeam) setMinMembersPerTeam(v); };

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

    if (type === "TASK" && gradingEnabled && criteria.length === 0) {
      setError("Добавьте хотя бы один критерий оценивания");
      return;
    }

    const body = {
      type,
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

            ...(taskMode === "TEAM"
              ? {
                  teamDistributionType,
                  teamRules: {
                    formationDeadline: formationDeadline ? new Date(formationDeadline).toISOString() : null,
                    minTeamsCount,
                    maxTeamsCount,
                    minMembersPerTeam,
                    maxMembersPerTeam,
                  },
                  prioritySolution,
                }
              : {}),

            gradingSettings: gradingEnabled
              ? {
                  enabled: true,
                  maxFinalScore,
                  selfAssessmentRequired,
                  latePenaltyEnabled,
                  latePenaltyPerDay: latePenaltyEnabled ? latePenaltyPerDay : 0,
                  progressPenaltyEnabled,
                  progressPenaltyPerMiss: progressPenaltyEnabled ? progressPenaltyPerMiss : 0,
                }
              : null,

            criteria: gradingEnabled ? criteria : [],
          }
        : null,
    };

    try {
      const created = await createPost(body);

      if (type === "TASK" && taskMode === "TEAM" && teamDistributionType === "RANDOM") {
        await distributeTeamsRandom(created.id);
      }

      navigate("/course");
    } catch (e) {
      console.error(e);
      setError("Ошибка при создании поста");
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", mt: 4 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Создание поста
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {type === "MATERIAL" && (
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Select fullWidth value={type} onChange={(e) => setType(e.target.value as PostType)} sx={{ mb: 2 }}>
            <MenuItem value="MATERIAL">Материал</MenuItem>
            <MenuItem value="TASK">Задание</MenuItem>
          </Select>

          <TextField fullWidth label="Название" value={title} onChange={(e) => setTitle(e.target.value)} sx={{ mb: 2 }} />

          <TextField fullWidth label="Подзаголовок" value={description} onChange={(e) => setDescription(e.target.value)} sx={{ mb: 2 }} />

          <Select fullWidth value={materialType} onChange={(e) => setMaterialType(e.target.value as any)} sx={{ mb: 2 }}>
            <MenuItem value="LINK">Ссылка</MenuItem>
            <MenuItem value="TEXT">Текст</MenuItem>
          </Select>

          <TextField fullWidth label="Название материала" value={materialTitle} onChange={(e) => setMaterialTitle(e.target.value)} sx={{ mb: 2 }} />

          {materialType === "LINK" && (
            <TextField fullWidth label="URL" value={url} onChange={(e) => setUrl(e.target.value)} sx={{ mb: 2 }} />
          )}

          {materialType === "TEXT" && (
            <TextField fullWidth multiline rows={4} label="Текст" value={text} onChange={(e) => setText(e.target.value)} sx={{ mb: 2 }} />
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
            <Select fullWidth value={type} onChange={(e) => setType(e.target.value as PostType)} sx={{ mb: 2 }}>
              <MenuItem value="MATERIAL">Материал</MenuItem>
              <MenuItem value="TASK">Задание</MenuItem>
            </Select>

            <TextField fullWidth label="Название" value={title} onChange={(e) => setTitle(e.target.value)} sx={{ mb: 2 }} />

            <TextField fullWidth label="Подзаголовок" value={description} onChange={(e) => setDescription(e.target.value)} sx={{ mb: 2 }} />

            <TextField fullWidth label="Описание" value={taskDescription} onChange={(e) => setTaskDescription(e.target.value)} sx={{ mb: 2 }} />

            <TextField
              fullWidth
              type="datetime-local"
              InputLabelProps={{ shrink: true }}
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              sx={{ mb: 2 }}
            />

            <Select fullWidth value={taskMode} onChange={(e) => setTaskMode(e.target.value as any)} sx={{ mb: 2 }}>
              <MenuItem value="SOLO">Индивидуальное</MenuItem>
              <MenuItem value="TEAM">Командное</MenuItem>
            </Select>

            {taskMode === "TEAM" && (
              <>
                <Select fullWidth value={teamDistributionType} onChange={(e) => setTeamDistributionType(e.target.value as any)} sx={{ mb: 2 }}>
                  <MenuItem value="MANUAL">Ручное</MenuItem>
                  <MenuItem value="RANDOM">Случайное</MenuItem>
                  <MenuItem value="SELF_SELECTION">Самоорганизация</MenuItem>
                </Select>

                {teamDistributionType === "SELF_SELECTION" && (
                  <TextField
                    fullWidth
                    type="datetime-local"
                    label="Дедлайн команд"
                    InputLabelProps={{ shrink: true }}
                    value={formationDeadline}
                    onChange={(e) => setFormationDeadline(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                )}

                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 2 }}>
                  <TextField label="Мин команд" value={minTeamsCount} onChange={(e) => handleMinTeams(toNumber(e.target.value))} />

                  <TextField label="Макс команд" value={maxTeamsCount} onChange={(e) => handleMaxTeams(toNumber(e.target.value))} />

                  <TextField label="Мин участников" value={minMembersPerTeam} onChange={(e) => handleMinMembers(toNumber(e.target.value))} />

                  <TextField label="Макс участников" value={maxMembersPerTeam} onChange={(e) => handleMaxMembers(toNumber(e.target.value))} />
                </Box>

                <Select fullWidth value={prioritySolution} onChange={(e) => setPrioritySolution(e.target.value as any)} sx={{ mb: 2 }}>
                  <MenuItem value="CAPITAIN">Капитан</MenuItem>
                  <MenuItem value="LAST">Последний</MenuItem>
                  <MenuItem value="FIRST">Первый</MenuItem>
                  <MenuItem value="VOTING">Голосование</MenuItem>
                </Select>
              </>
            )}

            <Divider sx={{ my: 2 }} />

            <FormControlLabel
              control={<Checkbox checked={gradingEnabled} onChange={(e) => setGradingEnabled(e.target.checked)} />}
              label="Система критериев оценки"
            />

            {gradingEnabled && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Максимальный балл"
                  value={maxFinalScore}
                  onChange={(e) => setMaxFinalScore(Number(e.target.value))}
                  error={maxFinalScore <= 0}
                  helperText={maxFinalScore <= 0 ? "Максимальный балл должен быть больше 0" : ""}
                />

                <Box sx={{ border: "1px solid #eee", borderRadius: 2, p: 2 }}>
                  <FormControlLabel
                    control={<Checkbox checked={selfAssessmentRequired} onChange={(e) => setSelfAssessmentRequired(e.target.checked)} />}
                    label="Самооценка студента"
                  />
                </Box>

                <Box sx={{ border: "1px solid #eee", borderRadius: 2, p: 2 }}>
                  <FormControlLabel
                    control={<Checkbox checked={latePenaltyEnabled} onChange={(e) => setLatePenaltyEnabled(e.target.checked)} />}
                    label="Штраф за просрочку"
                  />

                  {latePenaltyEnabled && (
                    <TextField
                      fullWidth
                      sx={{ mt: 1 }}
                      type="number"
                      label="Штраф за день"
                      value={latePenaltyPerDay}
                      onChange={(e) => setLatePenaltyPerDay(Number(e.target.value))}
                      error={latePenaltyPerDay <= 0}
                      helperText={latePenaltyPerDay <= 0 ? "Штраф должен быть больше 0" : ""}
                    />
                  )}
                </Box>

                <Box sx={{ border: "1px solid #eee", borderRadius: 2, p: 2 }}>
                  <FormControlLabel
                    control={<Checkbox checked={progressPenaltyEnabled} onChange={(e) => setProgressPenaltyEnabled(e.target.checked)} />}
                    label="Штраф за прогресс"
                  />

                  {progressPenaltyEnabled && (
                    <TextField
                      fullWidth
                      sx={{ mt: 1 }}
                      type="number"
                      label="Штраф за пропуск"
                      value={progressPenaltyPerMiss}
                      onChange={(e) => setProgressPenaltyPerMiss(Number(e.target.value))}
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
          Создать
        </Button>

        <Button variant="outlined" onClick={() => navigate("/course")}>
          Отмена
        </Button>
      </Box>
    </Box>
  );
};