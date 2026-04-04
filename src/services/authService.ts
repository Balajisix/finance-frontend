import api from "../lib/api.ts";
import type { LoginRequest, LoginResponse, MeResponse } from "../types/auth.ts";

export const authService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const res = await api.post<LoginResponse>("/auth/login", data);
    return res.data;
  },

  logout: async (): Promise<void> => {
    await api.post("/auth/logout");
  },

  me: async (): Promise<MeResponse> => {
    const res = await api.get<MeResponse>("/auth/me");
    return res.data;
  },

  refresh: async (): Promise<void> => {
    await api.post("/auth/refresh");
  },
};
