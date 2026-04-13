import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Typography, Card, CardContent, CircularProgress, Button } from "@mui/material";

import { getTeamDetails, joinTeam, leaveTeam } from "../../shared/lib/api/teams";
import type { Team } from "../../shared/lib/api/teams";
import { fetchPostById } from "../../shared/lib/api/createPost";

export const TeamsPage = () => {
  const { postId } = useParams();

  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [maxMembersPerTeam, setMaxMembersPerTeam] = useState(0);
  const [formationDeadline, setFormationDeadline] = useState<string | null>(null);

  const userId = localStorage.getItem("userId");
  const role = (localStorage.getItem("userRole") ?? "").toUpperCase();

  const fetchTeams = async () => {
    if (!postId) return;
    try {
      const data = await getTeamDetails(postId);
      setTeams(data);
    } catch (e) {
      console.error("Ошибка загрузки команд:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    if (!postId) return;
    try {
        const [teamsData, postData] = await Promise.all([
            getTeamDetails(postId),
            fetchPostById(postId)
        ]);

        setTeams(teamsData);

        const rules = postData?.task?.teamRules;
        setMaxMembersPerTeam(rules?.maxMembersPerTeam ?? 0);
        setFormationDeadline(rules?.formationDeadline ?? null);

    } catch (e) {
        console.error("Ошибка загрузки:", e);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [postId]);
  useEffect(() => { fetchTeams(); }, [postId]);

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

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", mt: 4 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>Команды</Typography>

      {teams.map(team => {
        const isMyTeam = team.members.some(m => m.id === userId);
        const userTeam = findUserTeam();

        return (
          <Card key={team.id} sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="h6">{team.name}</Typography>

                {role === "STUDENT" && (
                  <>
                    {!userTeam && (
                      <Button size="small" variant="contained" disabled={!canJoin(team)} onClick={() => handleJoin(team.id)}>Вступить</Button>
                    )}

                    {isMyTeam && (
                      <Button size="small" variant="outlined" color="error" disabled={!isBeforeDeadline()} onClick={() => handleLeave(team.id)}>Покинуть</Button>
                    )}
                  </>
                )}
              </Box>

              <Typography variant="body2" sx={{ mt: 1, mb: 1 }}>Участники:</Typography>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {team.members.map(m => {
                  const isMe = m.id === userId;

                  return (
                    <Card key={m.id} sx={{ px: 1.5, py: 0.5, borderRadius: 2, backgroundColor: isMe ? "#d1e7ff" : "#f5f5f5" }}>
                      <Typography variant="body2">{m.fullName}</Typography>
                    </Card>
                  );
                })}
              </Box>

              <Typography variant="caption" sx={{ display: "block", mt: 1 }}>
                {team.members.length} / {maxMembersPerTeam} участников
              </Typography>

            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
};