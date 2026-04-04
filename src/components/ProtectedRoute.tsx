import { Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext.tsx";

type Props = {
  permission?: string;
  anyPermission?: string[];
  role?: string;
  fallback?: string;
};

const ProtectedRoute = ({
  permission,
  anyPermission,
  role,
  fallback = "/login",
}: Props) => {
  const { isLoading, isAuthenticated, hasPermission, hasAnyPermission, hasRole } =
    useAuthContext();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={fallback} replace />;
  }

  if (permission && !hasPermission(permission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (anyPermission && !hasAnyPermission(anyPermission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (role && !hasRole(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
