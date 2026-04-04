import { useMemo, useState } from "react";
import { useDashboardSummary } from "../hooks/useDashboard.ts";
import type { MonthlyTrend, CategoryTotal } from "../types/dashboard.ts";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#6366f1", "#14b8a6"];

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const tooltipFmt = (v: number | string | readonly (string | number)[] | undefined) => fmt(Number(v ?? 0));

const fmtShort = (n: number) => {
  if (Math.abs(n) >= 1_00_00_000) return `${(n / 1_00_00_000).toFixed(1)}Cr`;
  if (Math.abs(n) >= 1_00_000) return `${(n / 1_00_000).toFixed(1)}L`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
};

/* ───── Simple linear regression for forecast ───── */
const linearForecast = (data: number[], periods: number): number[] => {
  const n = data.length;
  if (n < 2) return Array(periods).fill(data[0] ?? 0) as number[];
  const xMean = (n - 1) / 2;
  const yMean = data.reduce((a, b) => a + b, 0) / n;
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) {
    num += (i - xMean) * (data[i]! - yMean);
    den += (i - xMean) ** 2;
  }
  const slope = den === 0 ? 0 : num / den;
  const intercept = yMean - slope * xMean;
  return Array.from({ length: periods }, (_, i) => Math.max(0, Math.round(intercept + slope * (n + i))));
};

const Analytics = () => {
  const currentYear = new Date().getUTCFullYear();
  const [year, setYear] = useState(currentYear);
  const { data, isLoading, isError } = useDashboardSummary(year);

  const isCurrent = year === currentYear;

  const hasData = useMemo(() => {
    if (!data) return false;
    return data.monthlyTrends.some((m) => m.income > 0 || m.expense > 0);
  }, [data]);

  const yearOverview = useMemo(() => {
    if (!data) return { totalIncome: 0, totalExpense: 0, netBalance: 0, count: 0 };
    const totalIncome = data.monthlyTrends.reduce((s, m) => s + m.income, 0);
    const totalExpense = data.monthlyTrends.reduce((s, m) => s + m.expense, 0);
    return { totalIncome, totalExpense, netBalance: totalIncome - totalExpense, count: data.monthlyTrends.filter((m) => m.income > 0 || m.expense > 0).length };
  }, [data]);

  const monthlyChartData = useMemo(() => {
    if (!data || !hasData) return [];
    const { monthlyTrends } = data;
    const currentMonth = isCurrent ? new Date().getUTCMonth() + 1 : 12;
    const actuals = monthlyTrends.filter((m) => m.month <= currentMonth && (m.income > 0 || m.expense > 0));

    const showForecast = isCurrent && actuals.length >= 2;
    const forecastIncome = showForecast ? linearForecast(actuals.map((m) => m.income), 12 - currentMonth) : [];
    const forecastExpense = showForecast ? linearForecast(actuals.map((m) => m.expense), 12 - currentMonth) : [];

    return monthlyTrends.map((m, i) => {
      const isActual = m.month <= currentMonth;
      const fi = i - currentMonth;
      return {
        name: MONTHS[m.month - 1],
        income: isActual ? m.income : undefined,
        expense: isActual ? m.expense : undefined,
        net: isActual ? m.net : undefined,
        forecastIncome: showForecast && !isActual ? forecastIncome[fi] : (showForecast && m.month === currentMonth ? m.income : undefined),
        forecastExpense: showForecast && !isActual ? forecastExpense[fi] : (showForecast && m.month === currentMonth ? m.expense : undefined),
        forecastNet: showForecast && !isActual
          ? (forecastIncome[fi] ?? 0) - (forecastExpense[fi] ?? 0)
          : (showForecast && m.month === currentMonth ? m.net : undefined),
      };
    });
  }, [data, hasData, isCurrent]);

  const weeklyChartData = useMemo(() => {
    if (!data) return [];
    return data.weeklyTrends
      .filter((w) => w.income > 0 || w.expense > 0)
      .map((w) => ({
        name: new Date(w.weekStart).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        income: w.income,
        expense: w.expense,
        net: w.net,
      }));
  }, [data]);

  const { expensePie, incomePie } = useMemo(() => {
    if (!data) return { expensePie: [], incomePie: [] };
    const group = (type: "INCOME" | "EXPENSE") =>
      data.categoryTotals
        .filter((c) => c.type === type)
        .sort((a, b) => b.total - a.total);
    return { expensePie: group("EXPENSE"), incomePie: group("INCOME") };
  }, [data]);

  const savingsRate = useMemo(() => {
    if (yearOverview.totalIncome === 0) return 0;
    return ((yearOverview.totalIncome - yearOverview.totalExpense) / yearOverview.totalIncome) * 100;
  }, [yearOverview]);

  const monthOverMonth = useMemo(() => {
    if (!data || data.monthlyTrends.length < 2) return { income: 0, expense: 0 };
    const active = data.monthlyTrends.filter((m) => m.income > 0 || m.expense > 0);
    if (active.length < 2) return { income: 0, expense: 0 };
    const last = active[active.length - 1]!;
    const prev = active[active.length - 2]!;
    return {
      income: prev.income === 0 ? 0 : ((last.income - prev.income) / prev.income) * 100,
      expense: prev.expense === 0 ? 0 : ((last.expense - prev.expense) / prev.expense) * 100,
    };
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-red-500">Failed to load analytics.</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Analytics</h1>
          <p className="text-sm text-gray-500">Financial insights and forecasting</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Year</label>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-blue-500"
          >
            {Array.from({ length: currentYear - 2019 }, (_, i) => currentYear - i).map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {!hasData ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-20">
          <svg className="h-16 w-16 text-gray-200" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
          </svg>
          <p className="mt-4 text-base font-medium text-gray-500">No records for {year}</p>
          <p className="mt-1 text-sm text-gray-400">Select a different year or add some records first.</p>
        </div>
      ) : (
      <>

      {/* KPI cards — scoped to selected year */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <KpiCard label={`Income (${year})`} value={fmt(yearOverview.totalIncome)} color="text-green-600" />
        <KpiCard label={`Expense (${year})`} value={fmt(yearOverview.totalExpense)} color="text-red-600" />
        <KpiCard label="Net Balance" value={fmt(yearOverview.netBalance)} color={yearOverview.netBalance >= 0 ? "text-blue-600" : "text-orange-600"} />
        <KpiCard
          label="Savings Rate"
          value={`${savingsRate.toFixed(1)}%`}
          color={savingsRate >= 20 ? "text-green-600" : savingsRate >= 0 ? "text-yellow-600" : "text-red-600"}
        />
        <KpiCard
          label="Expense Trend"
          value={`${monthOverMonth.expense >= 0 ? "+" : ""}${monthOverMonth.expense.toFixed(1)}%`}
          color={monthOverMonth.expense <= 0 ? "text-green-600" : "text-red-600"}
          sub="vs prev month"
        />
      </div>

      {/* Monthly Income vs Expense — with forecast */}
      <ChartCard title="Monthly Income vs Expense" subtitle={isCurrent && monthlyChartData.some((d) => d.forecastIncome !== undefined) ? "Dashed lines = forecast (linear projection)" : undefined}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={fmtShort} tick={{ fontSize: 12 }} />
            <Tooltip formatter={tooltipFmt} />
            <Legend />
            <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} name="Income" connectNulls={false} />
            <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} name="Expense" connectNulls={false} />
            <Line type="monotone" dataKey="net" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} name="Net" connectNulls={false} />
            {isCurrent && monthlyChartData.some((d) => d.forecastIncome !== undefined) && (
              <>
                <Line type="monotone" dataKey="forecastIncome" stroke="#10b981" strokeWidth={2} strokeDasharray="6 4" dot={{ r: 2 }} name="Income (forecast)" connectNulls />
                <Line type="monotone" dataKey="forecastExpense" stroke="#ef4444" strokeWidth={2} strokeDasharray="6 4" dot={{ r: 2 }} name="Expense (forecast)" connectNulls />
                <Line type="monotone" dataKey="forecastNet" stroke="#3b82f6" strokeWidth={2} strokeDasharray="6 4" dot={{ r: 2 }} name="Net (forecast)" connectNulls />
              </>
            )}
            <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="2 2" />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Weekly Trends — stacked area (only for current year) */}
      {isCurrent && weeklyChartData.length > 0 && (
      <ChartCard title="Weekly Cash Flow (Last 12 Weeks)">
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={weeklyChartData}>
            <defs>
              <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={fmtShort} tick={{ fontSize: 12 }} />
            <Tooltip formatter={tooltipFmt} />
            <Legend />
            <Area type="monotone" dataKey="income" stroke="#10b981" fill="url(#gIncome)" strokeWidth={2} name="Income" />
            <Area type="monotone" dataKey="expense" stroke="#ef4444" fill="url(#gExpense)" strokeWidth={2} name="Expense" />
            <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="2 2" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Monthly Net Balance — bar chart */}
        <ChartCard title="Monthly Net Balance">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={fmtShort} tick={{ fontSize: 12 }} />
              <Tooltip formatter={tooltipFmt} />
              <ReferenceLine y={0} stroke="#94a3b8" />
              <Bar dataKey="net" name="Net Balance" radius={[4, 4, 0, 0]}>
                {monthlyChartData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={(entry.net ?? entry.forecastNet ?? 0) >= 0 ? "#10b981" : "#ef4444"}
                    opacity={entry.net !== undefined ? 1 : 0.5}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Income vs Expense comparison bar */}
        <ChartCard title="Monthly Comparison">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={fmtShort} tick={{ fontSize: 12 }} />
              <Tooltip formatter={tooltipFmt} />
              <Legend />
              <Bar dataKey="income" fill="#10b981" name="Income" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" fill="#ef4444" name="Expense" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Category breakdown — pie charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PieCard title="Expense Breakdown" data={expensePie} />
        <PieCard title="Income Sources" data={incomePie} />
      </div>

      {/* Cumulative savings chart */}
      <CumulativeChart monthlyTrends={data.monthlyTrends} year={year} currentYear={currentYear} />

      </>
      )}
    </div>
  );
};

/* ───── Reusable sub-components ───── */

const KpiCard = ({ label, value, color, sub }: { label: string; value: string; color: string; sub?: string }) => (
  <div className="rounded-xl border border-gray-200 bg-white p-4">
    <p className="text-xs font-medium text-gray-500">{label}</p>
    <p className={`mt-1 text-lg font-bold sm:text-xl ${color}`}>{value}</p>
    {sub && <p className="mt-0.5 text-[10px] text-gray-400">{sub}</p>}
  </div>
);

const ChartCard = ({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) => (
  <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
    <div className="mb-4">
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
    </div>
    {children}
  </div>
);

const PieCard = ({ title, data }: { title: string; data: CategoryTotal[] }) => {
  const total = data.reduce((s, c) => s + c.total, 0);
  return (
    <ChartCard title={title}>
      {data.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">No data</p>
      ) : (
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <div className="h-52 w-52 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="total"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={80}
                  paddingAngle={2}
                  stroke="none"
                >
                  {data.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={tooltipFmt} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-1.5">
            {data.map((c, i) => (
              <div key={c.category} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-gray-700">{c.category}</span>
                </span>
                <span className="font-medium text-gray-900">
                  {fmt(c.total)} <span className="text-xs text-gray-400">({((c.total / total) * 100).toFixed(1)}%)</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </ChartCard>
  );
};

const CumulativeChart = ({ monthlyTrends, year, currentYear }: { monthlyTrends: MonthlyTrend[]; year: number; currentYear: number }) => {
  const isCurrent = year === currentYear;
  const hasMonthlyData = monthlyTrends.some((m) => m.income > 0 || m.expense > 0);

  const chartData = useMemo(() => {
    if (!hasMonthlyData) return [];
    let cumulative = 0;
    const currentMonth = isCurrent ? new Date().getUTCMonth() + 1 : 12;
    const actuals = monthlyTrends
      .filter((m) => m.month <= currentMonth && (m.income > 0 || m.expense > 0))
      .map((m) => m.net);
    const showForecast = isCurrent && actuals.length >= 2;
    const forecasted = showForecast ? linearForecast(actuals, 12 - currentMonth) : [];

    return monthlyTrends.map((m, i) => {
      const isActual = m.month <= currentMonth;
      if (isActual) {
        cumulative += m.net;
        return { name: MONTHS[m.month - 1], savings: cumulative, forecastSavings: showForecast && m.month === currentMonth ? cumulative : undefined };
      }
      if (!showForecast) return { name: MONTHS[m.month - 1], savings: undefined, forecastSavings: undefined };
      const fi = i - currentMonth;
      const fNet = (forecasted[fi] ?? 0);
      cumulative += fNet;
      return { name: MONTHS[m.month - 1], savings: undefined, forecastSavings: cumulative };
    });
  }, [monthlyTrends, isCurrent, hasMonthlyData]);

  if (!hasMonthlyData) return null;

  const showForecastLegend = isCurrent && chartData.some((d) => d.forecastSavings !== undefined);

  return (
    <ChartCard title="Cumulative Savings Trajectory" subtitle={showForecastLegend ? "Projected savings based on current trend" : undefined}>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="gSavings" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gForecast" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tickFormatter={fmtShort} tick={{ fontSize: 12 }} />
          <Tooltip formatter={tooltipFmt} />
          <Legend />
          <Area type="monotone" dataKey="savings" stroke="#3b82f6" fill="url(#gSavings)" strokeWidth={2} name="Actual Savings" connectNulls={false} />
          <Area type="monotone" dataKey="forecastSavings" stroke="#8b5cf6" fill="url(#gForecast)" strokeWidth={2} strokeDasharray="6 4" name="Projected" connectNulls />
          <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="2 2" />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default Analytics;
