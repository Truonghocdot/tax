import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ArrowRight, Check, ChevronLeft, ChevronRight, Plus, QrCode, RefreshCw, Search, Trash2, UserCog, X } from "lucide-react";
import { adminApi, type AdminUser, type Bank } from "../api";
import { getErrorMessage } from "../lib/errors";
import { emptyUserForm, formatDate } from "../lib/format";
import type { Dialog, Notice, QrFormState, UserFormState } from "../types";
import DetailDialog from "../components/users/DetailDialog";
import QrDialog from "../components/users/QrDialog";
import UserFormDialog from "../components/users/UserFormDialog";
import CredentialsDialog from "../components/users/CredentialsDialog";

const emptyQrForm = (): QrFormState => ({ bin_bank: "", number_account: "", amount: "", account_name: "", description: "", tax_id: "", company_name: "" });

interface Credentials { username: string; password: string; phone: string; }

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
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
  const [credentials, setCredentials] = useState<Credentials | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const response = await adminApi.users({ search, status, page });
      const payload = response.data;
      setUsers(payload.data || []);
      setPagination({ current: payload.meta?.current_page || page, last: payload.meta?.last_page || 1, total: payload.meta?.total || 0 });
    } catch (requestError) {
      if (!silent) setNotice({ type: "error", message: getErrorMessage(requestError) });
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [search, status, page]);
  useEffect(() => { adminApi.banks().then((response) => setBanks(response.data)).catch(() => setBanks([])); }, []);
  useEffect(() => { const timer = window.setInterval(() => void load(true), 2000); return () => window.clearInterval(timer); }, [search, status, page]);
  useEffect(() => { setSelected([]); }, [page, search, status]);

  const selectableUsers = users.filter((user) => user.role !== 1);
  const selectedAll = useMemo(() => selectableUsers.length > 0 && selectableUsers.every((user) => selected.includes(user.id)), [selectableUsers, selected]);
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
      const response = editing ? await adminApi.updateUser(editing.id, payload) : await adminApi.createUser(payload);
      setDialog(null);
      if (!editing) {
        const created = response.data.data as AdminUser;
        setCredentials({ username: created.username || form.username, password: form.password, phone: created.phone || form.phone });
      } else setNotice({ type: "success", message: "Đã cập nhật người dùng." });
      await load(true);
    } catch (requestError) { setNotice({ type: "error", message: getErrorMessage(requestError) }); }
  };

  const approve = async (user: AdminUser) => {
    if (!window.confirm(`Cho phép ${user.username || user.phone} đăng nhập vào hệ thống?`)) return;
    try { await adminApi.approve(user.id); setNotice({ type: "success", message: "Tài khoản đã được duyệt." }); await load(true); }
    catch (requestError) { setNotice({ type: "error", message: getErrorMessage(requestError) }); }
  };
  const remove = async (user: AdminUser) => {
    if (user.role === 1 || !window.confirm(`Xóa tài khoản ${user.username || user.phone}?`)) return;
    try { await adminApi.remove(user.id); setDialog(null); setNotice({ type: "success", message: "Đã xóa tài khoản." }); await load(true); }
    catch (requestError) { setNotice({ type: "error", message: getErrorMessage(requestError) }); }
  };
  const bulkRemove = async () => {
    if (!selected.length || !window.confirm(`Xóa ${selected.length} tài khoản đã chọn?`)) return;
    try { await adminApi.bulkRemove(selected); setSelected([]); setNotice({ type: "success", message: "Đã xóa các tài khoản được chọn." }); await load(true); }
    catch (requestError) { setNotice({ type: "error", message: getErrorMessage(requestError) }); }
  };
  const submitQr = async (event: FormEvent) => {
    event.preventDefault();
    if (!editing) return;
    try { await adminApi.updateQr(editing.id, { ...qrForm, amount: qrForm.amount || null }); setDialog(null); setNotice({ type: "success", message: "Đã cập nhật QR Bank." }); await load(true); }
    catch (requestError) { setNotice({ type: "error", message: getErrorMessage(requestError) }); }
  };

  return <section className="users-page">
    <div className="page-intro"><div><p className="eyebrow dark">VẬN HÀNH</p><h2>Người dùng</h2><p className="muted">Quản lý tài khoản, hồ sơ định danh và kết nối ngân hàng.</p></div><button className="primary-button" onClick={openCreate}><Plus size={18} /> Tạo tài khoản</button></div>
    {notice && <div className={`alert ${notice.type}`}><span>{notice.message}</span><button onClick={() => setNotice(null)}><X size={16} /></button></div>}
    <div className="panel table-panel">
      <div className="table-toolbar"><div className="search-box"><Search size={17} /><input placeholder="Tìm theo tên, username, email, số điện thoại..." value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} /></div><select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}><option value="">Tất cả trạng thái</option><option value="pending">Chờ phê duyệt</option><option value="active">Đang hoạt động</option></select><button className="icon-button" title="Tải lại" onClick={() => void load()}><RefreshCw size={17} /></button></div>
      {selected.length > 0 && <div className="bulk-bar"><span>Đã chọn {selected.length} tài khoản</span><button className="danger-button small" onClick={bulkRemove}><Trash2 size={16} /> Xóa đã chọn</button></div>}
      <div className="table-wrap"><table><thead><tr><th><input type="checkbox" checked={selectedAll} onChange={(event) => setSelected(event.target.checked ? selectableUsers.map((user) => user.id) : [])} /></th><th>Tên</th><th>Email</th><th>Số điện thoại</th><th>Tên đăng nhập</th><th>Vai trò</th><th>Trạng thái</th><th /></tr></thead><tbody>{loading ? <tr><td colSpan={8} className="table-state">Đang tải dữ liệu...</td></tr> : users.length === 0 ? <tr><td colSpan={8} className="table-state">Không tìm thấy người dùng phù hợp.</td></tr> : users.map((user) => <tr key={user.id}><td><input type="checkbox" disabled={user.role === 1} checked={selected.includes(user.id)} onChange={(event) => setSelected((current) => event.target.checked ? [...current, user.id] : current.filter((id) => id !== user.id))} /></td><td><div className="user-cell"><div className="avatar table-avatar">{(user.name || user.username || "U").slice(0, 1).toUpperCase()}</div><div><strong>{user.name || "Chưa cập nhật"}</strong><span>{formatDate(user.created_at)}</span></div></div></td><td>{user.email || "-"}</td><td>{user.phone || "-"}</td><td>{user.username || "-"}</td><td><span className="role-label">{user.role === 1 ? "Admin" : "Client"}</span></td><td><span className={`status-pill ${user.is_active ? "active" : "pending"}`}><span /> {user.is_active ? "Đang hoạt động" : "Chờ phê duyệt"}</span></td><td><div className="row-actions"><button title="Xem chi tiết" onClick={() => openDetail(user)}><ArrowRight size={16} /></button>{!user.is_active && user.role !== 1 && <button className="approve-action" title="Duyệt tài khoản" onClick={() => approve(user)}><Check size={16} /></button>}<button title="Sửa" onClick={() => openEdit(user)}><UserCog size={16} /></button><button title="QR Bank" onClick={() => openQr(user)}><QrCode size={16} /></button></div></td></tr>)}</tbody></table></div>
      <div className="table-footer"><span>{pagination.total} tài khoản</span><div className="pagination"><button disabled={pagination.current <= 1} onClick={() => setPage((current) => current - 1)}><ChevronLeft size={16} /></button><span>Trang {pagination.current} / {pagination.last}</span><button disabled={pagination.current >= pagination.last} onClick={() => setPage((current) => current + 1)}><ChevronRight size={16} /></button></div></div>
    </div>
    {(dialog === "create" || dialog === "edit") && <UserFormDialog editing={editing} form={form} setForm={setForm} onClose={() => setDialog(null)} onSubmit={submitUser} />}
    {dialog === "detail" && editing && <DetailDialog user={editing} onClose={() => setDialog(null)} onEdit={() => openEdit(editing)} onQr={() => openQr(editing)} onDelete={editing.role !== 1 ? () => void remove(editing) : undefined} />}
    {dialog === "qr" && editing && <QrDialog user={editing} banks={banks} form={qrForm} setForm={setQrForm} onClose={() => setDialog(null)} onSubmit={submitQr} />}
    {credentials && <CredentialsDialog credentials={credentials} onClose={() => setCredentials(null)} />}
  </section>;
}
