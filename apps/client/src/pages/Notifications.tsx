import { Bell, CheckCircle, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import trongDongImage from "@/assets/trong.png";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning";
  time: string;
  read: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "Thông báo nộp thuế",
    message: "Bạn có khoản thuế cần nộp trước ngày 20/02/2024",
    type: "warning",
    time: "2 giờ trước",
    read: false,
  },
  {
    id: "2",
    title: "Xác nhận thành công",
    message: "Hồ sơ khai thuế đã được xử lý thành công",
    type: "success",
    time: "1 ngày trước",
    read: true,
  },
  {
    id: "3",
    title: "Thông tin cập nhật",
    message: "Hệ thống đã được nâng cấp phiên bản mới",
    type: "info",
    time: "3 ngày trước",
    read: true,
  },
];

const Notifications = () => {
  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle size={20} className="text-green-500" />;
      case "warning":
        return <AlertCircle size={20} className="text-amber-500" />;
      default:
        return <Info size={20} className="text-blue-500" />;
    }
  };

  return (
    <div className="min-h-screen relative">
      <div className="px-4 pt-4 pb-8">
        <div
          className="bg-card rounded-2xl p-4 shadow-lg border border-border/50"
          style={{
            backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)), url(${trongDongImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Bell size={20} className="text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Thông báo</h2>
          </div>

          <div className="space-y-3">
            <div className="p-8 text-center text-muted-foreground text-sm">
              Chưa có thông báo nào
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
