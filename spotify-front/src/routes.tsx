// import { createBrowserRouter } from "react-router-dom";
// import LoginPage from "./components/pages/LoginPage";
// import NotFound from "./components/pages/NotFound";
// import Dashboard from "./components/pages/Dashboard";
// import ProtectedRoute from "./components/routes/ProtectedRoutes";
// import RegisterPage from "./components/pages/RegisterPage";
// import ForgotPasswordPage from "./components/pages/ForgotPassword";
// import PasswordResetPage from "./components/pages/PasswordResetPage";
// import HomePage from "./components/pages/HomePage";

// const router = createBrowserRouter([
//   {
//     path: "/login",
//     element: <LoginPage />,
//   },
//   {
//     path: "/register",
//     element: <RegisterPage />,
//   },
//   {
//     path: "/forgot-password",
//     element: <ForgotPasswordPage />,
//   },
//   {
//     path: "/password-reset",
//     element: <PasswordResetPage />,
//   },
//   {
//     path: "/",
//     element: <HomePage />,
//   },

//   {
//     path: "/dashboard",
//     element: (
//       <ProtectedRoute allowedRoles={["user"]}>
//         <Dashboard />
//       </ProtectedRoute>
//     ),
//   },

//   {
//     path: "*",
//     element: <NotFound />,
//   },
// ]);

// export default router;
