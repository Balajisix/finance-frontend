import { createContext, useContext } from "react";
import type { MeResponse } from "../types/auth.ts";
import { useMe } from "../hooks/useAuth.ts";

type AuthContextValue = {
  user: MeResponse["user"] | null;
  roles: MeResponse["roles"];
  permissions: MeResponse["permissions"];
  isLoading: boolean;
  isAuthenticated: boolean;
  hasPermission: (slug: string) => boolean;
  hasAnyPermission: (slugs: string[]) => boolean;
  hasRole: (slug: string) => boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { data, isLoading, isError } = useMe();

  const user = data?.user ?? null;
  const roles = data?.roles ?? [];
  const permissions = data?.permissions ?? [];
  const isAuthenticated = !!user && !isError;

  const permissionSet = new Set(permissions);

  const hasPermission = (slug: string) =>
    permissionSet.has("*") || permissionSet.has(slug);

  const hasAnyPermission = (slugs: string[]) =>
    permissionSet.has("*") || slugs.some((s) => permissionSet.has(s));

  const hasRole = (slug: string) => roles.some((r) => r.slug === slug);

  return (
    <AuthContext.Provider
      value={{
        user,
        roles,
        permissions,
        isLoading,
        isAuthenticated,
        hasPermission,
        hasAnyPermission,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
};
