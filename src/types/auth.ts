export type UserRole = {
  id: string;
  slug: string;
  name: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type MeResponse = {
  user: User;
  roles: UserRole[];
  permissions: string[];
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  user: User;
};
