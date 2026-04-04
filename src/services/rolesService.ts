import api from "../lib/api.ts";
import type { Role, Permission, RoleMember, CreateRolePayload, UpdateRolePayload } from "../types/roles.ts";

export const rolesService = {
  listRoles: async (): Promise<Role[]> => {
    const res = await api.get<{ roles: Role[] }>("/roles/get-all-roles");
    return res.data.roles ?? res.data.roles;
  },

  getRole: async (id: string): Promise<Role> => {
    const res = await api.get<{ role: Role }>(`/roles/get-role/${id}`);
    return res.data.role;
  },

  createRole: async (data: CreateRolePayload): Promise<Role> => {
    const res = await api.post<{ role: Role }>("/roles/create-role", data);
    return res.data.role;
  },

  updateRole: async (id: string, data: UpdateRolePayload): Promise<Role> => {
    const res = await api.patch<{ role: Role }>(`/roles/update-role/${id}`, data);
    return res.data.role;
  },

  deleteRole: async (id: string): Promise<void> => {
    await api.delete(`/roles/delete-role/${id}`);
  },

  listPermissions: async (): Promise<Permission[]> => {
    const res = await api.get<{ permissions: Permission[] }>("/roles/permissions");
    return res.data.permissions;
  },

  attachPermission: async (roleId: string, permissionSlug: string): Promise<void> => {
    await api.post(`/roles/attach-permission/${roleId}/permissions`, { permissionSlug });
  },

  detachPermission: async (roleId: string, permissionId: string): Promise<void> => {
    await api.delete(`/roles/delete-permission/${roleId}/permissions/${permissionId}`);
  },

  listMembers: async (roleId: string): Promise<RoleMember[]> => {
    const res = await api.get<{ members: RoleMember[] }>(`/roles/get-role-members/${roleId}/members`);
    return res.data.members;
  },

  assignMember: async (userId: string, roleId: string): Promise<void> => {
    await api.post("/roles/members/assign", { userId, roleId });
  },

  revokeMember: async (userId: string, roleId: string): Promise<void> => {
    await api.delete(`/roles/revoke-member/${userId}/${roleId}`);
  },
};
