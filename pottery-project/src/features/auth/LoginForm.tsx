import { useState } from "react";
import { TextField, Button, Box, Typography } from "@mui/material";
import { login } from "../../shared/lib/api/auth";
import { useNavigate } from "react-router-dom";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

  const handleSubmit = async () => {
    setError("");

    if (!email || !password) {
      setError("Обязательное поле");
      return;
    }

    if (!validateEmail(email)) {
      setError("Неверный email");
      return;
    }

    setLoading(true);

    try {
      const data = await login({ email, password });
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("userRole", data.user.role);

      navigate("/courses");

      console.log("Успешно:", data);
    } catch (err: any) {
      if (err.response?.status === 400) setError("Неверный логин или пароль");
      else setError("Сервер недоступен");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="form"
      sx={{
        width: 300,
        margin: "50px auto",
        padding: 3,
        border: "1px solid #ccc",
        borderRadius: 2,
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Typography variant="h5" textAlign="center">
        Авторизация
      </Typography>

      <TextField
        label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={!!error && !validateEmail(email)}
        helperText={!!error && !email.includes("@") ? error : ""}
      />

      <TextField
        label="Пароль"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={!!error && !password}
        helperText={!!error && !password ? error : ""}
      />

      {error && email && password && <Typography color="error">{error}</Typography>}

      <Button variant="contained" onClick={handleSubmit} disabled={loading}>
        {loading ? "Загрузка..." : "Войти"}
      </Button>
    </Box>
  );
};

export default LoginForm;