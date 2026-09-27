import { useState, useEffect } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import trongDong from "@/assets/trongdong.png";
import { useQuery } from "@tanstack/react-query";
import { userApi } from "@/lib/api";
import { QRCodeSVG } from "qrcode.react";
import axios from "axios";

const QrPage = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(60 * 5);

  // Fetch QR bank data từ API của bạn
  const { data: qrBankData } = useQuery({
    queryKey: ["qrBank"],
    queryFn: () => userApi.getQrBank().then((res) => res.data),
  });

  // Fetch VietQR payload (text format)
  const { data: vietQrData } = useQuery({
    queryKey: ["vietQr", qrBankData?.data],
    queryFn: async () => {
      if (!qrBankData?.data) return null;

      const payload = {
        accountNo: qrBankData.data.number_account,
        accountName: qrBankData.data.account_name,
        acqId: parseInt(qrBankData.data.bin_bank),
        amount: parseFloat(qrBankData.data.amount),
        addInfo: qrBankData.data.description,
        format: "text",
        template: "compact2",
      };

      const res = await axios.post(
        "https://api.vietqr.io/v2/generate",
        payload,
        {
          headers: {
            "x-client-id": import.meta.env.VITE_VIETQR_CLIENT_ID || "",
            "x-api-key": import.meta.env.VITE_VIETQR_API_KEY || "",
            "Content-Type": "application/json",
          },
        },
      );

      return res.data;
    },
    enabled: !!qrBankData?.data,
    staleTime: 60000,
  });

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 120));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Download QR as PNG
  const handleDownloadQr = () => {
    const svg = document.querySelector("#qr-code-svg") as SVGElement;
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const pngFile = canvas.toDataURL("image/png", 1.0);
      const downloadLink = document.createElement("a");
      downloadLink.download = `vietqr-${Date.now()}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src =
      "data:image/svg+xml;base64," +
      btoa(unescape(encodeURIComponent(svgData)));
  };

  // Lấy QR data string từ VietQR response
  const qrDataString = vietQrData?.data?.qrCode || "";

  return (
    <div className="min-h-screen bg-[#8B0000] flex flex-col relative overflow-hidden">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: `url(${trongDong})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "contain",
        }}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center pt-4 px-6 relative z-10 text-white">
        {/* Header */}
        <h2 className="text-xl font-bold text-yellow-400 mb-8 tracking-wide text-center">
          Mã định danh điện tử
        </h2>

        {/* QR Card */}
        <div className="bg-[#FFFBE6] w-full max-w-sm rounded-[2rem] p-8 flex flex-col items-center shadow-xl">
          {/* QR Code */}
          <div className="bg-white p-6 rounded-xl shadow-inner mb-4 w-full flex flex-col items-center">
            {qrBankData?.data && (
              <div className="w-full text-black mb-4 text-center px-2">
                <p className="text-sm font-bold">
                  MST: {qrBankData.data.tax_id}
                </p>
                <p className="text-sm font-bold leading-tight">
                  {qrBankData.data.company_name}
                </p>
              </div>
            )}

            {qrDataString ? (
              <QRCodeSVG
                id="qr-code-svg"
                value={qrDataString}
                size={220}
                level="H"
                includeMargin={false}
              />
            ) : (
              <div className="w-52 h-52 flex items-center justify-center text-gray-500">
                <p className="text-sm text-center">Đang tải...</p>
              </div>
            )}
          </div>

          {/* Timer */}
          <p className="text-red-600 font-semibold text-sm animate-pulse">
            Hiệu lực của QR code còn {formatTime(timeLeft)}
          </p>
        </div>

        {/* Download Button */}
        <div className="w-full max-w-sm mb-8 mt-6">
          <Button
            className="w-full bg-[#FFD700] hover:bg-[#FFC700] text-red-900 font-bold text-lg h-14 rounded-full shadow-lg flex items-center justify-center gap-2"
            onClick={handleDownloadQr}
            disabled={!qrDataString}
          >
            <Download className="w-5 h-5" />
            Tải về máy
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QrPage;
