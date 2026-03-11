import { Routes, Route } from "react-router-dom";
import { LoginPage } from "../pages/authPage/loginPage";
import { PostsPage } from "../pages/coursePage/coursePage";
import { StudentsListPage } from "../pages/studentsListPage/studentsListPage.tsx";
import { Error500Page } from "../pages/error500/error500.tsx";
import  MainLayout  from "../shared/ui/layout/mainLayout.tsx";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<MainLayout />}>
        <Route path="/course" element={<PostsPage />} />
        <Route path="/students" element={<StudentsListPage />} />
        <Route path="*" element={<h1>Страница не найдена</h1>} />
        <Route path="/error500" element={<Error500Page />} />
      </Route>
    </Routes>
  );
};