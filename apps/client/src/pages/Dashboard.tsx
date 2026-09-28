import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Building2,
  Check,
  ClipboardList,
  Compass,
  CreditCard,
  FileCheck2,
  FilePlus2,
  FileText,
  Fingerprint,
  Settings,
  Headphones,
  Link2,
  LockKeyhole,
  Menu,
  ScanSearch,
  Shield,
  Smartphone,
  UserCheck,
  UserRound,
  UsersRound,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { authApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import MenuSidebar from "@/components/MenuSidebar";
import "@/styles/legacy-clone.css";

interface FeatureItem {
  icon: React.ElementType;
  label: string;
  path?: string;
}

const quickActions: FeatureItem[] = [
  { icon: FileText, label: "Cập nhật hồ sơ", path: "/profile" },
  { icon: FileCheck2, label: "Xác thực CCCD", path: "/identification" },
  { icon: UsersRound, label: "Mã định danh", path: "/qr" },
  { icon: Link2, label: "Liên kết tài khoản", path: "/link-account" },
];

const services: FeatureItem[] = [
  { icon: FilePlus2, label: "Đăng ký thuế", path: "/tax-registration" },
  { icon: FileCheck2, label: "Hỗ trợ quyết toán thuế TNCN" },
  { icon: ScanSearch, label: "Tra cứu hồ sơ khai thuế", path: "/tax-lookup" },
  { icon: UsersRound, label: "Nhóm chức năng nộp thuế", path: "/tax-payment" },
  { icon: Building2, label: "Đăng ký tài khoản doanh nghiệp trực tuyến", path: "/link-account" },
  { icon: Bell, label: "Tra cứu thông báo", path: "/notifications" },
  { icon: Smartphone, label: "Tiện ích" },
  { icon: Headphones, label: "Hỗ trợ" },
  { icon: Settings, label: "Thiết lập cá nhân", path: "/profile" },
  { icon: LockKeyhole, label: "Đổi mật khẩu" },
  { icon: Fingerprint, label: "Đăng nhập bằng vân tay" },
  { icon: Compass, label: "Khám phá" },
  { icon: Check, label: "Định danh", path: "/identification" },
  { icon: CreditCard, label: "Giấy tờ" },
  { icon: ClipboardList, label: "Tích hợp thông tin" },
  { icon: UserCheck, label: "Người phụ thuộc" },
  { icon: UserRound, label: "Cá nhân", path: "/profile" },
  { icon: Shield, label: "Bảo hiểm xã hội" },
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
        <button type="button" onClick={() => setMenuOpen(true)} aria-label="Mở menu"><Menu size={25} /></button>
        <img src="/logo.png" alt="Thuế điện tử" />
        <div className="legacy-home-header-actions">
          <button type="button" onClick={() => navigate("/qr")} aria-label="Mã QR"><ScanSearch size={22} /></button>
          <button type="button" onClick={() => navigate("/notifications")} aria-label="Thông báo"><Bell size={22} /></button>
        </div>
      </header>

      <section className="legacy-user-card">
        <div className="legacy-user-avatar"><UserRound size={31} /></div>
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
            const Icon = item.icon;
            return <button type="button" className="legacy-quick-item" key={item.label} onClick={() => openItem(item)}><span className="legacy-feature-icon"><Icon size={21} /></span><span>{item.label}</span></button>;
          })}
        </div>
      </section>

      <section className="legacy-section-card">
        <h2 className="legacy-section-title">Danh sách nhóm dịch vụ</h2>
        <div className="legacy-service-grid">
          {services.map((item) => {
            const Icon = item.icon;
            return <button type="button" className="legacy-service-item" key={item.label} onClick={() => openItem(item)}><span className="legacy-service-icon"><Icon size={21} /></span><span>{item.label}</span></button>;
          })}
        </div>
      </section>

      <MenuSidebar isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </main>
  );
};

export default Dashboard;
