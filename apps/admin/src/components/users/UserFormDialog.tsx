import { useState, type ChangeEvent, type FormEvent } from "react";
import { FileImage, KeyRound, Sparkles } from "lucide-react";
import type { AdminUser } from "../../api";
import { generatePassword, usernameFromPhone } from "../../lib/format";
import type { UserFormSetter, UserFormState } from "../../types";
import Modal from "../Modal";

interface Props {
  editing: AdminUser | null;
  form: UserFormState;
  setForm: UserFormSetter;
  onClose: () => void;
  onSubmit: (event: FormEvent) => void;
}

type IdentityField = "front_cccd" | "back_cccd" | "holding_cccd";

export default function UserFormDialog({ editing, form, setForm, onClose, onSubmit }: Props) {
  const [files, setFiles] = useState<Partial<Record<IdentityField, File>>>({});
  const [fileError, setFileError] = useState("");
  const changeFile = (field: IdentityField) => (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setFileError("Chỉ được chọn tệp hình ảnh."); return; }
    if (file.size > 5 * 1024 * 1024) { setFileError("Ảnh không được vượt quá 5MB."); return; }
    setFileError("");
    setFiles((current) => ({ ...current, [field]: file }));
    setForm((current) => ({ ...current, [field]: file }));
  };
  const updatePhone = (phone: string) => {
    setForm((current) => ({
      ...current,
      phone,
      ...(!editing && phone.trim() && (!current.username || current.username.startsWith("user_")) ? { username: usernameFromPhone(phone) } : {}),
    }));
  };

  return <Modal title={editing ? "Chỉnh sửa người dùng" : "Tạo tài khoản người dùng"} onClose={onClose}>
    <form className="modal-form" onSubmit={onSubmit}>
      <div className="form-section-heading"><h4>Thông tin cá nhân</h4><p>Thông tin cơ bản của người dùng.</p></div>
      <div className="form-grid">
        <label>Họ và tên<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} maxLength={255} required /></label>
        <label>Số điện thoại<input value={form.phone} onChange={(event) => updatePhone(event.target.value)} placeholder="0xxxxxxxxx" pattern="[0-9\\s\\-+()]+" maxLength={15} required /><small>Sẽ tự động tạo username từ số điện thoại.</small></label>
        <label>Email<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="example@domain.com" maxLength={255} /><small>Không bắt buộc.</small></label>
      </div>
      <div className="form-section-heading"><h4>Thông tin đăng nhập</h4><p>Thông tin xác thực cho tài khoản khách hàng.</p></div>
      <div className="form-grid">
        <label>Tên đăng nhập<input value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} pattern="[A-Za-z0-9_-]+" maxLength={255} required /><button type="button" className="field-action" onClick={() => setForm({ ...form, username: form.phone ? usernameFromPhone(form.phone) : `user_${Math.random().toString(36).slice(2, 10)}` })}><Sparkles size={15} /> Tạo username</button></label>
        <label>Mật khẩu<input type="text" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} minLength={8} maxLength={255} required={!editing} placeholder={editing ? "Để trống nếu không đổi" : "Nhập hoặc tạo tự động"} /><button type="button" className="field-action" onClick={() => setForm({ ...form, password: generatePassword() })}><KeyRound size={15} /> Sinh mật khẩu</button><small>{editing ? "Để trống nếu không muốn thay đổi mật khẩu." : "Mật khẩu tối thiểu 8 ký tự."}</small></label>
        <label>Vai trò<input value={editing?.role === 1 ? "Admin" : "Khách hàng"} disabled /><small>Vai trò mặc định, không thể thay đổi.</small></label>
      </div>
      <div className="form-section-heading"><h4>Thông tin định danh</h4><p>Ảnh CCCD/CMND, không bắt buộc khi tạo tài khoản.</p></div>
      <div className="upload-grid">{([["front_cccd", "CCCD mặt trước", editing?.identity?.front_cccd], ["back_cccd", "CCCD mặt sau", editing?.identity?.back_cccd], ["holding_cccd", "Ảnh cầm CCCD", editing?.identity?.holding_cccd]] as const).map(([field, label, existing]) => <label className="upload-field" key={field}>{existing && !files[field] ? <img className="upload-preview" src={existing} alt={label} /> : <FileImage size={18} />}<span>{label}</span><input type="file" accept="image/jpeg,image/png,image/jpg" onChange={changeFile(field)} /><small>{files[field]?.name || (existing ? "Chọn ảnh mới để thay thế" : "Chọn ảnh, tối đa 5MB")}</small></label>)}</div>
      {fileError && <p className="form-error">{fileError}</p>}
      <div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Hủy</button><button className="primary-button">{editing ? "Lưu thay đổi" : "Tạo tài khoản"}</button></div>
    </form>
  </Modal>;
}
