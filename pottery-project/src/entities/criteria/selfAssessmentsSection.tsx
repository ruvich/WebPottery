import { Box, Typography, Paper, Stack, Chip, TextField, Checkbox, Slider} from "@mui/material";
import type { SelfAssessment } from "../../shared/lib/api/Solution/selfAssessment";

type Props = {
  selfAssessment: SelfAssessment[];
  setSelfAssessment: (v: SelfAssessment[]) => void;
};

export const SelfAssessmentSection = ({ selfAssessment: selfAssessment, setSelfAssessment: setSelfAssessment}: Props) => {
    const handleChange = (index: number, field: keyof SelfAssessment, value: any) => {
        const newArray = [...selfAssessment]; // Создаем копию массива
        newArray[index] = {
        ...newArray[index], // Копируем старый объект
        [field]: value, // Обновляем нужное поле
        };
        setSelfAssessment(newArray); // Обновляем состояние
    };    


    return(
        <Paper sx={{ p: 2, borderRadius: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6">Поле самооценивания</Typography>
      </Box>

      {selfAssessment.length === 0 && (
        <Box sx={{ py: 3, textAlign: "center", color: "text.secondary" }}>
          Критерии не найдены?!
        </Box>
      )}

      <Stack spacing={1}>
        {selfAssessment.map((c, i) => (
          <Paper
            key={i}
            variant="outlined"
            sx={{
              p: 1.5,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderRadius: 2,
            }}
          >
            <Box>
              <Typography fontWeight={600}>
                {c.title} <Chip size="small" label={c.maxScore} sx={{ ml: 1 }} />
              </Typography>

               {c.valueType === "POINTS" &&(
                    <TextField
                    type="number"
                    label={`Число от 0 до ${c.maxScore}`}
                    value={c.pointsValue || ''} // Убираем undefined
                    onChange={(e) => handleChange(i, 'pointsValue', e.target.value)}
                    inputProps={{ min: 0, max: c.maxScore, step: 1 }}
                    fullWidth
                    />
                )}
                {c.valueType === "YES_NO" &&(
                    <Checkbox
                    checked={c.booleanValue}
                    onChange={(e) => handleChange(i, 'booleanValue', e.target.checked)}
                    color="primary"
                    />
                )}
                {c.valueType === "PERCENT" &&(
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <Slider
                         value={typeof c.percentValue === 'string' ? parseInt(c.percentValue, 10) || 0 : c.percentValue}
                         onChange={(e, newValue) => handleChange(i, 'percentValue', Number(newValue))}
                        min={0}
                        max={100}
                        step={1}
                        />
                    </Box>
                )}
            </Box>

          </Paper>
        ))}
      </Stack>

    </Paper>

    );
};