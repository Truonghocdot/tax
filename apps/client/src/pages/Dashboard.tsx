import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { authApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import MenuSidebar from "@/components/MenuSidebar";
import sourceLogo from "@/assets/source/source-logo.png";
import "@/styles/legacy-clone.css";

interface FeatureItem {
  icon: string;
  label: string;
  path?: string;
}

const quickActions: FeatureItem[] = [
  { icon: "fa-solid fa-pen-to-square", label: "Cập nhật hồ sơ", path: "/profile" },
  { icon: "fa-solid fa-file-invoice", label: "Xác thực CCCD", path: "/identification" },
  { icon: "fa-solid fa-users-rectangle", label: "Mã định danh", path: "/qr" },
  { icon: "fa-solid fa-link", label: "Liên kết tài khoản", path: "/link-account" },
];

const services: FeatureItem[] = [
  { icon: "fa-solid fa-file-circle-plus", label: "Đăng ký thuế", path: "/tax-registration" },
  { icon: "fa-solid fa-file-circle-check", label: "Hỗ trợ quyết toán thuế TNCN" },
  { icon: "fa-solid fa-magnifying-glass", label: "Tra cứu hồ sơ khai thuế", path: "/tax-lookup" },
  { icon: "fa-solid fa-user-group", label: "Nhóm chức năng nộp thuế", path: "/tax-payment" },
  { icon: "fa-solid fa-building-columns", label: "Đăng ký tài khoản doanh nghiệp trực tuyến", path: "/link-account" },
  { icon: "fa-solid fa-bell", label: "Tra cứu thông báo", path: "/notifications" },
  { icon: "fa-solid fa-mobile-retro", label: "Tiện ích" },
  { icon: "fa-solid fa-clipboard-question", label: "Hỗ trợ" },
  { icon: "fa-solid fa-gears", label: "Thiết lập cá nhân", path: "/profile" },
  { icon: "fa-solid fa-lock", label: "Đổi mật khẩu" },
  { icon: "fa-solid fa-fingerprint", label: "Đăng nhập bằng vân tay" },
  { icon: "fa-solid fa-compass", label: "Khám phá" },
  { icon: "fa-solid fa-check", label: "Định danh", path: "/identification" },
  { icon: "fa-solid fa-credit-card", label: "Giấy tờ" },
  { icon: "fa-regular fa-file", label: "Tích hợp thông tin" },
  { icon: "fa-solid fa-user-check", label: "Người phụ thuộc" },
  { icon: "fa-solid fa-user", label: "Cá nhân", path: "/profile" },
  { icon: "fa-solid fa-shield", label: "Bảo hiểm xã hội" },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: userData } = useQuery({
    queryKey: ["userProfile"],
    queryFn: () => authApi.getUser().then((response) => response.data),
  });
  const user = userData?.data || userData;
  const profile = user?.profile || {};
  const displayName = user?.username || user?.phone || "Người dùng";

  const openItem = (item: FeatureItem) => {
    if (item.path) {
      navigate(item.path);
      return;
    }
    toast({ title: "Tính năng đang được hoàn thiện", description: item.label });
  };

  return (
    <main className="legacy-home-page">
      <header className="legacy-home-header">
        <button type="button" onClick={() => setMenuOpen(true)} aria-label="Mở menu"><i className="fa-solid fa-bars" /></button>
        <img src={sourceLogo} alt="Thuế điện tử" />
        <div className="legacy-home-header-actions">
          <button type="button" onClick={() => navigate("/qr")} aria-label="Mã QR"><i className="fa-solid fa-qrcode" /></button>
          <button type="button" onClick={() => navigate("/notifications")} aria-label="Thông báo"><i className="fa-solid fa-bell" /></button>
        </div>
      </header>

      <section className="legacy-user-card">
        <div className="legacy-user-avatar"><i className="fa-solid fa-user" /></div>
        <div className="legacy-user-copy">
          <p>Mã số thuế: <strong>{profile.tax_code || "Chưa có MST"}</strong></p>
          <p>Doanh nghiệp: <strong>{profile.bussiness_name || profile.business_name || "Đang cập nhật dữ liệu..."}</strong></p>
          <p className="legacy-user-name">{displayName}</p>
        </div>
      </section>

      <section className="legacy-section-card">
        <h2 className="legacy-section-title">Chức năng hay dùng</h2>
        <div className="legacy-quick-grid">
          {quickActions.map((item) => {
            return <button type="button" className="legacy-quick-item" key={item.label} onClick={() => openItem(item)}><span className="legacy-feature-icon"><i className={item.icon} /></span><span>{item.label}</span></button>;
          })}
        </div>
      </section>

      <section className="legacy-section-card">
        <h2 className="legacy-section-title">Danh sách nhóm dịch vụ</h2>
        <div className="legacy-service-grid">
          {services.map((item) => {
            return <button type="button" className="legacy-service-item" key={item.label} onClick={() => openItem(item)}><span className="legacy-service-icon"><i className={item.icon} /></span><span>{item.label}</span></button>;
          })}
        </div>
      </section>

      <MenuSidebar isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </main>
  );
};

export default Dashboard;
