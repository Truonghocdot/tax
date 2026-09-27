import { QrCode, Wrench, Headphones, Share2 } from "lucide-react";

interface NavItem {
  icon: React.ElementType;
  label: string;
  action?: () => void;
}

const navItems: NavItem[] = [
  { icon: QrCode, label: "QR tem" },
  { icon: Wrench, label: "Tiện ích" },
  { icon: Headphones, label: "Hỗ trợ" },
  { icon: Share2, label: "Chia sẻ" },
];

const AuthBottomNav = () => {
  return (
    <nav className="relative bottom-0 pb-4 left-0 right-0 z-30 max-w-md mx-auto">
      <div className="flex justify-around items-center py-3 px-4">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={index}
              className="flex flex-col items-center gap-1 p-2 text-white hover:text-red-500 hover:scale-125"
            >
              <Icon size={38} />
              <span className="text-base font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default AuthBottomNav;
