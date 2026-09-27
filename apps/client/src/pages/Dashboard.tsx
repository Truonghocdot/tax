import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  User,
  FileEdit,
  Search,
  Link as LinkIcon,
  FileText,
  Building2,
  Bell,
  Layers,
  Fingerprint,
  Settings,
  Lock,
  Smartphone,
  Compass,
  IdCard,
  FolderOpen,
  ClipboardList,
  ShieldCheck,
  User2,
} from "lucide-react";
import MobileHeader from "@/components/MobileHeader";
import MenuSidebar from "@/components/MenuSidebar";
import trongDong from "@/assets/trongdong.png";
import trongDongImage from "@/assets/trong.png";
import { useQuery } from "@tanstack/react-query";
import { authApi } from "@/lib/api";

interface ServiceItem {
  icon: React.ElementType;
  label: string;
  path?: string;
  color?: string;
}

const quickActions: ServiceItem[] = [
  {
    icon: FileEdit,
    label: "Cập nhật hồ sơ",
    path: "/profile",
    color: "text-primary",
  },
  {
    icon: User2,
    label: "Định danh",
    path: "/identification",
    color: "text-primary",
  },
  {
    icon: Fingerprint,
    label: "Mã định danh",
    path: "/qr",
    color: "text-primary",
  },
  {
    icon: LinkIcon,
    label: "Liên kết tài khoản",
    path: "/link-account",
    color: "text-primary",
  },
];

const serviceGroups: ServiceItem[] = [
  { icon: FileText, label: "Đăng ký thuế", path: "/tax-registration" },
  {
    icon: Building2,
    label: "Hỗ trợ quyết toán thuế TNCN",
    path: "/tax-settlement",
  },
  { icon: Search, label: "Tra cứu hồ sơ khai thuế", path: "/tax-lookup" },
  { icon: Layers, label: "Nhóm chức năng nộp thuế", path: "/tax-payment" },
  {
    icon: IdCard,
    label: "Đăng ký tài khoản doanh nghiệp trực tuyến",
    path: "/business-registration",
  },
  { icon: Bell, label: "Tra cứu thông báo", path: "/notifications" },
  { icon: Compass, label: "Tiện ích", path: "/utilities" },
  { icon: Settings, label: "Hỗ trợ", path: "/support" },
  { icon: User, label: "Thiết lập cá nhân", path: "/profile" },
  { icon: Lock, label: "Đổi mật khẩu", path: "/change-password" },
  { icon: Smartphone, label: "Đăng nhập bằng vân tay", path: "/biometric" },
  { icon: Compass, label: "Khám phá", path: "/explore" },
  { icon: Fingerprint, label: "Định danh", path: "/identification" },
  { icon: FolderOpen, label: "Giấy tờ", path: "/documents" },
  { icon: ClipboardList, label: "Tích hợp thông tin", path: "/integration" },
  { icon: User, label: "Người phụ thuộc", path: "/dependents" },
  { icon: User, label: "Cá nhân", path: "/profile" },
  { icon: ShieldCheck, label: "Bảo hiểm xã hội", path: "/insurance" },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const { data: userData } = useQuery({
    queryKey: ["userProfile"],
    queryFn: () => authApi.getUser().then((res) => res.data),
  });

  const profile = userData?.data || userData;

  return (
    <div className="min-h-screen bg-background pb-6">
      <MobileHeader
        showMenu
        onMenu={() => setMenuOpen(true)}
        onBell={() => navigate("/notifications")}
      />

      <div className="relative">
        <div className="relative z-10 mx-4 mt-4">
          <div className="bg-card rounded-2xl px-2 py-3 shadow-lg flex items-center gap-2 relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage: `url(${trongDong})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            <div className="relative z-10 w-14 h-14 rounded-full bg-transparent flex items-center justify-center border-2 border-red-800">
              <User size={46} className="text-black" />
            </div>
            <div className="relative z-10 flex-1">
              <p className="text-md text-black font-semibold">
                Mã số thuế:{" "}
                <span className="font-semibold text-foreground">
                  {profile?.tax_code || "Chưa có MST"}
                </span>
              </p>
              <p className="text-md  text-black font-semibold">
                Doanh nghiệp:{" "}
                <span className="font-semibold text-foreground">
                  {profile?.business_name ||
                    profile?.name ||
                    "Chưa cập nhật thông tin"}
                </span>
              </p>
              <p className="text-primary text-black font-semibold">
                {profile?.phone}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 mt-6 relative">
        <div className="bg-card rounded-2xl p-4 shadow-lg flex-col items-center gap-4 relative overflow-hidden">
          {/* Background pattern with reduced opacity */}
          <div
            className="absolute inset-0 opacity-70"
            style={{
              backgroundImage: `url(${trongDongImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <h2 className="relative z-10 text-sm font-semibold text-foreground mb-3">
            Chức năng hay dùng
          </h2>
          <div className="relative z-10 grid grid-cols-4 gap-3">
            {quickActions.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  onClick={() => item.path && navigate(item.path)}
                  disabled={item.path == "/tax-lookup"}
                  className="flex flex-col items-center min-h-[80px]"
                >
                  <div className="w-10 h-8 mx-auto rounded-xl bg-primary flex items-center justify-center mb-2 flex-shrink-0">
                    <Icon size={20} className={"text-white"} />
                  </div>
                  <p className="text-xs text-center text-foreground font-medium leading-tight h-10 flex items-start justify-center line-clamp-2 pt-1">
                    {item.label}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Service Groups */}
      <div className="px-4 mt-5">
        {/* Decorative background with emblem */}
        <div className="relative bg-card rounded-2xl p-4 border border-border overflow-hidden">
          {/* Background pattern with reduced opacity */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `url(${trongDongImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <h2 className="relative z-10 text-sm font-semibold text-foreground mb-3">
            Danh sách nhóm dịch vụ
          </h2>
          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
            <div className="w-48 h-48 rounded-full border-8 border-current">
              <img src={trongDongImage} alt="" className="w-full h-full" />
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-3 gap-4">
            {serviceGroups.slice(0, 18).map((item, index) => {
              const Icon = item.icon;
              if (item.path == "/identification") {
                return (
                  <Link
                    key={index}
                    to={item.path}
                    className="flex flex-col items-center gap-2 p-2 bg-card rounded-xl hover:bg-muted/50 transition-colors min-h-[100px]"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon size={18} className="text-primary" />
                    </div>
                    <span className="text-xs text-center text-foreground font-medium leading-tight flex items-center justify-center h-10 line-clamp-2">
                      {item.label}
                    </span>
                  </Link>
                );
              }
              return (
                <button
                  key={index}
                  type="button"
                  className="flex flex-col items-center gap-2 p-2 bg-card rounded-xl hover:bg-muted/50 transition-colors min-h-[100px]"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon size={18} className="text-primary" />
                  </div>
                  <span className="text-xs text-center text-foreground font-medium leading-tight flex items-center justify-center h-10 line-clamp-2">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Menu Sidebar */}
      <MenuSidebar isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
};

export default Dashboard;
