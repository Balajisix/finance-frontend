import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "../services/dashboardService.ts";

export const DASHBOARD_KEYS = {
  all: ["dashboard"] as const,
  summary: (year?: number) => [...DASHBOARD_KEYS.all, "summary", year] as const,
  overview: () => [...DASHBOARD_KEYS.all, "overview"] as const,
  categoryTotals: () => [...DASHBOARD_KEYS.all, "categoryTotals"] as const,
  recentActivity: (limit: number) => [...DASHBOARD_KEYS.all, "recent", limit] as const,
  monthlyTrends: (year?: number) => [...DASHBOARD_KEYS.all, "monthly", year] as const,
  weeklyTrends: (weeks: number) => [...DASHBOARD_KEYS.all, "weekly", weeks] as const,
};

export const useDashboardSummary = (year?: number) =>
  useQuery({
    queryKey: DASHBOARD_KEYS.summary(year),
    queryFn: () => dashboardService.getSummary(year),
    staleTime: 60_000,
  });

export const useOverview = () =>
  useQuery({
    queryKey: DASHBOARD_KEYS.overview(),
    queryFn: dashboardService.getOverview,
    staleTime: 60_000,
  });

export const useCategoryTotals = () =>
  useQuery({
    queryKey: DASHBOARD_KEYS.categoryTotals(),
    queryFn: dashboardService.getCategoryTotals,
    staleTime: 60_000,
  });

export const useRecentActivity = (limit = 10) =>
  useQuery({
    queryKey: DASHBOARD_KEYS.recentActivity(limit),
    queryFn: () => dashboardService.getRecentActivity(limit),
    staleTime: 30_000,
  });

export const useMonthlyTrends = (year?: number) =>
  useQuery({
    queryKey: DASHBOARD_KEYS.monthlyTrends(year),
    queryFn: () => dashboardService.getMonthlyTrends(year),
    staleTime: 60_000,
  });

export const useWeeklyTrends = (weeks = 12) =>
  useQuery({
    queryKey: DASHBOARD_KEYS.weeklyTrends(weeks),
    queryFn: () => dashboardService.getWeeklyTrends(weeks),
    staleTime: 60_000,
  });
