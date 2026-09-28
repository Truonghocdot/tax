const navItems = [
  { icon: "fa-solid fa-qrcode", label: "QR tem" },
  { icon: "fa-solid fa-tools", label: "Tiện ích" },
  { icon: "fa-solid fa-headset", label: "Hỗ trợ" },
  { icon: "fa-solid fa-share-alt", label: "Chia sẻ" },
];

const AuthBottomNav = () => (
  <nav className="legacy-auth-bottom" aria-label="Tiện ích nhanh">
    {navItems.map(({ icon, label }) => (
      <button type="button" key={label} className="legacy-auth-bottom-item">
        <i className={icon} aria-hidden="true" />
        <span>{label}</span>
      </button>
    ))}
  </nav>
);

export default AuthBottomNav;
