import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import {
  Activity,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileImage,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  QrCode,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  UserCog,
  Users,
  X,
} from "lucide-react";
import axios from "axios";
import { adminApi, type AdminUser } from "./api";

type View = "dashboard" | "users";
type Dialog = "create" | "edit" | "detail" | "qr" | null;

const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || "Không thể hoàn tất thao tác.";
  }
  return "Không thể hoàn tất thao tác.";
};

const formatDate = (value?: string) =>
  value
    ? new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "-";

const generatePassword = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join("") + "@";
};

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await adminApi.login({ username, password });
      localStorage.setItem("admin_token", response.data.data.token);
      onLogin();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-art">
        <div className="seal">ET</div>
        <p className="eyebrow">HỆ THỐNG THUẾ ĐIỆN TỬ</p>
        <h1>Quản trị vận hành tập trung</h1>
        <p className="login-copy">Theo dõi hồ sơ, phê duyệt tài khoản và quản lý kết nối thanh toán trong một không gian làm việc thống nhất.</p>
      </div>
      <form className="login-card" onSubmit={submit}>
        <div className="brand-mark"><ShieldCheck size={22} /> Cổng quản trị</div>
        <h2>Đăng nhập</h2>
        <p className="muted">Sử dụng tài khoản quản trị để tiếp tục.</p>
        <label>Tên đăng nhập<input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" required /></label>
        <label>Mật khẩu<input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="current-password" required /></label>
        {error && <div className="alert error">{error}</div>}
        <button className="primary-button full" disabled={loading}>{loading ? "Đang xác thực..." : "Đăng nhập"}<ArrowRight size={18} /></button>
        <p className="login-foot">Truy cập được kiểm soát theo vai trò quản trị.</p>
      </form>
    </main>
  );
}

function Shell({ view, setView, user, onLogout, children }: { view: View; setView: (view: View) => void; user: AdminUser; onLogout: () => void; children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = (next: View) => {
    setView(next);
    setMobileOpen(false);
  };
  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="sidebar-brand"><div className="brand-icon">ET</div><div><strong>Thuế điện tử</strong><span>Quản trị hệ thống</span></div></div>
        <nav>
          <p className="nav-label">TỔNG QUAN</p>
          <button className={view === "dashboard" ? "nav-item active" : "nav-item"} onClick={() => navigate("dashboard")}><LayoutDashboard size={18} /> Tổng quan</button>
          <p className="nav-label">VẬN HÀNH</p>
          <button className={view === "users" ? "nav-item active" : "nav-item"} onClick={() => navigate("users")}><Users size={18} /> Người dùng</button>
        </nav>
        <div className="sidebar-bottom"><div className="admin-identity"><div className="avatar">{(user.name || user.username || "A").slice(0, 1).toUpperCase()}</div><div><strong>{user.name || user.username}</strong><span>Quản trị viên</span></div></div><button className="logout-button" onClick={onLogout}><LogOut size={17} /> Đăng xuất</button></div>
      </aside>
      <div className="main-column">
        <header className="topbar"><button className="mobile-menu" onClick={() => setMobileOpen(!mobileOpen)}><Menu size={21} /></button><div><p className="topbar-kicker">CỔNG QUẢN TRỊ</p><h1>{view === "dashboard" ? "Tổng quan hệ thống" : "Quản lý người dùng"}</h1></div><div className="topbar-right"><span className="live-dot"><Activity size={15} /> Hệ thống hoạt động</span><div className="avatar small">{(user.name || user.username || "A").slice(0, 1).toUpperCase()}</div></div></header>
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}

function Dashboard() {
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    adminApi.stats().then((response) => setStats(response.data.data)).catch((requestError) => setError(getErrorMessage(requestError))).finally(() => setLoading(false));
  }, []);
  const cards = [
    { key: "total_users", label: "Tổng người dùng", icon: Users, tone: "red" },
    { key: "pending_users", label: "Chờ phê duyệt", icon: Activity, tone: "amber" },
    { key: "active_users", label: "Đang hoạt động", icon: CheckCircle2, tone: "green" },
    { key: "linked_banks", label: "Tài khoản ngân hàng", icon: ShieldCheck, tone: "blue" },
  ];
  return <section className="dashboard-page"><div className="page-intro"><div><p className="eyebrow dark">BẢNG ĐIỀU KHIỂN</p><h2>Xin chào, quản trị viên</h2><p className="muted">Đây là tình hình vận hành mới nhất của hệ thống.</p></div><span className="last-sync"><RefreshCw size={15} /> Cập nhật trực tiếp</span></div>{error && <div className="alert error">{error}</div>}<div className="stat-grid">{cards.map((card) => { const Icon = card.icon; return <article className="stat-card" key={card.key}><div className={`stat-icon ${card.tone}`}><Icon size={20} /></div><div><p>{card.label}</p><strong>{loading ? "..." : (stats[card.key] ?? 0).toLocaleString("vi-VN")}</strong></div></article>; })}</div><div className="dashboard-grid"><article className="panel welcome-panel"><div className="panel-heading"><div><p className="eyebrow dark">KHÔNG GIAN LÀM VIỆC</p><h3>Quản trị minh bạch, xử lý nhanh</h3></div><ShieldCheck size={30} className="heading-icon" /></div><p className="muted">Sử dụng mục Người dùng để duyệt tài khoản mới, kiểm tra hồ sơ định danh và cấu hình thông tin nhận thanh toán.</p><button className="text-button" onClick={() => (window.location.hash = "users")}>Mở quản lý người dùng <ArrowRight size={16} /></button></article><article className="panel checklist"><div className="panel-heading"><h3>Trạng thái dịch vụ</h3><span className="status-pill active"><span /> Bình thường</span></div>{["API xác thực", "Kho dữ liệu người dùng", "Kết nối ngân hàng"].map((item) => <div className="check-row" key={item}><CheckCircle2 size={17} /> <span>{item}</span><small>Đang hoạt động</small></div>)}</article></div></section>;
}

interface UserFormState { name: string; email: string; phone: string; username: string; password: string; front_cccd?: File; back_cccd?: File; holding_cccd?: File; }
const emptyForm = (): UserFormState => ({ name: "", email: "", phone: "", username: "", password: generatePassword() });

function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ current: 1, last: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [form, setForm] = useState<UserFormState>(emptyForm());
  const [qrForm, setQrForm] = useState({ bin_bank: "", number_account: "", amount: "", account_name: "", description: "", tax_id: "", company_name: "" });
  const [notice, setNotice] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const response = await adminApi.users({ search, status, page });
      const payload = response.data as any;
      setUsers(payload.data || []);
      setPagination({ current: payload.meta?.current_page || page, last: payload.meta?.last_page || 1, total: payload.meta?.total || 0 });
    } catch (requestError) { setNotice({ type: "error", message: getErrorMessage(requestError) }); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [search, status, page]);
  useEffect(() => { setSelected([]); }, [page, search, status]);

  const selectedAll = useMemo(() => users.length > 0 && users.every((user) => selected.includes(user.id)), [users, selected]);
  const openCreate = () => { setEditing(null); setForm(emptyForm()); setDialog("create"); };
  const openEdit = (user: AdminUser) => { setEditing(user); setForm({ name: user.name || "", email: user.email || "", phone: user.phone || "", username: user.username || "", password: "" }); setDialog("edit"); };
  const openQr = (user: AdminUser) => { setEditing(user); setQrForm({ bin_bank: user.qr_bank?.bin_bank || "", number_account: user.qr_bank?.number_account || "", amount: String(user.qr_bank?.amount || ""), account_name: user.qr_bank?.account_name || "", description: user.qr_bank?.description || "", tax_id: user.qr_bank?.tax_id || "", company_name: user.qr_bank?.company_name || "" }); setDialog("qr"); };
  const changeFile = (field: "front_cccd" | "back_cccd" | "holding_cccd") => (event: ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (file) setForm((current) => ({ ...current, [field]: file })); };
  const submitUser = async (event: FormEvent) => {
    event.preventDefault();
    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => { if (value) payload.append(key, value instanceof File ? value : String(value)); });
    if (editing) payload.append("_method", "PATCH");
    try { if (editing) await adminApi.updateUser(editing.id, payload); else await adminApi.createUser(payload); setDialog(null); setNotice({ type: "success", message: editing ? "Đã cập nhật người dùng." : "Đã tạo người dùng." }); await load(); } catch (requestError) { setNotice({ type: "error", message: getErrorMessage(requestError) }); }
  };
  const approve = async (user: AdminUser) => { if (!window.confirm(`Duyệt tài khoản ${user.username || user.phone}?`)) return; try { await adminApi.approve(user.id); setNotice({ type: "success", message: "Đã duyệt tài khoản." }); await load(); } catch (requestError) { setNotice({ type: "error", message: getErrorMessage(requestError) }); } };
  const remove = async (user: AdminUser) => { if (!window.confirm(`Xóa tài khoản ${user.username || user.phone}?`)) return; try { await adminApi.remove(user.id); setNotice({ type: "success", message: "Đã xóa tài khoản." }); await load(); } catch (requestError) { setNotice({ type: "error", message: getErrorMessage(requestError) }); } };
  const bulkRemove = async () => { if (!selected.length || !window.confirm(`Xóa ${selected.length} tài khoản đã chọn?`)) return; try { await adminApi.bulkRemove(selected); setSelected([]); setNotice({ type: "success", message: "Đã xóa các tài khoản được chọn." }); await load(); } catch (requestError) { setNotice({ type: "error", message: getErrorMessage(requestError) }); } };
  const submitQr = async (event: FormEvent) => { event.preventDefault(); if (!editing) return; try { await adminApi.updateQr(editing.id, { ...qrForm, amount: qrForm.amount || null }); setDialog(null); setNotice({ type: "success", message: "Đã cập nhật QR Bank." }); await load(); } catch (requestError) { setNotice({ type: "error", message: getErrorMessage(requestError) }); } };

  return <section className="users-page"><div className="page-intro"><div><p className="eyebrow dark">VẬN HÀNH</p><h2>Người dùng</h2><p className="muted">Quản lý tài khoản, hồ sơ định danh và kết nối ngân hàng.</p></div><button className="primary-button" onClick={openCreate}><Plus size={18} /> Tạo tài khoản</button></div>{notice && <div className={`alert ${notice.type}`}><span>{notice.message}</span><button onClick={() => setNotice(null)}><X size={16} /></button></div>}<div className="panel table-panel"><div className="table-toolbar"><div className="search-box"><Search size={17} /><input placeholder="Tìm theo tên, username, email..." value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} /></div><select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}><option value="">Tất cả trạng thái</option><option value="pending">Chờ phê duyệt</option><option value="active">Đang hoạt động</option></select><button className="icon-button" title="Tải lại" onClick={load}><RefreshCw size={17} /></button></div>{selected.length > 0 && <div className="bulk-bar"><span>Đã chọn {selected.length} tài khoản</span><button className="danger-button small" onClick={bulkRemove}><Trash2 size={16} /> Xóa đã chọn</button></div>}<div className="table-wrap"><table><thead><tr><th><input type="checkbox" checked={selectedAll} onChange={(event) => setSelected(event.target.checked ? users.map((user) => user.id) : [])} /></th><th>Người dùng</th><th>Liên hệ</th><th>Vai trò</th><th>Trạng thái</th><th>Ngày tạo</th><th /></tr></thead><tbody>{loading ? <tr><td colSpan={7} className="table-state">Đang tải dữ liệu...</td></tr> : users.length === 0 ? <tr><td colSpan={7} className="table-state">Không tìm thấy người dùng phù hợp.</td></tr> : users.map((user) => <tr key={user.id}><td><input type="checkbox" checked={selected.includes(user.id)} onChange={(event) => setSelected((current) => event.target.checked ? [...current, user.id] : current.filter((id) => id !== user.id))} /></td><td><div className="user-cell"><div className="avatar table-avatar">{(user.name || user.username || "U").slice(0, 1).toUpperCase()}</div><div><strong>{user.name || "Chưa cập nhật"}</strong><span>{user.username || "-"}</span></div></div></td><td><strong>{user.phone || "-"}</strong><span>{user.email || "Chưa có email"}</span></td><td><span className="role-label">Khách hàng</span></td><td><span className={`status-pill ${user.is_active ? "active" : "pending"}`}><span /> {user.is_active ? "Đang hoạt động" : "Chờ phê duyệt"}</span></td><td className="date-cell">{formatDate(user.created_at)}</td><td><div className="row-actions"><button title="Xem chi tiết" onClick={() => { setEditing(user); setDialog("detail"); }}><ArrowRight size={16} /></button>{!user.is_active && <button className="approve-action" title="Duyệt tài khoản" onClick={() => approve(user)}><Check size={16} /></button>}<button title="Sửa" onClick={() => openEdit(user)}><UserCog size={16} /></button><button title="QR Bank" onClick={() => openQr(user)}><QrCode size={16} /></button><button className="delete-action" title="Xóa" onClick={() => remove(user)}><Trash2 size={16} /></button></div></td></tr>)}</tbody></table></div><div className="table-footer"><span>{pagination.total} tài khoản</span><div className="pagination"><button disabled={pagination.current <= 1} onClick={() => setPage((current) => current - 1)}><ChevronLeft size={16} /></button><span>Trang {pagination.current} / {pagination.last}</span><button disabled={pagination.current >= pagination.last} onClick={() => setPage((current) => current + 1)}><ChevronRight size={16} /></button></div></div></div>{dialog === "create" || dialog === "edit" ? <UserDialog editing={editing} form={form} setForm={setForm} changeFile={changeFile} onClose={() => setDialog(null)} onSubmit={submitUser} /> : null}{dialog === "detail" && editing ? <DetailDialog user={editing} onClose={() => setDialog(null)} onEdit={() => openEdit(editing)} onQr={() => openQr(editing)} /> : null}{dialog === "qr" && editing ? <QrDialog user={editing} form={qrForm} setForm={setQrForm} onClose={() => setDialog(null)} onSubmit={submitQr} /> : null}</section>;
}

function UserDialog({ editing, form, setForm, changeFile, onClose, onSubmit }: { editing: AdminUser | null; form: UserFormState; setForm: Dispatch<SetStateAction<UserFormState>>; changeFile: (field: "front_cccd" | "back_cccd" | "holding_cccd") => (event: ChangeEvent<HTMLInputElement>) => void; onClose: () => void; onSubmit: (event: FormEvent) => void }) {
  return <Modal title={editing ? "Chỉnh sửa người dùng" : "Tạo tài khoản người dùng"} onClose={onClose}><form className="modal-form" onSubmit={onSubmit}><div className="form-grid"><label>Họ và tên<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label><label>Số điện thoại<input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} required /></label><label>Email<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label><label>Tên đăng nhập<input value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} placeholder="Tự sinh từ số điện thoại" required={!editing} /></label><label className="wide">Mật khẩu<input type="text" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required={!editing} placeholder={editing ? "Để trống nếu không đổi" : "Mật khẩu tạm thời"} /><button type="button" className="field-action" onClick={() => setForm({ ...form, password: generatePassword() })}><KeyRound size={15} /> Sinh mật khẩu</button></label></div><div className="upload-grid">{([["front_cccd", "CCCD mặt trước"], ["back_cccd", "CCCD mặt sau"], ["holding_cccd", "Ảnh cầm CCCD"]] as const).map(([field, label]) => <label className="upload-field" key={field}><FileImage size={18} />{label}<input type="file" accept="image/*" onChange={changeFile(field)} /><small>{form[field]?.name || "Chọn ảnh, tối đa 5MB"}</small></label>)}</div><div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Hủy</button><button className="primary-button">{editing ? "Lưu thay đổi" : "Tạo tài khoản"}</button></div></form></Modal>;
}

function DetailDialog({ user, onClose, onEdit, onQr }: { user: AdminUser; onClose: () => void; onEdit: () => void; onQr: () => void }) {
  return <Modal title="Chi tiết người dùng" onClose={onClose}><div className="detail-header"><div className="avatar large">{(user.name || user.username || "U").slice(0, 1).toUpperCase()}</div><div><h3>{user.name || "Chưa cập nhật"}</h3><p className="muted">{user.username} · {user.phone || "Chưa có số điện thoại"}</p><span className={`status-pill ${user.is_active ? "active" : "pending"}`}><span /> {user.is_active ? "Đang hoạt động" : "Chờ phê duyệt"}</span></div></div><div className="detail-sections"><section><h4>Thông tin liên hệ</h4><dl><div><dt>Email</dt><dd>{user.email || "-"}</dd></div><div><dt>Ngày tạo</dt><dd>{formatDate(user.created_at)}</dd></div></dl></section><section><h4>Ngân hàng liên kết</h4>{user.banks?.length ? user.banks.map((bank) => <div className="bank-row" key={bank.id}><ShieldCheck size={17} /><div><strong>{bank.bank?.short_name || bank.bank?.name || "Ngân hàng"}</strong><span>{bank.number_account || bank.account_name || "Chưa có số tài khoản"}</span></div><span className={`status-pill ${bank.status === "verified" ? "active" : "pending"}`}>{bank.status || "pending"}</span></div>) : <p className="muted">Chưa liên kết ngân hàng.</p>}</section><section><h4>Định danh</h4><div className="identity-grid">{[["Mặt trước", user.identity?.front_cccd], ["Mặt sau", user.identity?.back_cccd], ["Ảnh cầm CCCD", user.identity?.holding_cccd]].map(([label, url]) => <div key={label} className="identity-thumb">{url ? <img src={url} alt={label as string} /> : <FileImage size={22} />}<span>{label}</span></div>)}</div></section></div><div className="modal-actions"><button className="secondary-button" onClick={onClose}>Đóng</button><button className="secondary-button" onClick={onQr}><QrCode size={16} /> QR Bank</button><button className="primary-button" onClick={onEdit}><UserCog size={16} /> Chỉnh sửa</button></div></Modal>;
}

function QrDialog({ user, form, setForm, onClose, onSubmit }: { user: AdminUser; form: Record<string, string>; setForm: Dispatch<SetStateAction<{ bin_bank: string; number_account: string; amount: string; account_name: string; description: string; tax_id: string; company_name: string }>>; onClose: () => void; onSubmit: (event: FormEvent) => void }) {
  return <Modal title={`QR Bank · ${user.username || user.phone}`} onClose={onClose}><form className="modal-form" onSubmit={onSubmit}><div className="form-grid"><label>BIN ngân hàng<input value={form.bin_bank} onChange={(event) => setForm((current) => ({ ...current, bin_bank: event.target.value }))} required /></label><label>Số tài khoản<input value={form.number_account} onChange={(event) => setForm((current) => ({ ...current, number_account: event.target.value }))} required /></label><label>Số tiền<input type="number" min="0" value={form.amount} onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))} /></label><label>Tên chủ tài khoản<input value={form.account_name} onChange={(event) => setForm((current) => ({ ...current, account_name: event.target.value }))} /></label><label>Mã số thuế<input value={form.tax_id} onChange={(event) => setForm((current) => ({ ...current, tax_id: event.target.value }))} /></label><label>Tên doanh nghiệp<input value={form.company_name} onChange={(event) => setForm((current) => ({ ...current, company_name: event.target.value }))} /></label><label className="wide">Nội dung chuyển khoản<input value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} /></label></div><div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Hủy</button><button className="primary-button">Lưu QR Bank</button></div></form></Modal>;
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><div className="modal"><div className="modal-heading"><h3>{title}</h3><button className="icon-button" onClick={onClose}><X size={18} /></button></div>{children}</div></div>;
}

export default function App() {
  const [authenticated, setAuthenticated] = useState(Boolean(localStorage.getItem("admin_token")));
  const [user, setUser] = useState<AdminUser | null>(null);
  const [view, setView] = useState<View>(() => (window.location.hash === "#users" ? "users" : "dashboard"));
  useEffect(() => { if (authenticated) adminApi.me().then((response) => setUser(response.data.data)).catch(() => { localStorage.removeItem("admin_token"); setAuthenticated(false); }); }, [authenticated]);
  useEffect(() => { window.location.hash = view; }, [view]);
  if (!authenticated || !user) return <LoginScreen onLogin={() => setAuthenticated(true)} />;
  return <Shell view={view} setView={setView} user={user} onLogout={() => { localStorage.removeItem("admin_token"); setAuthenticated(false); setUser(null); }}>{view === "dashboard" ? <Dashboard /> : <UsersPage />}</Shell>;
}
