import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Stack,
  Divider,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { fetchCriterionGrade, type CriterionGradeResponse } from "../../shared/lib/api/Solution/getCriterionGrade";

type Props = {
  open: boolean;
  onClose: () => void;
  solutionId: string | null;
};

export const CriterionGradeModal = ({ open, onClose, solutionId }: Props) => {
  const [gradeData, setGradeData] = useState<CriterionGradeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && solutionId) {
      loadGradeData();
    }
  }, [open, solutionId]);

  const loadGradeData = async () => {
    if (!solutionId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCriterionGrade(solutionId);
      setGradeData(data);
    } catch (err) {
      console.error("Error loading criterion grade:", err);
      setError("Не удалось загрузить данные оценки");
    } finally {
      setLoading(false);
    }
  };

  const renderCriterionValue = (criterion: any, assessment: any) => {
    if (!assessment) return "Не оценено";
    
    switch (criterion.type) {
      case "POINTS":
        return `${assessment.pointsValue} / ${criterion.maxScore} баллов`;
      case "YES_NO":
        return assessment.booleanValue ? "✅ Да" : "❌ Нет";
      case "PERCENT":
        return `${assessment.percentValue}%`;
      default:
        return "—";
    }
  };

  const getProgressColor = (score: number, max: number) => {
    const percentage = (score / max) * 100;
    if (percentage >= 80) return "success";
    if (percentage >= 60) return "info";
    if (percentage >= 40) return "warning";
    return "error";
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          background: "linear-gradient(135deg, #ffffff 0%, #faf9ff 100%)",
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" sx={{ fontWeight: 800, color: "#0c0400" }}>
            Детализация оценки
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 2 }}>
        {loading && (
          <Box sx={{ py: 8, textAlign: "center" }}>
            <Typography>Загрузка данных...</Typography>
          </Box>
        )}

        {error && (
          <Box sx={{ py: 8, textAlign: "center" }}>
            <Typography color="error">{error}</Typography>
          </Box>
        )}

        {gradeData && !loading && (
          <Stack spacing={3}>
            {/* Общая статистика */}
            <Box
              sx={{
                p: 2.5,
                borderRadius: 3,
                bgcolor: "#f0f8ff",
                border: "1px solid rgba(120, 90, 60, 0.1)",
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                Общая информация
              </Typography>
              
              <Stack spacing={1.5}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" sx={{ color: "#000000" }}>
                    <Box component="span" sx={{ fontWeight: 700 }}>Исходный балл:</Box>
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {gradeData.rawScore} / {gradeData.maxFinalScore}
                  </Typography>
                </Box>

                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" sx={{ color: "#000000" }}>
                    <Box component="span" sx={{ fontWeight: 700 }}>Регулярные баллы:</Box>
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {gradeData.regularScore}
                  </Typography>
                </Box>

                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" sx={{ color: "#000000" }}>
                    <Box component="span" sx={{ fontWeight: 700 }}>Бонусные баллы:</Box>
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "#2e7d32" }}>
                    +{gradeData.bonusScore}
                  </Typography>
                </Box>

                {gradeData.latePenalty > 0 && (
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" sx={{ color: "#d32f2f" }}>
                      <Box component="span" sx={{ fontWeight: 700 }}>Штраф за опоздание:</Box>
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#d32f2f", fontWeight: 600 }}>
                      -{gradeData.latePenalty} ({gradeData.lateDays} дн.)
                    </Typography>
                  </Box>
                )}

                {gradeData.progressPenalty > 0 && (
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" sx={{ color: "#d32f2f" }}>
                      <Box component="span" sx={{ fontWeight: 700 }}>Штраф за прогресс:</Box>
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#d32f2f", fontWeight: 600 }}>
                      -{gradeData.progressPenalty} ({gradeData.progressMissesCount} пропусков)
                    </Typography>
                  </Box>
                )}

                <Divider />

                <Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      Итоговый балл:
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: "#1976d2" }}>
                      {gradeData.finalScore} / {gradeData.maxFinalScore}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(gradeData.finalScore / gradeData.maxFinalScore) * 100}
                    color={getProgressColor(gradeData.finalScore, gradeData.maxFinalScore)}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>

                {gradeData.gradedAt && (
                  <Typography variant="caption" sx={{ color: "#999", mt: 1, display: "block" }}>
                    Дата оценки: {new Date(gradeData.gradedAt).toLocaleString()}
                  </Typography>
                )}
              </Stack>
            </Box>

            {/* Критерии оценивания */}
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                Критерии оценивания ({gradeData.items.length})
              </Typography>

              <Stack spacing={2}>
                {gradeData.items.map((item, index) => (
                  <Accordion
                    key={item.criterion.id}
                    sx={{
                      boxShadow: "none",
                      border: "1px solid #e0e0e0",
                      borderRadius: 2,
                      "&:before": { display: "none" },
                    }}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
                        <Typography sx={{ fontWeight: 700 }}>
                          {item.criterion.title}
                        </Typography>
                        <Chip
                          label={item.criterion.impactType === "BONUS" ? "Бонусный" : "Основной"}
                          size="small"
                          sx={{
                            bgcolor: item.criterion.impactType === "BONUS" ? "#e8f5e9" : "#e3f2fd",
                            color: item.criterion.impactType === "BONUS" ? "#2e7d32" : "#1976d2",
                            fontSize: "0.7rem",
                            fontWeight: 600,
                          }}
                        />
                        <Chip
                          label={item.criterion.type}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: "0.7rem" }}
                        />
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body2" sx={{ color: "#666", mb: 2 }}>
                        {item.criterion.description}
                      </Typography>

                      <Stack spacing={2}>
                        <Box sx={{ p: 1.5, bgcolor: "#f5f5f5", borderRadius: 2 }}>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: "#1976d2", mb: 1, display: "block" }}>
                            🎓 Оценка преподавателя
                          </Typography>
                          <Typography variant="body2">
                            {renderCriterionValue(item.criterion, item.teacherAssessment)}
                          </Typography>
                          {item.teacherAssessment?.teacherComment && (
                            <Typography variant="caption" sx={{ color: "#666", display: "block", mt: 1 }}>
                              Комментарий: {item.teacherAssessment.teacherComment}
                            </Typography>
                          )}
                        </Box>

                        {item.selfAssessment && (
                          <Box sx={{ p: 1.5, bgcolor: "#f3e5f5", borderRadius: 2 }}>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: "#9c27b0", mb: 1, display: "block" }}>
                              📝 Самооценка
                            </Typography>
                            <Typography variant="body2">
                              {renderCriterionValue(item.criterion, item.selfAssessment)}
                            </Typography>
                            {item.selfAssessment.comment && (
                              <Typography variant="caption" sx={{ color: "#666", display: "block", mt: 1 }}>
                                Комментарий: {item.selfAssessment.comment}
                              </Typography>
                            )}
                          </Box>
                        )}

                        {item.teacherAssessment && item.selfAssessment && (
                          <Box display="flex" justifyContent="flex-end">
                            <Chip
                              label={
                                item.teacherAssessment.calculatedScore === item.selfAssessment.calculatedScore
                                  ? "✅ Оценки совпадают"
                                  : "⚠️ Расхождение в оценках"
                              }
                              size="small"
                              sx={{
                                bgcolor:
                                  item.teacherAssessment.calculatedScore === item.selfAssessment.calculatedScore
                                    ? "#e8f5e9"
                                    : "#fff3e0",
                                color:
                                  item.teacherAssessment.calculatedScore === item.selfAssessment.calculatedScore
                                    ? "#2e7d32"
                                    : "#ed6c02",
                              }}
                            />
                          </Box>
                        )}
                      </Stack>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Stack>
            </Box>
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
};