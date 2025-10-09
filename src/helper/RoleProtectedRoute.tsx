// helper/RoleProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

interface RoleProtectedRouteProps {
  allowedRoles: number[]; // since you're checking role_id
  children: React.ReactNode;
}

const RoleProtectedRoute = ({
  allowedRoles,
  children,
}: RoleProtectedRouteProps) => {
  const { authUser } = useAuthStore();

  if (!authUser) {
    return <Navigate to="/auth/login" replace />;
  }

  if (!allowedRoles.includes(authUser.role_id)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default RoleProtectedRoute;
