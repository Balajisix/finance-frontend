import api from "../lib/api.ts";
import type { UserItem, CreateUserPayload } from "../types/users.ts";

export const usersService = {
  list: async (): Promise<UserItem[]> => {
    const res = await api.get<UserItem[]>("/users");
    return res.data;
  },

  getById: async (id: string): Promise<UserItem> => {
    const res = await api.get<UserItem>(`/users/${id}`);
    return res.data;
  },

  create: async (data: CreateUserPayload): Promise<UserItem> => {
    const res = await api.post<UserItem>("/users/register", data);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};

