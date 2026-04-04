export type FinancialRecordType = "INCOME" | "EXPENSE";

export type FinancialRecord = {
  id: string;
  amount: number;
  type: FinancialRecordType;
  category: string;
  date: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateRecordPayload = {
  amount: number;
  type: FinancialRecordType;
  category: string;
  date: string;
  notes?: string;
};

export type UpdateRecordPayload = Partial<CreateRecordPayload>;

export type RecordFilters = {
  type?: FinancialRecordType;
  category?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
};

export type PaginatedResponse = {
  data: FinancialRecord[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};
