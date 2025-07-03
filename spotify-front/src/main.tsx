import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import router from "@/routes.tsx";
import { Toaster } from "react-hot-toast";
createRoot(document.getElementById("root")!).render(
  <>
    <Toaster position="top-right" />
    <RouterProvider router={router} />
  </>
);
