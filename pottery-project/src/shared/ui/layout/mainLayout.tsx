import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import Header from "./header";
import Footer from "./footer";

export default function MainLayout() {
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />

      <Box sx={{ flexGrow: 1, padding: 3 }}>
        <Outlet />
      </Box>

      <Footer />
    </Box>
  );
}