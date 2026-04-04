import api from "../lib/api.ts";
import type {
  FinancialRecord,
  CreateRecordPayload,
  UpdateRecordPayload,
  RecordFilters,
  PaginatedResponse,
} from "../types/records.ts";

export const recordsService = {
  list: async (filters: RecordFilters = {}): Promise<PaginatedResponse> => {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== undefined && v !== "")
    );
    const res = await api.get<PaginatedResponse>("/financial-records/list", { params });
    return res.data;
  },

  getById: async (id: string): Promise<FinancialRecord> => {
    const res = await api.get<FinancialRecord>(`/financial-records/get-by-id/${id}`);
    return res.data;
  },

  create: async (data: CreateRecordPayload): Promise<FinancialRecord> => {
    const res = await api.post<FinancialRecord>("/financial-records/create", data);
    return res.data;
  },

  update: async (id: string, data: UpdateRecordPayload): Promise<FinancialRecord> => {
    const res = await api.patch<FinancialRecord>(`/financial-records/update/${id}`, data);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/financial-records/delete/${id}`);
  },
};
