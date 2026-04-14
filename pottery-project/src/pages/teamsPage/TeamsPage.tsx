import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {   Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
  Radio,
  RadioGroup, } from "@mui/material";

import {
  getTeamDetails,
  joinTeam,
  leaveTeam,
  addStudentToTeam,
  removeStudentFromTeam,
  createTeam,
  deleteTeam,
  updateTeam,
} from "../../shared/lib/api/teams";
import type { Team } from "../../shared/lib/api/teams";

import { getStudents } from "../../shared/lib/api/studentsList";
import type { Student } from "../../shared/lib/api/studentsList";

import { fetchPostById } from "../../shared/lib/api/createPost";

export const TeamsPage = () => {
  const { postId } = useParams();

  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [maxMembersPerTeam, setMaxMembersPerTeam] = useState(0);
  const [formationDeadline, setFormationDeadline] = useState<string | null>(null);
  const [teamDistributionType, setTeamDistributionType] = useState<string | null>(null);

  const userId = localStorage.getItem("userId");
  const role = (localStorage.getItem("userRole") ?? "").toUpperCase();


  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [removeModalOpen, setRemoveModalOpen] = useState(false);

  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [captainModalOpen, setCaptainModalOpen] = useState(false);
  const [selectedCaptainId, setSelectedCaptainId] = useState<string>("");

  const normalizedTeamDistributionType = (teamDistributionType ?? "").toUpperCase();

  const isTeacherTeamManagement =
    role === "TEACHER" &&
    ["MANUAL", "RANDOM", "SELF_SELECTION"].includes(normalizedTeamDistributionType);

  const assignedStudentIds = new Set(
    teams.flatMap(team => team.members.map(member => member.id))
  );

  const availableStudents = allStudents.filter(
    student => !assignedStudentIds.has(student.id)
  );

  const getNextTeamName = () => {
    const numbers = teams
      .map((team) => {
        const match = team.name.match(/^Team\s+(\d+)$/i);
        return match ? Number(match[1]) : 0;
      })
      .filter((num) => !Number.isNaN(num));

    const nextNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
    return `Team ${nextNumber}`;
  };
  
  const handleCreateTeam = async () => {
    if (!postId) return;

    try {
      setSubmitting(true);

      await createTeam(postId, {
        name: getNextTeamName(),
        captainId: null,
        memberIds: null,
      });

      await fetchData();
    } catch (e) {
      console.error("Ошибка создания команды:", e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTeam = async (team: Team) => {
    if (!postId) return;
    if (team.members.length > 0) return;

    try {
      setSubmitting(true);

      await deleteTeam(postId, team.id);

      await fetchData();
    } catch (e) {
      console.error("Ошибка удаления команды:", e);
    } finally {
      setSubmitting(false);
    }
  };

  const fetchTeams = async () => {
    if (!postId) {
      setLoading(false);
      return;
    }
    try {
      const data = await getTeamDetails(postId);
      setTeams(data);
    } catch (e) {
      console.error("Ошибка загрузки команд:", e);
    } finally {
      setLoading(false);
    }
  };

  const openCaptainModal = (team: Team) => {
    setSelectedTeam(team);
    setSelectedCaptainId(team.captainId ?? "");
    setCaptainModalOpen(true);
  };

  const handleSetCaptain = async () => {
    if (!postId || !selectedTeam || !selectedCaptainId) return;

    try {
      setSubmitting(true);

      await updateTeam(postId, selectedTeam.id, {
        captainId: selectedCaptainId,
      });

      setCaptainModalOpen(false);
      setSelectedCaptainId("");
      setSelectedTeam(null);

      await fetchData();
    } catch (e) {
      console.error("Ошибка назначения капитана:", e);
    } finally {
      setSubmitting(false);
    }
  };

  const fetchData = async () => {
    if (!postId) {
      setLoading(false);
      return;
    }

    try {
      const [teamsData, postData] = await Promise.all([
        getTeamDetails(postId),
        fetchPostById(postId),
      ]);

      setTeams(sortTeamsByName(teamsData));

      const rules = postData?.task?.teamRules;
      setMaxMembersPerTeam(rules?.maxMembersPerTeam ?? 0);
      setFormationDeadline(rules?.formationDeadline ?? null);
      setTeamDistributionType(postData?.task?.teamDistributionType ?? null);

      const currentRole = (localStorage.getItem("userRole") ?? "").toUpperCase();
      const currentType = postData?.task?.teamDistributionType ?? null;

      if (
        currentRole === "TEACHER" &&
        ["MANUAL", "RANDOM", "SELF_SELECTION"].includes(currentType)
      ) {
        const studentsData = await getStudents(0, 100);
        setAllStudents(studentsData.items);
      } else {
        setAllStudents([]);
      }
    } catch (e) {
      console.error("Ошибка загрузки:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [postId]);

  const findUserTeam = () => teams.find(t => t.members.some(m => m.id === userId));
  const isBeforeDeadline = () => {
    if (!formationDeadline) return true;
    return new Date() < new Date(formationDeadline);
  };

  const canJoin = (team: Team) => {
    const userTeam = findUserTeam();
    const isFull = team.members.length >= maxMembersPerTeam;
    return !userTeam && !isFull && isBeforeDeadline();
  };

  const handleJoin = async (teamId: string) => {
    if (!postId) return;
    try { await joinTeam(postId, teamId); await fetchTeams(); }
    catch (e) { console.error("Ошибка вступления:", e); }
  };

  const handleLeave = async (teamId: string) => {
    if (!postId) return;
    try { await leaveTeam(postId, teamId); await fetchTeams(); }
    catch (e) { console.error("Ошибка выхода:", e); }
  };

  const openAddModal = (team: Team) => {
    setSelectedTeam(team);
    setSelectedStudentIds([]);
    setAddModalOpen(true);
  };

  const openRemoveModal = (team: Team) => {
    setSelectedTeam(team);
    setSelectedStudentIds([]);
    setRemoveModalOpen(true);
  };

  const handleAddStudents = async () => {
    if (!postId || !selectedTeam || selectedStudentIds.length === 0) return;

    try {
      setSubmitting(true);

      await Promise.all(
        selectedStudentIds.map(studentId =>
          addStudentToTeam(postId, selectedTeam.id, studentId)
        )
      );

      setAddModalOpen(false);
      setSelectedStudentIds([]);
      setSelectedTeam(null);
      await fetchData();
    } catch (e) {
      console.error("Ошибка добавления студентов:", e);
    } finally {
      setSubmitting(false);
    }
  };

  const sortTeamsByName = (teamsToSort: Team[]) => {
    return [...teamsToSort].sort((a, b) => {
      const matchA = a.name.match(/^Team\s+(\d+)$/i);
      const matchB = b.name.match(/^Team\s+(\d+)$/i);

      const numA = matchA ? Number(matchA[1]) : Number.MAX_SAFE_INTEGER;
      const numB = matchB ? Number(matchB[1]) : Number.MAX_SAFE_INTEGER;

      return numA - numB;
    });
  };

  const handleRemoveStudents = async () => {
    if (!postId || !selectedTeam || selectedStudentIds.length === 0) return;

    try {
      setSubmitting(true);

      await Promise.all(
        selectedStudentIds.map(studentId =>
          removeStudentFromTeam(postId, selectedTeam.id, studentId)
        )
      );

      setRemoveModalOpen(false);
      setSelectedStudentIds([]);
      setSelectedTeam(null);
      await fetchData();
    } catch (e) {
      console.error("Ошибка удаления студентов:", e);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}><CircularProgress /></Box>;


  return (
    <>
      <Box sx={{ maxWidth: 900, mx: "auto", mt: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Typography variant="h5">Команды</Typography>

          {isTeacherTeamManagement && (
            <Button
              variant="contained"
              onClick={handleCreateTeam}
              disabled={submitting}
            >
              Создать команду
            </Button>
          )}
        </Box>

        {teams.map((team) => {
          const isMyTeam = team.members.some((m) => m.id === userId);
          const userTeam = findUserTeam();

          return (
            <Card key={team.id} sx={{ mb: 2 }}>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 2,
                    flexWrap: "wrap",
                  }}
                >
                  <Typography variant="h6">{team.name}</Typography>

                  {role === "STUDENT" && (
                  <>
                    {!userTeam && teamDistributionType === "SELF_SELECTION" && (
                      <Button
                        size="small"
                        variant="contained"
                        disabled={!canJoin(team)}
                        onClick={() => handleJoin(team.id)}
                      >
                        Вступить
                      </Button>
                    )}

                    {isMyTeam && teamDistributionType === "SELF_SELECTION" && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        disabled={!isBeforeDeadline()}
                        onClick={() => handleLeave(team.id)}
                      >
                        Покинуть
                      </Button>
                    )}
                  </>
                )}

                  {isTeacherTeamManagement && (
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => openAddModal(team)}
                      >
                        Заполнить команду
                      </Button>

                      <Button
                        size="small"
                        variant="outlined"
                        color="warning"
                        disabled={team.members.length === 0}
                        onClick={() => openRemoveModal(team)}
                      >
                        Удалить участника
                      </Button>

                      <Button
                        size="small"
                        variant="outlined"
                        disabled={team.members.length === 0}
                        onClick={() => openCaptainModal(team)}
                      >
                        Назначить капитана
                      </Button>

                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        disabled={team.members.length > 0 || submitting}
                        onClick={() => handleDeleteTeam(team)}
                      >
                        Удалить команду
                      </Button>
                    </Box>
                  )}
                </Box>

                <Typography variant="body2" sx={{ mt: 1, mb: 1 }}>
                  Участники:
                </Typography>

                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {team.members.length > 0 ? (
                    team.members.map((m) => {
                      const isMe = m.id === userId;
                      const isCaptain = m.id === team.captainId;

                      return (
                        <Card
                          key={m.id}
                          sx={{
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 2,
                            backgroundColor: isMe ? "#d1e7ff" : "#f5f5f5",
                          }}
                        >
                          <Typography variant="body2">
                          {isCaptain ? "♛ " : ""}
                          {m.fullName}
                        </Typography>
                        </Card>
                      );
                    })
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      В команде пока нет участников
                    </Typography>
                  )}
                </Box>

                <Typography variant="caption" sx={{ display: "block", mt: 1 }}>
                  {team.members.length} / {maxMembersPerTeam} участников
                </Typography>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      <Dialog
        open={addModalOpen}
        onClose={() => {
          setAddModalOpen(false);
          setSelectedStudentIds([]);
          setSelectedTeam(null);
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Добавить студентов в команду
          {selectedTeam ? `: ${selectedTeam.name}` : ""}
        </DialogTitle>

        <DialogContent dividers>
          {availableStudents.length === 0 ? (
            <Typography>Нет доступных студентов</Typography>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {availableStudents.map((student) => {
                const remainingSlots = selectedTeam
                  ? maxMembersPerTeam - selectedTeam.members.length
                  : 0;

                const isChecked = selectedStudentIds.includes(student.id);
                const disableUnchecked =
                  !isChecked && selectedStudentIds.length >= remainingSlots;

                return (
                  <FormControlLabel
                    key={student.id}
                    control={
                      <Checkbox
                        checked={isChecked}
                        disabled={remainingSlots <= 0 || disableUnchecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStudentIds((prev) => [...prev, student.id]);
                          } else {
                            setSelectedStudentIds((prev) =>
                              prev.filter((id) => id !== student.id)
                            );
                          }
                        }}
                      />
                    }
                    label={student.fullName}
                  />
                );
              })}
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => {
              setAddModalOpen(false);
              setSelectedStudentIds([]);
              setSelectedTeam(null);
            }}
          >
            Отмена
          </Button>

          <Button
            variant="contained"
            onClick={handleAddStudents}
            disabled={
              selectedStudentIds.length === 0 ||
              submitting ||
              (selectedTeam
                ? selectedTeam.members.length >= maxMembersPerTeam
                : true)
            }
          >
            Добавить
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
          open={captainModalOpen}
          onClose={() => {
            setCaptainModalOpen(false);
            setSelectedCaptainId("");
            setSelectedTeam(null);
          }}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>
            Назначить капитана
            {selectedTeam ? `: ${selectedTeam.name}` : ""}
          </DialogTitle>

          <DialogContent dividers>
            {!selectedTeam || selectedTeam.members.length === 0 ? (
              <Typography>В команде нет участников</Typography>
            ) : (
              <RadioGroup
                value={selectedCaptainId}
                onChange={(e) => setSelectedCaptainId(e.target.value)}
              >
                {selectedTeam.members.map((student) => (
                  <FormControlLabel
                    key={student.id}
                    value={student.id}
                    control={<Radio />}
                    label={student.fullName}
                  />
                ))}
              </RadioGroup>
            )}
          </DialogContent>

          <DialogActions>
            <Button
              onClick={() => {
                setCaptainModalOpen(false);
                setSelectedCaptainId("");
                setSelectedTeam(null);
              }}
            >
              Отмена
            </Button>

            <Button
              variant="contained"
              onClick={handleSetCaptain}
              disabled={!selectedCaptainId || submitting}
            >
              Сохранить
            </Button>
          </DialogActions>
        </Dialog>

      <Dialog
        open={removeModalOpen}
        onClose={() => {
          setRemoveModalOpen(false);
          setSelectedStudentIds([]);
          setSelectedTeam(null);
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Удалить студентов из команды
          {selectedTeam ? `: ${selectedTeam.name}` : ""}
        </DialogTitle>

        <DialogContent dividers>
          {!selectedTeam || selectedTeam.members.length === 0 ? (
            <Typography>В команде нет участников</Typography>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {selectedTeam.members.map((student) => (
                <FormControlLabel
                  key={student.id}
                  control={
                    <Checkbox
                      checked={selectedStudentIds.includes(student.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStudentIds((prev) => [...prev, student.id]);
                        } else {
                          setSelectedStudentIds((prev) =>
                            prev.filter((id) => id !== student.id)
                          );
                        }
                      }}
                    />
                  }
                  label={student.fullName}
                />
              ))}
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => {
              setRemoveModalOpen(false);
              setSelectedStudentIds([]);
              setSelectedTeam(null);
            }}
          >
            Отмена
          </Button>

          <Button
            variant="contained"
            color="error"
            onClick={handleRemoveStudents}
            disabled={selectedStudentIds.length === 0 || submitting}
          >
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};