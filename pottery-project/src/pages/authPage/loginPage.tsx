import React from "react";
import { Box } from "@mui/material";
import LoginForm from "../../features/auth/LoginForm";

export const LoginPage: React.FC = () => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh"
      }}
    >
      <LoginForm />
    </Box>
  );
};