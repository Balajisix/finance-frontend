import { useAuthContext } from "../context/AuthContext.tsx";

type Props = {
  permission?: string;
  anyPermission?: string[];
  role?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

const PermissionGate = ({
  permission,
  anyPermission,
  role,
  children,
  fallback = null,
}: Props) => {
  const { hasPermission, hasAnyPermission, hasRole } = useAuthContext();

  if (permission && !hasPermission(permission)) return <>{fallback}</>;
  if (anyPermission && !hasAnyPermission(anyPermission)) return <>{fallback}</>;
  if (role && !hasRole(role)) return <>{fallback}</>;

  return <>{children}</>;
};

export default PermissionGate;
