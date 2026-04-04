import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rolesService } from "../services/rolesService.ts";
import type { CreateRolePayload, UpdateRolePayload } from "../types/roles.ts";

export const ROLES_KEYS = {
  all: ["roles"] as const,
  list: () => [...ROLES_KEYS.all, "list"] as const,
  detail: (id: string) => [...ROLES_KEYS.all, "detail", id] as const,
  permissions: () => [...ROLES_KEYS.all, "permissions"] as const,
  members: (roleId: string) => [...ROLES_KEYS.all, "members", roleId] as const,
};

export const useRolesList = () =>
  useQuery({
    queryKey: ROLES_KEYS.list(),
    queryFn: rolesService.listRoles,
    staleTime: 30_000,
  });

export const usePermissionsList = () =>
  useQuery({
    queryKey: ROLES_KEYS.permissions(),
    queryFn: rolesService.listPermissions,
    staleTime: 60_000,
  });

export const useRoleMembers = (roleId: string) =>
  useQuery({
    queryKey: ROLES_KEYS.members(roleId),
    queryFn: () => rolesService.listMembers(roleId),
    enabled: !!roleId,
    staleTime: 15_000,
  });

export const useCreateRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRolePayload) => rolesService.createRole(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ROLES_KEYS.all }),
  });
};

export const useUpdateRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRolePayload }) =>
      rolesService.updateRole(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ROLES_KEYS.all }),
  });
};

export const useDeleteRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => rolesService.deleteRole(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ROLES_KEYS.all }),
  });
};

export const useAttachPermission = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ roleId, permissionSlug }: { roleId: string; permissionSlug: string }) =>
      rolesService.attachPermission(roleId, permissionSlug),
    onSuccess: () => qc.invalidateQueries({ queryKey: ROLES_KEYS.all }),
  });
};

export const useDetachPermission = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ roleId, permissionId }: { roleId: string; permissionId: string }) =>
      rolesService.detachPermission(roleId, permissionId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ROLES_KEYS.all }),
  });
};

export const useAssignMember = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
      rolesService.assignMember(userId, roleId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ROLES_KEYS.all });
    },
  });
};

export const useRevokeMember = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
      rolesService.revokeMember(userId, roleId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ROLES_KEYS.all });
    },
  });
};
