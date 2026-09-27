import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { ArrowRight, Check, ChevronLeft, ChevronRight, Plus, QrCode, RefreshCw, Search, Trash2, UserCog, X } from "lucide-react";
import { adminApi, type AdminUser } from "../api";
import { getErrorMessage } from "../lib/errors";
import { emptyUserForm } from "../lib/format";
import type { Dialog, Notice, QrFormState, UserFormState } from "../types";
import DetailDialog from "../components/users/DetailDialog";
import QrDialog from "../components/users/QrDialog";
import UserFormDialog from "../components/users/UserFormDialog";

const emptyQrForm = (): QrFormState => ({ bin_bank: "", number_account: "", amount: "", account_name: "", description: "", tax_id: "", company_name: "" });

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ current: 1, last: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [form, setForm] = useState<UserFormState>(emptyUserForm());
  const [qrForm, setQrForm] = useState<QrFormState>(emptyQrForm());
  const [notice, setNotice] = useState<Notice | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const response = await adminApi.users({ search, status, page });
      const payload = response.data;
      setUsers(payload.data || []);
      setPagination({ current: payload.meta?.current_page || page, last: payload.meta?.last_page || 1, total: payload.meta?.total || 0 });
    } catch (requestError) {
      setNotice({ type: "error", message: getErrorMessage(requestError) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [search, status, page]);
  useEffect(() => { setSelected([]); }, [page, search, status]);

  const selectedAll = useMemo(() => users.length > 0 && users.every((user) => selected.includes(user.id)), [users, selected]);
  const openCreate = () => { setEditing(null); setForm(emptyUserForm()); setDialog("create"); };
  const openEdit = (user: AdminUser) => { setEditing(user); setForm({ name: user.name || "", email: user.email || "", phone: user.phone || "", username: user.username || "", password: "" }); setDialog("edit"); };
  const openDetail = (user: AdminUser) => { setEditing(user); setDialog("detail"); };
  const openQr = (user: AdminUser) => { setEditing(user); setQrForm({ bin_bank: user.qr_bank?.bin_bank || "", number_account: user.qr_bank?.number_account || "", amount: String(user.qr_bank?.amount || ""), account_name: user.qr_bank?.account_name || "", description: user.qr_bank?.description || "", tax_id: user.qr_bank?.tax_id || "", company_name: user.qr_bank?.company_name || "" }); setDialog("qr"); };

  const submitUser = async (event: FormEvent) => {
    event.preventDefault();
    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => { if (value) payload.append(key, value instanceof File ? value : String(value)); });
    if (editing) payload.append("_method", "PATCH");
    try {
      if (editing) await adminApi.updateUser(editing.id, payload); else await adminApi.createUser(payload);
      setDialog(null);
      setNotice({ type: "success", message: editing ? "Đã cập nhật người dùng." : "Đã tạo người dùng." });
      await load();
    } catch (requestError) { setNotice({ type: "error", message: getErrorMessage(requestError) }); }
  };

  const approve = async (user: AdminUser) => {
    if (!window.confirm(`Duyệt tài khoản ${user.username || user.phone}?`)) return;
    try { await adminApi.approve(user.id); setNotice({ type: "success", message: "Đã duyệt tài khoản." }); await load(); }
    catch (requestError) { setNotice({ type: "error", message: getErrorMessage(requestError) }); }
  };
  const remove = async (user: AdminUser) => {
    if (!window.confirm(`Xóa tài khoản ${user.username || user.phone}?`)) return;
    try { await adminApi.remove(user.id); setNotice({ type: "success", message: "Đã xóa tài khoản." }); await load(); }
    catch (requestError) { setNotice({ type: "error", message: getErrorMessage(requestError) }); }
  };
  const bulkRemove = async () => {
    if (!selected.length || !window.confirm(`Xóa ${selected.length} tài khoản đã chọn?`)) return;
    try { await adminApi.bulkRemove(selected); setSelected([]); setNotice({ type: "success", message: "Đã xóa các tài khoản được chọn." }); await load(); }
    catch (requestError) { setNotice({ type: "error", message: getErrorMessage(requestError) }); }
  };
  const submitQr = async (event: FormEvent) => {
    event.preventDefault();
    if (!editing) return;
    try { await adminApi.updateQr(editing.id, { ...qrForm, amount: qrForm.amount || null }); setDialog(null); setNotice({ type: "success", message: "Đã cập nhật QR Bank." }); await load(); }
    catch (requestError) { setNotice({ type: "error", message: getErrorMessage(requestError) }); }
  };

  return <section className="users-page">
    <div className="page-intro"><div><p className="eyebrow dark">VẬN HÀNH</p><h2>Người dùng</h2><p className="muted">Quản lý tài khoản, hồ sơ định danh và kết nối ngân hàng.</p></div><button className="primary-button" onClick={openCreate}><Plus size={18} /> Tạo tài khoản</button></div>
    {notice && <div className={`alert ${notice.type}`}><span>{notice.message}</span><button onClick={() => setNotice(null)}><X size={16} /></button></div>}
    <div className="panel table-panel">
      <div className="table-toolbar"><div className="search-box"><Search size={17} /><input placeholder="Tìm theo tên, username, email..." value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} /></div><select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}><option value="">Tất cả trạng thái</option><option value="pending">Chờ phê duyệt</option><option value="active">Đang hoạt động</option></select><button className="icon-button" title="Tải lại" onClick={load}><RefreshCw size={17} /></button></div>
      {selected.length > 0 && <div className="bulk-bar"><span>Đã chọn {selected.length} tài khoản</span><button className="danger-button small" onClick={bulkRemove}><Trash2 size={16} /> Xóa đã chọn</button></div>}
      <div className="table-wrap"><table><thead><tr><th><input type="checkbox" checked={selectedAll} onChange={(event) => setSelected(event.target.checked ? users.map((user) => user.id) : [])} /></th><th>Người dùng</th><th>Liên hệ</th><th>Vai trò</th><th>Trạng thái</th><th>Ngày tạo</th><th /></tr></thead><tbody>{loading ? <tr><td colSpan={7} className="table-state">Đang tải dữ liệu...</td></tr> : users.length === 0 ? <tr><td colSpan={7} className="table-state">Không tìm thấy người dùng phù hợp.</td></tr> : users.map((user) => <tr key={user.id}><td><input type="checkbox" checked={selected.includes(user.id)} onChange={(event) => setSelected((current) => event.target.checked ? [...current, user.id] : current.filter((id) => id !== user.id))} /></td><td><div className="user-cell"><div className="avatar table-avatar">{(user.name || user.username || "U").slice(0, 1).toUpperCase()}</div><div><strong>{user.name || "Chưa cập nhật"}</strong><span>{user.username || "-"}</span></div></div></td><td><strong>{user.phone || "-"}</strong><span>{user.email || "Chưa có email"}</span></td><td><span className="role-label">Khách hàng</span></td><td><span className={`status-pill ${user.is_active ? "active" : "pending"}`}><span /> {user.is_active ? "Đang hoạt động" : "Chờ phê duyệt"}</span></td><td className="date-cell">{new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(user.created_at))}</td><td><div className="row-actions"><button title="Xem chi tiết" onClick={() => openDetail(user)}><ArrowRight size={16} /></button>{!user.is_active && <button className="approve-action" title="Duyệt tài khoản" onClick={() => approve(user)}><Check size={16} /></button>}<button title="Sửa" onClick={() => openEdit(user)}><UserCog size={16} /></button><button title="QR Bank" onClick={() => openQr(user)}><QrCode size={16} /></button><button className="delete-action" title="Xóa" onClick={() => remove(user)}><Trash2 size={16} /></button></div></td></tr>)}</tbody></table></div>
      <div className="table-footer"><span>{pagination.total} tài khoản</span><div className="pagination"><button disabled={pagination.current <= 1} onClick={() => setPage((current) => current - 1)}><ChevronLeft size={16} /></button><span>Trang {pagination.current} / {pagination.last}</span><button disabled={pagination.current >= pagination.last} onClick={() => setPage((current) => current + 1)}><ChevronRight size={16} /></button></div></div>
    </div>
    {(dialog === "create" || dialog === "edit") && <UserFormDialog editing={editing} form={form} setForm={setForm} onClose={() => setDialog(null)} onSubmit={submitUser} />}
    {dialog === "detail" && editing && <DetailDialog user={editing} onClose={() => setDialog(null)} onEdit={() => openEdit(editing)} onQr={() => openQr(editing)} />}
    {dialog === "qr" && editing && <QrDialog user={editing} form={qrForm} setForm={setQrForm} onClose={() => setDialog(null)} onSubmit={submitQr} />}
  </section>;
}
