import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import AppLayout from "./components/AppLayout.tsx";
import Login from "./pages/Login.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Records from "./pages/Records.tsx";
import Users from "./pages/Users.tsx";
import Roles from "./pages/Roles.tsx";
import Analytics from "./pages/Analytics.tsx";
import Unauthorized from "./pages/Unauthorized.tsx";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Authenticated shell with sidebar */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route element={<ProtectedRoute permission="dashboard.read" />}>
                <Route path="/dashboard" element={<Dashboard />} />
              </Route>

              <Route element={<ProtectedRoute permission="records.read" />}>
                <Route path="/records" element={<Records />} />
              </Route>

              <Route element={<ProtectedRoute permission="insights.read" />}>
                <Route path="/analytics" element={<Analytics />} />
              </Route>

              <Route element={<ProtectedRoute permission="users.read" />}>
                <Route path="/users" element={<Users />} />
              </Route>

              <Route element={<ProtectedRoute permission="roles.manage" />}>
                <Route path="/roles" element={<Roles />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
