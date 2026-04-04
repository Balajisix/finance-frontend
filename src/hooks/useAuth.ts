import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "../services/authService.ts";
import type { LoginRequest } from "../types/auth.ts";

export const AUTH_QUERY_KEY = ["auth", "me"] as const;

export const useMe = () => {
  return useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: authService.me,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      queryClient.setQueryData(AUTH_QUERY_KEY, null);
      queryClient.removeQueries({ queryKey: AUTH_QUERY_KEY });
    },
  });
};
