import api from "../lib/api.ts";
import type { DashboardSummary, Overview, CategoryTotal, MonthlyTrend, WeeklyTrend } from "../types/dashboard.ts";
import type { FinancialRecord } from "../types/records.ts";

export const dashboardService = {
  getSummary: async (year?: number): Promise<DashboardSummary> => {
    const params = year ? { year } : {};
    const res = await api.get<DashboardSummary>("/dashboard/summary", { params });
    return res.data;
  },

  getOverview: async (): Promise<Overview> => {
    const res = await api.get<Overview>("/dashboard/overview");
    return res.data;
  },

  getCategoryTotals: async (): Promise<CategoryTotal[]> => {
    const res = await api.get<CategoryTotal[]>("/dashboard/category-totals");
    return res.data;
  },

  getRecentActivity: async (limit = 5): Promise<FinancialRecord[]> => {
    const res = await api.get<FinancialRecord[]>("/dashboard/recent-activity", {
      params: { limit },
    });
    return res.data;
  },

  getMonthlyTrends: async (year?: number): Promise<MonthlyTrend[]> => {
    const params = year ? { year } : {};
    const res = await api.get<MonthlyTrend[]>("/dashboard/monthly-trends", { params });
    return res.data;
  },

  getWeeklyTrends: async (weeks = 12): Promise<WeeklyTrend[]> => {
    const res = await api.get<WeeklyTrend[]>("/dashboard/weekly-trends", {
      params: { weeks },
    });
    return res.data;
  },
};
