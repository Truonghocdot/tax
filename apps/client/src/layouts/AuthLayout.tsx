import { Outlet } from "react-router-dom";
import AuthBottomNav from "@/components/AuthBottomNav";
import taxEmblem from "@/assets/source/source-thuedinetu.png";
import backgroundImage from "@/assets/source/source-background.png";
import "@/styles/legacy-clone.css";

const AuthLayout = () => (
  <div
    className="legacy-viewport legacy-auth-viewport"
    style={{
      backgroundImage: `linear-gradient(rgb(0 0 0 / 40%), rgb(0 0 0 / 40%)), url(${backgroundImage})`,
    }}
  >
    <header className="legacy-auth-logo">
      <img src={taxEmblem} alt="Thuế điện tử" />
    </header>
    <main className="legacy-auth-content">
      <Outlet />
    </main>
    <AuthBottomNav />
  </div>
);

export default AuthLayout;
