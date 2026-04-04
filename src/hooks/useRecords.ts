import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { recordsService } from "../services/recordsService.ts";
import type { CreateRecordPayload, RecordFilters, UpdateRecordPayload } from "../types/records.ts";
import { DASHBOARD_KEYS } from "./useDashboard.ts";

export const RECORDS_KEYS = {
  all: ["records"] as const,
  list: (filters: RecordFilters) => [...RECORDS_KEYS.all, "list", filters] as const,
  detail: (id: string) => [...RECORDS_KEYS.all, "detail", id] as const,
};

export const useRecordsList = (filters: RecordFilters = {}) =>
  useQuery({
    queryKey: RECORDS_KEYS.list(filters),
    queryFn: () => recordsService.list(filters),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });

export const useCreateRecord = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRecordPayload) => recordsService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: RECORDS_KEYS.all });
      qc.invalidateQueries({ queryKey: DASHBOARD_KEYS.all });
    },
  });
};

export const useUpdateRecord = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRecordPayload }) =>
      recordsService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: RECORDS_KEYS.all });
      qc.invalidateQueries({ queryKey: DASHBOARD_KEYS.all });
    },
  });
};

export const useDeleteRecord = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => recordsService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: RECORDS_KEYS.all });
      qc.invalidateQueries({ queryKey: DASHBOARD_KEYS.all });
    },
  });
};
