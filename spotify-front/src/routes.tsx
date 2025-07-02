import { createBrowserRouter } from "react-router-dom";
import LoginPage from "./components/pages/LoginPage";
import NotFound from "./components/pages/NotFound";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default router;
