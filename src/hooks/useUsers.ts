import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usersService } from "../services/usersService.ts";
import type { CreateUserPayload } from "../types/users.ts";

export const USERS_KEYS = {
  all: ["users"] as const,
  list: () => [...USERS_KEYS.all, "list"] as const,
};

export const useUsersList = () =>
  useQuery({
    queryKey: USERS_KEYS.list(),
    queryFn: usersService.list,
    staleTime: 30_000,
  });

export const useCreateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserPayload) => usersService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: USERS_KEYS.all });
    },
  });
};

export const useDeleteUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: USERS_KEYS.all });
    },
  });
};