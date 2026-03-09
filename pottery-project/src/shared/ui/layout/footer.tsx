import { Box, Typography } from "@mui/material";

export default function Footer() {
  return (
    <Box
      sx={{
        marginTop: "auto",
        padding: 2,
        textAlign: "center",
        backgroundColor: "#f5f5f5",
      }}
    >
      <Typography variant="body2">
        © {new Date().getFullYear()} Pottery Courses
      </Typography>
    </Box>
  );
}