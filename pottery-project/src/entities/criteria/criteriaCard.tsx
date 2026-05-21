import { useEffect, useState } from "react";
import { Card, CardContent, Typography, Chip, Box, Stack, Divider,} from "@mui/material";
import type { TaskCriteria} from "../../shared/lib/api/post";

type Props = {
  criteria: TaskCriteria;
};

export const CriteriaCard = ({ criteria }: Props) => {


    return(
    <Card
      elevation={0}
      sx={{
        borderRadius: 5,
        overflow: "hidden",
        background: "linear-gradient(180deg, #fffdfb 0%, #ffffff 100%)",
        border: "1px solid rgba(120, 90, 60, 0.10)",
        boxShadow: "0 18px 40px rgba(90, 60, 30, 0.08)",
      }}
    >
        <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
            <Typography
            variant="h4"
            sx={{
                fontWeight: 800,
                color: "#0c0400",
                mb: 2,
                fontSize: { xs: "1.2rem", md: "1.4rem" },
                lineHeight: 1.2,
            }}
            >
            Название критерия: {criteria.title}
            </Typography>

            <Typography
            variant="body1"
            sx={{
                color: "#3d352f",
                fontSize: "1rem",
                lineHeight: 1.4,
                mb: 3,
            }}
            >
            Его описание: {criteria.description}
            </Typography>

            <Divider />

            <Typography
            variant="body1"
            sx={{
                color: "#3d352f",
                fontSize: "1rem",
                lineHeight: 1.0,
                mb: 3,
            }}
            >
            Тип критерия: {criteria.type}
            </Typography>

            <Typography
            variant="body1"
            sx={{
                color: "#3d352f",
                fontSize: "1rem",
                lineHeight: 1.0,
                mb: 3,
            }}
            >
            Тип критерия: {criteria.impactType === "REGULAR" ? "Основной" : "Бонусный"}
            </Typography>

            <Typography
            variant="body1"
            sx={{
                color: "#3d352f",
                fontSize: "1rem",
                lineHeight: 1.0,
                mb: 3,
            }}
            >
            Максимальное количество баллов за критерий: {criteria.maxScore}
            </Typography>

        </CardContent>
    </Card>
    )
}