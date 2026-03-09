import { Routes, Route } from "react-router-dom";
import { LoginPage } from "../pages/authPage/loginPage";
import { CoursePage } from "../pages/coursePage/coursePage";
import { StudentsListPage } from "../pages/studentsListPage/studentsListPage.tsx";
import  MainLayout  from "../shared/ui/layout/mainLayout.tsx";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<MainLayout />}>
        <Route path="/course" element={<CoursePage />} />
        <Route path="/students" element={<StudentsListPage />} />
        <Route path="*" element={<h1>Страница не найдена</h1>} />
      </Route>
    </Routes>
  );
};