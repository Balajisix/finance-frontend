export type UserStatus = "ACTIVE" | "INACTIVE";

export type UserItem = {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  role: { id: string; slug: string; name: string } | null;
};

export type CreateUserPayload = {
  name: string;
  email: string;
  password: string;
  roleId: string;
  status?: UserStatus;
};
