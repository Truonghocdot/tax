import { useState, type ReactNode } from "react";
import {
  Activity,
  LayoutDashboard,
  LogOut,
  Menu,
  Users,
} from "lucide-react";
import type { AdminUser } from "../api";
import type { View } from "../types";

interface AdminLayoutProps {
  view: View;
  user: AdminUser;
  onNavigate: (view: View) => void;
  onLogout: () => void;
  children: ReactNode;
}

export default function AdminLayout({
  view,
  user,
  onNavigate,
  onLogout,
  children,
}: AdminLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = (nextView: View) => {
    onNavigate(nextView);
    setMobileOpen(false);
  };
  const initials = (user.name || user.username || "A").slice(0, 1).toUpperCase();

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-icon">ET</div>
          <div>
            <strong>Thuế điện tử</strong>
            <span>Quản trị hệ thống</span>
          </div>
        </div>
        <nav>
          <p className="nav-label">TỔNG QUAN</p>
          <button
            className={view === "dashboard" ? "nav-item active" : "nav-item"}
            onClick={() => navigate("dashboard")}
          >
            <LayoutDashboard size={18} /> Tổng quan
          </button>
          <p className="nav-label">VẬN HÀNH</p>
          <button
            className={view === "users" ? "nav-item active" : "nav-item"}
            onClick={() => navigate("users")}
          >
            <Users size={18} /> Người dùng
          </button>
        </nav>
        <div className="sidebar-bottom">
          <div className="admin-identity">
            <div className="avatar">{initials}</div>
            <div>
              <strong>{user.name || user.username}</strong>
              <span>Quản trị viên</span>
            </div>
          </div>
          <button className="logout-button" onClick={onLogout}>
            <LogOut size={17} /> Đăng xuất
          </button>
        </div>
      </aside>

      <div className="main-column">
        <header className="topbar">
          <button
            className="mobile-menu"
            onClick={() => setMobileOpen((current) => !current)}
            aria-label="Mở menu"
          >
            <Menu size={21} />
          </button>
          <div>
            <p className="topbar-kicker">CỔNG QUẢN TRỊ</p>
            <h1>{view === "dashboard" ? "Tổng quan hệ thống" : "Quản lý người dùng"}</h1>
          </div>
          <div className="topbar-right">
            <span className="live-dot">
              <Activity size={15} /> Hệ thống hoạt động
            </span>
            <div className="avatar small">{initials}</div>
          </div>
        </header>
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}
