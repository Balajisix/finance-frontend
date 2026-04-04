export type Overview = {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  incomeCount: number;
  expenseCount: number;
};

export type CategoryTotal = {
  category: string;
  type: "INCOME" | "EXPENSE";
  total: number;
  count: number;
};

export type MonthlyTrend = {
  month: number;
  year: number;
  income: number;
  expense: number;
  net: number;
};

export type WeeklyTrend = {
  weekStart: string;
  income: number;
  expense: number;
  net: number;
};

export type DashboardSummary = {
  overview: Overview;
  categoryTotals: CategoryTotal[];
  recentActivity: import("./records.ts").FinancialRecord[];
  monthlyTrends: MonthlyTrend[];
  weeklyTrends: WeeklyTrend[];
};
