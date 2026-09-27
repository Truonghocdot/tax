import type { FormEvent } from "react";
import type { AdminUser } from "../../api";
import type { QrFormSetter, QrFormState } from "../../types";
import Modal from "../Modal";

export default function QrDialog({ user, form, setForm, onClose, onSubmit }: { user: AdminUser; form: QrFormState; setForm: QrFormSetter; onClose: () => void; onSubmit: (event: FormEvent) => void }) {
  const update = (field: keyof QrFormState) => (value: string) => setForm((current) => ({ ...current, [field]: value }));
  return <Modal title={`QR Bank · ${user.username || user.phone}`} onClose={onClose}><form className="modal-form" onSubmit={onSubmit}><div className="form-grid"><label>BIN ngân hàng<input value={form.bin_bank} onChange={(event) => update("bin_bank")(event.target.value)} required /></label><label>Số tài khoản<input value={form.number_account} onChange={(event) => update("number_account")(event.target.value)} required /></label><label>Số tiền<input type="number" min="0" value={form.amount} onChange={(event) => update("amount")(event.target.value)} /></label><label>Tên chủ tài khoản<input value={form.account_name} onChange={(event) => update("account_name")(event.target.value)} /></label><label>Mã số thuế<input value={form.tax_id} onChange={(event) => update("tax_id")(event.target.value)} /></label><label>Tên doanh nghiệp<input value={form.company_name} onChange={(event) => update("company_name")(event.target.value)} /></label><label className="wide">Nội dung chuyển khoản<input value={form.description} onChange={(event) => update("description")(event.target.value)} /></label></div><div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Hủy</button><button className="primary-button">Lưu QR Bank</button></div></form></Modal>;
}
