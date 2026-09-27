import { useEffect, useState } from "react";
import { Activity, ArrowRight, CheckCircle2, RefreshCw, ShieldCheck, Users } from "lucide-react";
import { adminApi } from "../api";
import { getErrorMessage } from "../lib/errors";
import type { View } from "../types";

export default function DashboardPage({ onNavigate }: { onNavigate: (view: View) => void }) {
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    adminApi.stats()
      .then((response) => setStats(response.data.data))
      .catch((requestError) => setError(getErrorMessage(requestError)))
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { key: "total_users", label: "Tổng người dùng", icon: Users, tone: "red" },
    { key: "pending_users", label: "Chờ phê duyệt", icon: Activity, tone: "amber" },
    { key: "active_users", label: "Đang hoạt động", icon: CheckCircle2, tone: "green" },
    { key: "linked_banks", label: "Tài khoản ngân hàng", icon: ShieldCheck, tone: "blue" },
  ];

  return (
    <section className="dashboard-page">
      <div className="page-intro">
        <div>
          <p className="eyebrow dark">BẢNG ĐIỀU KHIỂN</p>
          <h2>Xin chào, quản trị viên</h2>
          <p className="muted">Đây là tình hình vận hành mới nhất của hệ thống.</p>
        </div>
        <span className="last-sync"><RefreshCw size={15} /> Cập nhật trực tiếp</span>
      </div>
      {error && <div className="alert error">{error}</div>}
      <div className="stat-grid">
        {cards.map((card) => {
          const Icon = card.icon;
          return <article className="stat-card" key={card.key}><div className={`stat-icon ${card.tone}`}><Icon size={20} /></div><div><p>{card.label}</p><strong>{loading ? "..." : (stats[card.key] ?? 0).toLocaleString("vi-VN")}</strong></div></article>;
        })}
      </div>
      <div className="dashboard-grid">
        <article className="panel welcome-panel">
          <div className="panel-heading"><div><p className="eyebrow dark">KHÔNG GIAN LÀM VIỆC</p><h3>Quản trị minh bạch, xử lý nhanh</h3></div><ShieldCheck size={30} className="heading-icon" /></div>
          <p className="muted">Sử dụng mục Người dùng để duyệt tài khoản mới, kiểm tra hồ sơ định danh và cấu hình thông tin nhận thanh toán.</p>
          <button className="text-button" onClick={() => onNavigate("users")}>Mở quản lý người dùng <ArrowRight size={16} /></button>
        </article>
        <article className="panel checklist">
          <div className="panel-heading"><h3>Trạng thái dịch vụ</h3><span className="status-pill active"><span /> Bình thường</span></div>
          {["API xác thực", "Kho dữ liệu người dùng", "Kết nối ngân hàng"].map((item) => <div className="check-row" key={item}><CheckCircle2 size={17} /> <span>{item}</span><small>Đang hoạt động</small></div>)}
        </article>
      </div>
    </section>
  );
}
