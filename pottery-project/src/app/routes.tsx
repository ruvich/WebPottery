import { Routes, Route } from "react-router-dom";
import { LoginPage } from "../pages/authPage/loginPage";
import { StudentsListPage } from "../pages/studentsListPage/studentsListPage.tsx";
import MainLayout from "../shared/ui/layout/mainLayout.tsx";
import { ProfilePage } from '../pages/profilePage/ProfilePage.tsx';
import { SolutionsPage } from "../pages/solutionsPage/SolutionsPage";
import { SolutionPage } from "../pages/solutionPage/SolutionPage";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<MainLayout />}>
        <Route path="/posts/:postId/solutions" element={<SolutionsPage />} />
        <Route path="/students" element={<StudentsListPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/solutions/:solutionId" element={<SolutionPage />} />
        <Route path="*" element={<h1>Страница не найдена</h1>} />
      </Route>
    </Routes>
  );
};