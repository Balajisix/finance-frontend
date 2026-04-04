import { useNavigate } from "react-router-dom";
import { useDashboardSummary } from "../hooks/useDashboard.ts";
import { useAuthContext } from "../context/AuthContext.tsx";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const Dashboard = () => {
  const { data, isLoading, isError } = useDashboardSummary();
  const { hasPermission } = useAuthContext();
  const navigate = useNavigate();

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
        <p className="text-sm text-red-500">Failed to load dashboard data.</p>
      </div>
    );
  }

  const { overview, categoryTotals, recentActivity, monthlyTrends } = data;

  const maxMonthly = Math.max(...monthlyTrends.map((m) => Math.max(m.income, m.expense)), 1);

  return (
    <div className="p-4 space-y-6 sm:p-6">
      <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Dashboard</h1>

      {/* Overview cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Income" value={fmt(overview.totalIncome)} sub={`${overview.incomeCount} records`} color="green" />
        <StatCard label="Total Expense" value={fmt(overview.totalExpense)} sub={`${overview.expenseCount} records`} color="red" />
        <StatCard
          label="Net Balance"
          value={fmt(overview.netBalance)}
          sub={overview.netBalance >= 0 ? "Surplus" : "Deficit"}
          color={overview.netBalance >= 0 ? "blue" : "orange"}
        />
        <StatCard
          label="Total Records"
          value={String(overview.incomeCount + overview.expenseCount)}
          sub="All time"
          color="purple"
        />
      </div>

      {/* Analytics CTA */}
      {hasPermission("insights.read") && (
        <button
          onClick={() => navigate("/analytics")}
          className="group flex w-full items-center justify-between rounded-xl border border-blue-100 bg-gradient from-blue-50 to-indigo-50 p-4 text-left transition hover:from-blue-100 hover:to-indigo-100 sm:p-5"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">View Detailed Analytics</p>
              <p className="text-xs text-gray-500">Charts, trends, forecasts &amp; category breakdowns</p>
            </div>
          </div>
          <svg className="h-5 w-5 shrink-0 text-gray-400 transition group-hover:translate-x-1 group-hover:text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </button>
      )}

      {/* Monthly trends bar chart */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
        <h2 className="mb-4 text-base font-semibold text-gray-900">Monthly Trends ({monthlyTrends[0]?.year})</h2>
        <div className="flex items-end gap-1 overflow-x-auto sm:gap-2" style={{ height: 200 }}>
          {monthlyTrends.map((m) => (
            <div key={m.month} className="flex flex-1 flex-col items-center gap-1">
              <div className="flex w-full items-end justify-center gap-0.5" style={{ height: 170 }}>
                <div
                  className="w-2.5 rounded-t bg-green-400"
                  style={{ height: `${(m.income / maxMonthly) * 100}%`, minHeight: m.income > 0 ? 4 : 0 }}
                  title={`Income: ${fmt(m.income)}`}
                />
                <div
                  className="w-2.5 rounded-t bg-red-400"
                  style={{ height: `${(m.expense / maxMonthly) * 100}%`, minHeight: m.expense > 0 ? 4 : 0 }}
                  title={`Expense: ${fmt(m.expense)}`}
                />
              </div>
              <span className="text-[10px] text-gray-500">{MONTHS[m.month - 1]}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-green-400" /> Income</span>
          <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-red-400" /> Expense</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Category totals */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-base font-semibold text-gray-900">By Category</h2>
          {categoryTotals.length === 0 ? (
            <p className="text-sm text-gray-400">No data yet</p>
          ) : (
            <div className="space-y-3">
              {categoryTotals.map((c) => {
                const maxCat = Math.max(...categoryTotals.map((ct) => ct.total), 1);
                return (
                  <div key={`${c.category}-${c.type}`}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700">{c.category}</span>
                      <span className={c.type === "INCOME" ? "text-green-600" : "text-red-600"}>
                        {fmt(c.total)}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={`h-full rounded-full ${c.type === "INCOME" ? "bg-green-400" : "bg-red-400"}`}
                        style={{ width: `${(c.total / maxCat) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent activity */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-base font-semibold text-gray-900">Recent Activity</h2>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-gray-400">No records yet</p>
          ) : (
            <div className="space-y-2">
              {recentActivity.map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{r.category}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(r.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <span className={`text-sm font-semibold ${r.type === "INCOME" ? "text-green-600" : "text-red-600"}`}>
                    {r.type === "INCOME" ? "+" : "-"}{fmt(r.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

type StatCardProps = {
  label: string;
  value: string;
  sub: string;
  color: "green" | "red" | "blue" | "orange" | "purple";
};

const colorMap: Record<StatCardProps["color"], string> = {
  green: "bg-green-50 text-green-700",
  red: "bg-red-50 text-red-700",
  blue: "bg-blue-50 text-blue-700",
  orange: "bg-orange-50 text-orange-700",
  purple: "bg-purple-50 text-purple-700",
};

const StatCard = ({ label, value, sub, color }: StatCardProps) => (
  <div className="rounded-xl border border-gray-200 bg-white p-5">
    <p className="text-sm text-gray-500">{label}</p>
    <p className={`mt-1 text-2xl font-bold ${colorMap[color].split(" ")[1]}`}>{value}</p>
    <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${colorMap[color]}`}>
      {sub}
    </span>
  </div>
);

export default Dashboard;
