import { useEffect, useState } from "react";
import { ArrowLeft, Download, RefreshCw, TriangleAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import axios from "axios";
import trongDong from "@/assets/trongdong.png";
import thueDienTu from "@/assets/thuedinetu.png";
import { userApi } from "@/lib/api";
import "./QrPage.css";

interface QrBankData {
  number_account?: string | null;
  account_name?: string | null;
  bin_bank?: string | null;
  amount?: number | string | null;
  description?: string | null;
  tax_id?: string | null;
  company_name?: string | null;
}

const QrPage = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(60 * 5);

  const qrBankQuery = useQuery({
    queryKey: ["qrBank"],
    queryFn: () => userApi.getQrBank().then((response) => response.data),
    retry: 1,
  });
  const qrBank = qrBankQuery.data?.data as QrBankData | null | undefined;
  const hasQrConfiguration = Boolean(qrBank?.bin_bank && qrBank?.number_account);

  const vietQrQuery = useQuery({
    queryKey: ["vietQr", qrBank],
    queryFn: async () => {
      if (!qrBank) return null;
      const response = await axios.post(
        "https://api.vietqr.io/v2/generate",
        {
          accountNo: qrBank.number_account,
          accountName: qrBank.account_name,
          acqId: Number(qrBank.bin_bank),
          amount: Number(qrBank.amount || 0),
          addInfo: qrBank.description,
          format: "text",
          template: "compact2",
        },
        {
          headers: {
            "x-client-id": import.meta.env.VITE_VIETQR_CLIENT_ID || "",
            "x-api-key": import.meta.env.VITE_VIETQR_API_KEY || "",
            "Content-Type": "application/json",
          },
        },
      );
      return response.data;
    },
    enabled: hasQrConfiguration,
    staleTime: 60000,
  });

  useEffect(() => {
    if (!hasQrConfiguration) return;
    const timer = window.setInterval(() => {
      setTimeLeft((previous) => (previous > 0 ? previous - 1 : 120));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [hasQrConfiguration]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainder = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainder.toString().padStart(2, "0")}`;
  };

  const handleDownloadQr = () => {
    const svg = document.querySelector("#qr-code-svg") as SVGElement | null;
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) return;
    const image = new Image();
    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;
      context.drawImage(image, 0, 0);
      const downloadLink = document.createElement("a");
      downloadLink.download = `vietqr-${Date.now()}.png`;
      downloadLink.href = canvas.toDataURL("image/png", 1);
      downloadLink.click();
    };
    image.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}`;
  };

  const renderEmptyState = () => {
    let title = "Admin chưa thiết lập mã QR. Vui lòng liên hệ quản trị viên.";
    if (qrBankQuery.isError) title = "Không thể tải thông tin QR. Vui lòng thử lại.";
    if (qrBankQuery.isLoading) title = "Đang kiểm tra thông tin QR...";

    return (
      <div className="qr-empty-card" aria-live="polite">
        <div className="qr-warning-icon"><TriangleAlert size={38} strokeWidth={2.5} /></div>
        <p>{title}</p>
        <button className="qr-retry-button" onClick={() => void qrBankQuery.refetch()} disabled={qrBankQuery.isFetching}>
          <RefreshCw size={16} className={qrBankQuery.isFetching ? "qr-spin" : ""} />
          {qrBankQuery.isFetching ? "Đang tải..." : "Thử lại"}
        </button>
      </div>
    );
  };

  const qrDataString = vietQrQuery.data?.data?.qrCode || "";

  return (
    <main className="qr-identity-page">
      <div className="qr-pattern" style={{ backgroundImage: `url(${trongDong})` }} />
      <button className="qr-back-button" onClick={() => navigate(-1)} aria-label="Quay lại">
        <ArrowLeft size={27} />
      </button>

      <section className="qr-identity-content">
        <img className="qr-government-logo" src={thueDienTu} alt="Thuế điện tử" />
        <h1>MÃ ĐỊNH DANH ĐIỆN TỬ</h1>
        <p className="qr-government-motto">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>

        {!hasQrConfiguration ? renderEmptyState() : (
          <>
            <div className="qr-code-card">
              <div className="qr-code-inner">
                <div className="qr-business-info">
                  <strong>MST: {qrBank?.tax_id || "-"}</strong>
                  <strong>{qrBank?.company_name || ""}</strong>
                </div>
                {qrDataString ? <QRCodeSVG id="qr-code-svg" value={qrDataString} size={220} level="H" includeMargin={false} /> : <div className="qr-pending">Đang tạo mã QR...</div>}
              </div>
              <p className="qr-expiry">Hiệu lực của QR code còn {formatTime(timeLeft)}</p>
            </div>
            <button className="qr-download-button" onClick={handleDownloadQr} disabled={!qrDataString}><Download size={19} /> Tải về máy</button>
          </>
        )}
      </section>
    </main>
  );
};

export default QrPage;
