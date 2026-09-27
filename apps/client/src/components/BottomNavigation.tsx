import { useLocation, useNavigate } from "react-router-dom";
import { Home, FileText, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { icon: Home, label: "Trang chủ", path: "/" },
  { icon: FileText, label: "Nộp thuế", path: "/tax-payment" },
  { icon: Bell, label: "Thông báo", path: "/notifications" },
  { icon: User, label: "Cá nhân", path: "/profile" },
];

const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="bottom-nav max-w-md mx-auto">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;

        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={cn(
              "bottom-nav-item flex-1",
              isActive && "active"
            )}
          >
            <Icon size={22} />
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNavigation;
