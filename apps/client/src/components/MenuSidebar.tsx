import { useState } from "react";
import {
  X,
  FileEdit,
  UserPlus,
  Compass,
  CheckCircle,
  Lock,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import backLogo from "@/assets/backlogo.png";
import ChangePasswordModal from "./ChangePasswordModal";

import { authApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface MenuSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  icon: React.ElementType;
  label: string;
  path?: string;
  action?: () => void;
}

const MenuSidebar = ({ isOpen, onClose }: MenuSidebarProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const menuItems: MenuItem[] = [
    { icon: FileEdit, label: "Định danh", path: "/identification" },
    { icon: UserPlus, label: "Liên kết tài khoản", path: "/link-account" },
    { icon: Compass, label: "Khám phá", path: "/explore" },
    {
      icon: Lock,
      label: "Đổi mật khẩu",
      action: () => setShowPasswordModal(true),
    },
  ];

  const handleItemClick = (item: MenuItem) => {
    if (item.action) {
      item.action();
    } else if (item.path) {
      navigate(item.path);
      onClose();
    }
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      localStorage.removeItem("token");
      navigate("/login");
      onClose();
      toast({
        title: "Đăng xuất thành công",
        className: "bg-green-500 text-white",
      });
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-50 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-72 z-50 transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Header with Logo */}
        <div className="bg-gradient-primary relative overflow-hidden">
          {/* Decorative circle */}
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/5 rounded-full" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-primary-foreground hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>

          {/* Logo */}
          <div className="flex flex-col items-center pt-2">
            <img src={backLogo} alt="Logo" className="w-full h-full" />
          </div>

          {/* User greeting */}
          <div className="bg-primary/80 py-3 text-center">
            <span className="text-primary-foreground font-medium">
              Xin chào
            </span>
          </div>
        </div>

        {/* Menu Items */}
        <div className="bg-card h-full pt-4 px-3">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                onClick={() => handleItemClick(item)}
                className="menu-item w-full text-left hover:bg-muted"
              >
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <Icon size={18} className="text-muted-foreground" />
                </div>
                <span className="text-foreground font-medium">
                  {item.label}
                </span>
              </button>
            );
          })}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="mt-6 w-full py-3 rounded-full bg-yellow-400 text-foreground font-semibold hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2"
          >
            <LogOut size={18} />
            Đăng Xuất
          </button>
        </div>
      </aside>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </>
  );
};

export default MenuSidebar;
