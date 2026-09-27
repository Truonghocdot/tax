import { useEffect, useState } from "react";
import { adminApi, type AdminUser } from "./api";
import AdminLayout from "./layouts/AdminLayout";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import UsersPage from "./pages/UsersPage";
import type { View } from "./types";

export default function App() {
  const [authenticated, setAuthenticated] = useState(Boolean(localStorage.getItem("admin_token")));
  const [user, setUser] = useState<AdminUser | null>(null);
  const [view, setView] = useState<View>(() => (window.location.hash === "#users" ? "users" : "dashboard"));

  useEffect(() => {
    if (!authenticated) {
      setUser(null);
      return;
    }

    adminApi.me()
      .then((response) => setUser(response.data.data))
      .catch(() => {
        localStorage.removeItem("admin_token");
        setAuthenticated(false);
      });
  }, [authenticated]);

  useEffect(() => {
    const syncFromHash = () => setView(window.location.hash === "#users" ? "users" : "dashboard");
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  const navigate = (nextView: View) => {
    setView(nextView);
    window.location.hash = nextView;
  };

  if (!authenticated || !user) {
    return <LoginPage onLogin={() => setAuthenticated(true)} />;
  }

  return <AdminLayout view={view} user={user} onNavigate={navigate} onLogout={() => { localStorage.removeItem("admin_token"); setAuthenticated(false); }}>
    {view === "dashboard" ? <DashboardPage onNavigate={navigate} /> : <UsersPage />}
  </AdminLayout>;
}
