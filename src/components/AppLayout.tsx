import { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext.tsx";
import { useLogout } from "../hooks/useAuth.ts";
import PermissionGate from "./PermissionGate.tsx";
import { LayoutDashboard, WalletCards, ChartColumnIncreasing, Users, ShieldCheck, LogOut } from "lucide-react"
import { Link } from "react-router-dom";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive
      ? "bg-blue-50 text-blue-700"
      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
  }`;

const AppLayout = () => {
  const { user, roles } = useAuthContext();
  const logout = useLogout();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => navigate("/login", { replace: true }),
    });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-gray-200 bg-white transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h1 className="text-lg font-bold text-gray-900"><Link to="/dashboard" className="hover:text-blue-600">FinanceApp</Link></h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 lg:hidden"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          <PermissionGate permission="dashboard.read">
            <NavLink to="/dashboard" className={navLinkClass}>
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </NavLink>
          </PermissionGate>

          <PermissionGate permission="records.read">
            <NavLink to="/records" className={navLinkClass}>
              <WalletCards className="h-4 w-4" />
              Records
            </NavLink>
          </PermissionGate>

          <PermissionGate permission="insights.read">
            <NavLink to="/analytics" className={navLinkClass}>
              <ChartColumnIncreasing className="h-4 w-4" />
              Analytics
            </NavLink>
          </PermissionGate>

          <PermissionGate permission="users.read">
            <NavLink to="/users" className={navLinkClass}>
              <Users className="h-4 w-4" />
              Users
            </NavLink>
          </PermissionGate>

          <PermissionGate permission="roles.manage">
            <NavLink to="/roles" className={navLinkClass}>
              <ShieldCheck className="h-4 w-4" />
              Roles
            </NavLink>
          </PermissionGate>
        </nav>

        {/* User footer */}
        <div className="border-t border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="truncate text-xs text-gray-900 bg-gray-300 rounded-full px-2 py-1">
                {roles.map((r) => r.name).join(", ")}
              </p>
            </div>
            <button
              onClick={handleLogout}
              disabled={logout.isPending}
              title="Logout"
              className="ml-2 shrink-0 rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-red-600 cursor-pointer"
            >
              <LogOut className="h-6 w-6" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile top bar */}
        <header className="flex items-center border-b border-gray-200 bg-white px-4 py-3 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <h1 className="ml-3 text-base font-bold text-gray-900">FinanceApp</h1>
        </header>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
