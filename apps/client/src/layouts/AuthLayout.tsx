import { Outlet } from "react-router-dom";
import AuthBottomNav from "@/components/AuthBottomNav";
import taxEmblem from "@/assets/thuedinetu.png";
import backgroundImage from "@/assets/background.png";

const AuthLayout = () => {
  return (
    <div
      className="mobile-container min-h-screen relative overflow-hidden"
      style={{ fontFamily: "Arial" }}
    >
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat pointer-events-none"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          opacity: 2,
        }}
      ></div>

      {/* Logo Header */}
      <div className="relative z-10 flex flex-col items-center pt-10 pb-6">
        <div className="w-42 h-42 rounded-full flex items-center justify-center">
          <img src={taxEmblem} alt="Thuế Điện Tử" className="w-36 h-36" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full pb-24">
        <Outlet />
      </div>

      {/* Bottom Navigation */}
      <AuthBottomNav />
    </div>
  );
};

export default AuthLayout;
