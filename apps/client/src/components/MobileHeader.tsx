import { ArrowLeft, Bell, Home, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import thueDienTu from "@/assets/thuedinetu.png";

interface MobileHeaderProps {
  title?: string;
  showBack?: boolean;
  showHome?: boolean;
  showMenu?: boolean;
  showBell?: boolean;
  onBack?: () => void;
  onHome?: () => void;
  onMenu?: () => void;
  onBell?: () => void;
  variant?: "primary" | "transparent";
}

const MobileHeader = ({
  title = "Thuế Điện Tử",
  showBack = false,
  showHome = false,
  showMenu = false,
  showBell = true,
  onBack,
  onHome,
  onMenu,
  onBell,
  variant = "primary",
}: MobileHeaderProps) => {
  return (
    <header
      className={cn(
        "relative",
        variant === "primary" && "bg-gradient-primary",
        variant === "transparent" && "bg-transparent",
      )}
    >
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left Actions */}
        <div className="flex items-center gap-2 w-12">
          {showMenu && (
            <button
              onClick={onMenu}
              className="p-2 rounded-lg text-primary-foreground hover:bg-white/10 transition-colors"
              aria-label="Menu"
            >
              <Menu size={32} />
            </button>
          )}
          {showBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-lg text-primary-foreground hover:bg-white/10 transition-colors"
              aria-label="Quay lại"
            >
              <ArrowLeft size={32} />
            </button>
          )}
        </div>

        {/* Center - Logo */}
        <div className="flex flex-col items-center">
          <img src={thueDienTu} className="h-[5rem] w-auto" />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1 w-12 justify-end">
          {showBell && (
            <button
              onClick={onBell}
              className="p-2 rounded-lg text-primary-foreground hover:bg-white/10 transition-colors"
              aria-label="Thông báo"
            >
              <Bell size={32} />
            </button>
          )}
          {showHome && (
            <button
              onClick={onHome}
              className="p-2 rounded-lg text-primary-foreground hover:bg-white/10 transition-colors"
              aria-label="Trang chủ"
            >
              <Home size={32} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;
