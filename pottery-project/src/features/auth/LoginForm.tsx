import { Box, Typography } from "@mui/material";

const LoginForm: React.FC = () => {

  return (
    <Box
      component="form"
      sx={{
        width: 300,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Typography variant="h5" textAlign="center">
        Авторизация
      </Typography>
    </Box>
  );
};

export default LoginForm;