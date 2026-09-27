import { CheckCircle2, Copy, KeyRound, Phone, UserRound } from "lucide-react";
import Modal from "../Modal";

interface Credentials {
  username: string;
  password: string;
  phone: string;
}

export default function CredentialsDialog({ credentials, onClose }: { credentials: Credentials; onClose: () => void }) {
  const copy = async () => {
    await navigator.clipboard?.writeText(
      `Tên đăng nhập: ${credentials.username}\nMật khẩu: ${credentials.password}\nSố điện thoại: ${credentials.phone}`,
    );
  };

  return <Modal title="Tạo tài khoản thành công" onClose={onClose}>
    <div className="credentials-dialog">
      <div className="credential-success"><CheckCircle2 size={22} /> Lưu lại thông tin này để gửi cho khách hàng.</div>
      <div className="credential-list">
        <div><UserRound size={17} /><span>Tên đăng nhập</span><strong>{credentials.username}</strong></div>
        <div><KeyRound size={17} /><span>Mật khẩu</span><strong>{credentials.password}</strong></div>
        <div><Phone size={17} /><span>Số điện thoại</span><strong>{credentials.phone}</strong></div>
      </div>
      <div className="modal-actions"><button className="secondary-button" onClick={copy}><Copy size={16} /> Sao chép</button><button className="primary-button" onClick={onClose}>Đã lưu</button></div>
    </div>
  </Modal>;
}
