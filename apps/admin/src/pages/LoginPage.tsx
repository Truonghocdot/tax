import { useState, type FormEvent } from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { adminApi, type AdminUser } from "../api";
import { getErrorMessage } from "../lib/errors";

export default function LoginPage({ onLogin }: { onLogin: (user: AdminUser) => void }) {
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
      onLogin(response.data.data.user);
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
      </div>
      <form className="login-card" onSubmit={submit}>
        <div className="brand-mark"><ShieldCheck size={22} /> Cổng quản trị</div>
        <h2>Đăng nhập</h2>
        <p className="muted">Sử dụng tài khoản quản trị để tiếp tục.</p>
        <label>
          Tên đăng nhập
          <input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" required />
        </label>
        <label>
          Mật khẩu
          <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="current-password" required />
        </label>
        {error && <div className="alert error">{error}</div>}
        <button className="primary-button full" disabled={loading}>
          {loading ? "Đang xác thực..." : "Đăng nhập"}<ArrowRight size={18} />
        </button>
        <p className="login-foot">Truy cập được kiểm soát theo vai trò quản trị.</p>
      </form>
    </main>
  );
}
