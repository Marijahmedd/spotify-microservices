import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "@/pages/home/HomePage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import ForgotPasswordPage from "@/pages/ForgotPassword";
import PasswordResetPage from "@/pages/PasswordResetPage";
import NotFound from "@/pages/NotFound";
import ProtectedRoute from "@/components/routes/ProtectedRoutes";
import MainLayout from "@/layouts/MainLayout";
import AlbumPage from "./pages/album/AlbumPage";
import AdminDashboard from "./pages/adminDashboard/AdminDashboard";
import ProfilePage from "./pages/profile/ProfilePage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* HomePage wrapped with MainLayout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/album/:albumId" element={<AlbumPage />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={["admin", "user"]}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Dashboard NOT wrapped with MainLayout */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Auth & misc routes (not wrapped) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/password-reset" element={<PasswordResetPage />} />

        {/* 404 fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
