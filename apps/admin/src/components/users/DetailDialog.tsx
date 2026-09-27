import { FileImage, QrCode, ShieldCheck, UserCog } from "lucide-react";
import type { AdminUser } from "../../api";
import { formatDate } from "../../lib/format";
import Modal from "../Modal";

export default function DetailDialog({ user, onClose, onEdit, onQr }: { user: AdminUser; onClose: () => void; onEdit: () => void; onQr: () => void }) {
  return <Modal title="Chi tiết người dùng" onClose={onClose}>
    <div className="detail-header"><div className="avatar large">{(user.name || user.username || "U").slice(0, 1).toUpperCase()}</div><div><h3>{user.name || "Chưa cập nhật"}</h3><p className="muted">{user.username} · {user.phone || "Chưa có số điện thoại"}</p><span className={`status-pill ${user.is_active ? "active" : "pending"}`}><span /> {user.is_active ? "Đang hoạt động" : "Chờ phê duyệt"}</span></div></div>
    <div className="detail-sections"><section><h4>Thông tin liên hệ</h4><dl><div><dt>Email</dt><dd>{user.email || "-"}</dd></div><div><dt>Ngày tạo</dt><dd>{formatDate(user.created_at)}</dd></div></dl></section><section><h4>Ngân hàng liên kết</h4>{user.banks?.length ? user.banks.map((bank) => <div className="bank-row" key={bank.id}><ShieldCheck size={17} /><div><strong>{bank.bank?.short_name || bank.bank?.name || "Ngân hàng"}</strong><span>{bank.number_account || bank.account_name || "Chưa có số tài khoản"}</span></div><span className={`status-pill ${bank.status === "verified" ? "active" : "pending"}`}>{bank.status || "pending"}</span></div>) : <p className="muted">Chưa liên kết ngân hàng.</p>}</section><section><h4>Định danh</h4><div className="identity-grid">{[["Mặt trước", user.identity?.front_cccd], ["Mặt sau", user.identity?.back_cccd], ["Ảnh cầm CCCD", user.identity?.holding_cccd]].map(([label, url]) => <div key={label} className="identity-thumb">{url ? <img src={url} alt={label as string} /> : <FileImage size={22} />}<span>{label}</span></div>)}</div></section></div>
    <div className="modal-actions"><button className="secondary-button" onClick={onClose}>Đóng</button><button className="secondary-button" onClick={onQr}><QrCode size={16} /> QR Bank</button><button className="primary-button" onClick={onEdit}><UserCog size={16} /> Chỉnh sửa</button></div>
  </Modal>;
}
