import { useState, type FormEvent } from "react";
import { Eye, EyeOff, LockKeyhole, ScanFace, ShieldCheck, UserRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  username: z.string().min(1, "Vui lòng nhập tên đăng nhập"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [demoMode] = useState(import.meta.env.VITE_DEMO_LOGIN === "true");
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "", rememberMe: false },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      if (demoMode) {
        return authApi.demoLogin({ username: data.username, password: data.password });
      }
      return authApi.login(data);
    },
    onSuccess: (response) => {
      const token = response.data?.data?.token;
      if (token) localStorage.setItem("token", token);
      toast({ title: "Đăng nhập thành công", description: "Chào mừng bạn quay trở lại!" });
      navigate("/", { replace: true });
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast({
        title: "Đăng nhập thất bại",
        description: error.response?.data?.message || "Vui lòng kiểm tra lại thông tin đăng nhập",
        variant: "destructive",
      });
    },
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    void form.handleSubmit((data) => loginMutation.mutate(data))(event);
  };

  return (
    <section className="legacy-login">
      <div className="legacy-tabs" role="tablist" aria-label="Xác thực tài khoản">
        <Link className="legacy-tab active" to="/login">Đăng nhập</Link>
        <Link className="legacy-tab" to="/register">Đăng ký</Link>
      </div>

      <form className="legacy-login-form" onSubmit={submit}>
        <label className="legacy-info-field">
          <UserRound size={18} aria-hidden="true" />
          <input {...form.register("username")} placeholder="Tên đăng nhập" autoComplete="username" />
        </label>
        {form.formState.errors.username && <p className="legacy-form-error">{form.formState.errors.username.message}</p>}

        <label className="legacy-info-field">
          <LockKeyhole size={18} aria-hidden="true" />
          <input {...form.register("password")} type={showPassword ? "text" : "password"} placeholder="MST + Mật khẩu" autoComplete="current-password" />
          <button type="button" className="legacy-toggle" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}>
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </label>
        {form.formState.errors.password && <p className="legacy-form-error">{form.formState.errors.password.message}</p>}

        <div className="legacy-login-meta">
          <label className="legacy-remember"><input type="checkbox" {...form.register("rememberMe")} /> Lưu thông tin đăng nhập</label>
          <Link to="/forgot-password">Quên mật khẩu?</Link>
        </div>

        <div className="legacy-login-actions">
          <button type="submit" className="legacy-login-button" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
          <button type="button" className="legacy-face-button" aria-label="Đăng nhập bằng khuôn mặt">
            <ScanFace size={24} />
          </button>
        </div>
      </form>

      <button type="button" className="legacy-digital-login">
        <span>Đăng nhập bằng tài khoản<br />Định danh điện tử</span>
        <span className="legacy-digital-icon"><ShieldCheck size={27} /></span>
      </button>
    </section>
  );
};

export default Login;
