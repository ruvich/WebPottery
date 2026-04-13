import { Routes, Route,  Navigate } from "react-router-dom";
import { LoginPage } from "../pages/authPage/loginPage";
import { PostsPage } from "../pages/coursePage/coursePage";
import { StudentsListPage } from "../pages/studentsListPage/studentsListPage.tsx";
import { Error500Page } from "../pages/error500/error500.tsx";
import { StudentProfilePage } from "../pages/studentProfilePage/studentProfilePage.tsx";
import  MainLayout  from "../shared/ui/layout/mainLayout.tsx";
import { ProfilePage } from '../pages/profilePage/ProfilePage';
import { SolutionsPage } from "../pages/solutionsPage/SolutionsPage";
import { SolutionPage } from "../pages/solutionPage/SolutionPage";
import { PostPage } from "../pages/postPage/postPage.tsx";
import { CreatePostPage } from "../pages/createPostPage/CreatePostPage";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
 
      <Route element={<MainLayout />}>
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/solutions/:solutionId" element={<SolutionPage />} />
        <Route path="/posts/:postId/solutions" element={<SolutionsPage />} />
        <Route path="/posts/:postId" element={<PostPage />} />
        <Route path="/course" element={<PostsPage />} />
        <Route path="/students" element={<StudentsListPage />} />
        <Route path="*" element={<h1>Страница не найдена</h1>} />
        <Route path="/error-500" element={<Error500Page />} />
        <Route path="/profile/student/:id" element={<StudentProfilePage />} />
        <Route path="/posts/create" element={<CreatePostPage />} />
      </Route>
    </Routes>
  );
};






