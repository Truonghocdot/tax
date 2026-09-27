import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { adminApi, type AdminUser } from "./api";
import AdminLayout from "./layouts/AdminLayout";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import UsersPage from "./pages/UsersPage";
import type { View } from "./types";

export default function App() {
  const [authenticated, setAuthenticated] = useState(Boolean(localStorage.getItem("admin_token")));
  const [user, setUser] = useState<AdminUser | null>(null);
  const [authChecking, setAuthChecking] = useState(Boolean(localStorage.getItem("admin_token")));

  useEffect(() => {
    if (!authenticated) {
      setUser(null);
      setAuthChecking(false);
      return;
    }

    setAuthChecking(true);
    adminApi.me()
      .then((response) => setUser(response.data.data))
      .catch(() => {
        localStorage.removeItem("admin_token");
        setAuthenticated(false);
        setUser(null);
      })
      .finally(() => {
        setAuthChecking(false);
      });
  }, [authenticated]);

  return <BrowserRouter>
    {!authenticated ? <LoginPage onLogin={(loggedInUser) => { setUser(loggedInUser); setAuthenticated(true); }} /> : authChecking && !user ? <SessionLoading /> : user ? <ProtectedAdmin user={user} onLogout={() => { localStorage.removeItem("admin_token"); setUser(null); setAuthenticated(false); }} /> : <SessionLoading />}
  </BrowserRouter>;
}

function SessionLoading() {
  return <main className="session-loading"><div className="loading-spinner" /><p>Đang khôi phục phiên quản trị...</p></main>;
}

function ProtectedAdmin({ user, onLogout }: { user: AdminUser; onLogout: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const view: View = location.pathname.startsWith("/users") ? "users" : "dashboard";
  const goToView = (nextView: View) => navigate(nextView === "users" ? "/users" : "/");

  return <AdminLayout view={view} user={user} onNavigate={goToView} onLogout={onLogout}>
    <Routes>
      <Route path="/" element={<DashboardPage onNavigate={goToView} />} />
      <Route path="/users" element={<UsersPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </AdminLayout>;
}
