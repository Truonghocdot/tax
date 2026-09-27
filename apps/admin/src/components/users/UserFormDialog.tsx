import { useState, type ChangeEvent, type FormEvent } from "react";
import { FileImage, KeyRound } from "lucide-react";
import type { AdminUser } from "../../api";
import { generatePassword } from "../../lib/format";
import type { UserFormSetter, UserFormState } from "../../types";
import Modal from "../Modal";

interface Props {
  editing: AdminUser | null;
  form: UserFormState;
  setForm: UserFormSetter;
  onClose: () => void;
  onSubmit: (event: FormEvent) => void;
}

export default function UserFormDialog({ editing, form, setForm, onClose, onSubmit }: Props) {
  const [files, setFiles] = useState<Record<string, File>>({});
  const changeFile = (field: "front_cccd" | "back_cccd" | "holding_cccd") => (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFiles((current) => ({ ...current, [field]: file }));
      setForm((current) => ({ ...current, [field]: file }));
    }
  };

  return <Modal title={editing ? "Chỉnh sửa người dùng" : "Tạo tài khoản người dùng"} onClose={onClose}>
    <form className="modal-form" onSubmit={onSubmit}>
      <div className="form-grid">
        <label>Họ và tên<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
        <label>Số điện thoại<input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} required /></label>
        <label>Email<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
        <label>Tên đăng nhập<input value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} placeholder="Tự sinh từ số điện thoại" required={!editing} /></label>
        <label className="wide">Mật khẩu<input type="text" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required={!editing} placeholder={editing ? "Để trống nếu không đổi" : "Mật khẩu tạm thời"} /><button type="button" className="field-action" onClick={() => setForm({ ...form, password: generatePassword() })}><KeyRound size={15} /> Sinh mật khẩu</button></label>
      </div>
      <div className="upload-grid">{([["front_cccd", "CCCD mặt trước"], ["back_cccd", "CCCD mặt sau"], ["holding_cccd", "Ảnh cầm CCCD"]] as const).map(([field, label]) => <label className="upload-field" key={field}><FileImage size={18} />{label}<input type="file" accept="image/*" onChange={changeFile(field)} /><small>{files[field]?.name || "Chọn ảnh, tối đa 5MB"}</small></label>)}</div>
      <div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Hủy</button><button className="primary-button">{editing ? "Lưu thay đổi" : "Tạo tài khoản"}</button></div>
    </form>
  </Modal>;
}
