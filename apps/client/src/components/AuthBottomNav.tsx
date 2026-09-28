import { Headphones, QrCode, Share2, Wrench } from "lucide-react";

const navItems = [
  { icon: QrCode, label: "QR tem" },
  { icon: Wrench, label: "Tiện ích" },
  { icon: Headphones, label: "Hỗ trợ" },
  { icon: Share2, label: "Chia sẻ" },
];

const AuthBottomNav = () => (
  <nav className="legacy-auth-bottom" aria-label="Tiện ích nhanh">
    {navItems.map(({ icon: Icon, label }) => (
      <button type="button" key={label} className="legacy-auth-bottom-item">
        <Icon size={29} strokeWidth={2.2} />
        <span>{label}</span>
      </button>
    ))}
  </nav>
);

export default AuthBottomNav;
