import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { User, Lock, Eye, EyeOff, ShieldCheck, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/lib/api";

const loginSchema = z.object({
  username: z.string().min(1, "Vui lòng nhập tên đăng nhập"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const isLoginTab = location.pathname === "/login";

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginFormData) => authApi.login(data),
    onSuccess: (response) => {
      const token = response.data.data.token;
      if (token) {
        localStorage.setItem("token", token);
      }

      toast({
        title: "Đăng nhập thành công",
        description: "Chào mừng bạn quay trở lại!",
      });
      navigate("/");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      console.error("Login failed:", error);
      toast({
        title: "Đăng nhập thất bại",
        description:
          error.response?.data?.message ||
          "Vui lòng kiểm tra lại thông tin đăng nhập",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="px-6 animate-fade-in">
      {/* Tabs */}
      <div className="flex justify-center gap-8 mb-8">
        <Link
          to="/login"
          className={cn(
            "pb-2 font-medium transition-all",
            isLoginTab
              ? "text-white border-b-2 border-white"
              : "text-white/50",
          )}
        >
          Đăng nhập
        </Link>
        <Link
          to="/register"
          className={cn(
            "pb-2 font-medium transition-all",
            !isLoginTab
              ? "text-white border-b-2 border-white"
              : "text-white/50",
          )}
        >
          Đăng ký
        </Link>
      </div>

      {/* Form */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {/* Username */}
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white">
            <User size={18} />
          </div>
          <Input
            {...form.register("username")}
            placeholder="Tên đăng nhập"
            className="pl-12 h-12 bg-transparent border-0 border-b border-white/30 rounded-none text-white placeholder:text-white/50 focus-visible:ring-0 focus-visible:border-white"
          />
          {form.formState.errors.username && (
            <p className="text-xs text-destructive mt-1">
              {form.formState.errors.username.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white">
            <Lock size={18} />
          </div>
          <Input
            {...form.register("password")}
            type={showPassword ? "text" : "password"}
            placeholder="MST + Mật khẩu"
            className="pl-12 pr-12 h-12 bg-transparent border-0 border-b border-white/30 rounded-none text-white placeholder:text-white/50 focus-visible:ring-0 focus-visible:border-white"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          {form.formState.errors.password && (
            <p className="text-xs text-destructive mt-1">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        {/* Remember & Forgot */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox
              id="rememberMe"
              checked={form.watch("rememberMe")}
              onCheckedChange={(checked) =>
                form.setValue("rememberMe", checked as boolean)
              }
              className="border-muted-foreground/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <label
              htmlFor="rememberMe"
              className="text-sm text-white/70"
            >
              Lưu thông tin đăng nhập
            </label>
          </div>
          <Link
            to="/forgot-password"
            className="text-sm text-white/50 hover:text-white/70 underline"
          >
            Quên mật khẩu?
          </Link>
        </div>

        {/* Submit Button */}
        <div className="flex items-center gap-3 pt-4">
          <Button
            type="submit"
            disabled={loginMutation.isPending}
            className="flex-1 h-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
          >
            {loginMutation.isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              "Đăng nhập"
            )}
          </Button>
          <button
            type="button"
            className="w-12 h-12 rounded-lg border border-white/30 flex items-center justify-center text-white/70 hover:bg-white/5 transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect
                x="3"
                y="3"
                width="7"
                height="7"
                stroke="currentColor"
                strokeWidth="2"
              />
              <rect
                x="14"
                y="3"
                width="7"
                height="7"
                stroke="currentColor"
                strokeWidth="2"
              />
              <rect
                x="3"
                y="14"
                width="7"
                height="7"
                stroke="currentColor"
                strokeWidth="2"
              />
              <rect
                x="14"
                y="14"
                width="7"
                height="7"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </button>
        </div>
      </form>

      {/* Alternative Login */}
      <div className="mt-8">
        <button className="w-full py-4 px-4 rounded-xl bg-card/10 border border-muted-foreground/20 flex items-center justify-between hover:bg-card/20 transition-colors">
          <div className="flex flex-col items-start">
            <span className="text-white font-medium">
              Đăng nhập bằng tài khoản
            </span>
            <span className="text-white/60 text-sm">
              Định danh điện tử
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
            <ShieldCheck size={20} className="text-green-600" />
          </div>
        </button>
      </div>
    </div>
  );
};

export default Login;
