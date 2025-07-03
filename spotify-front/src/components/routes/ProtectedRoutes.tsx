import { Navigate } from "react-router-dom";
import { useUserStore } from "@/store/useUserStore";
import type { ReactNode } from "react";

const ProtectedRoute = ({
  children,
  allowedRoles = [],
}: {
  children: ReactNode;
  allowedRoles?: string[];
}) => {
  const { isAuthenticated, user } = useUserStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role || ""))
    return <Navigate to="/unauthorized" replace />;

  return <>{children}</>;
};

export default ProtectedRoute;
