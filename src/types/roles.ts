export type Permission = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
};

export type Role = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  permissions: { permission: Permission }[];
};

export type RoleMember = {
  id: string;
  userId: string;
  roleId: string;
  assignedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
};

export type CreateRolePayload = {
  slug: string;
  name: string;
  description?: string;
};

export type UpdateRolePayload = {
  name?: string;
  description?: string | null;
};
