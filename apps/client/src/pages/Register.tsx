import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Phone, User, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/lib/api";

const registerSchema = z
  .object({
    phoneNumber: z
      .string()
      .min(10, "Số điện thoại phải có ít nhất 10 số")
      .regex(/^[0-9]+$/, "Số điện thoại chỉ được chứa số"),
    fullName: z.string().min(2, "Tên đăng nhập phải có ít nhất 2 ký tự"),
    password: z
      .string()
      .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
      .regex(/[A-Z]/, "Mật khẩu phải chứa ít nhất 1 chữ hoa")
      .regex(/[a-z]/, "Mật khẩu phải chứa ít nhất 1 chữ thường")
      .regex(/[0-9]/, "Mật khẩu phải chứa ít nhất 1 số"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      phoneNumber: "",
      fullName: "",
      password: "",
      confirmPassword: "",
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterFormData) => authApi.register(data),
    onSuccess: () => {
      toast({
        title: "Đăng ký thành công",
        description:
          "Tài khoản đã được tạo và đang chờ kích hoạt trên hệ thống.",
      });
      navigate("/login");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      console.error("Register failed:", error);
      toast({
        title: "Đăng ký thất bại",
        description: error.response?.data?.message || "Đã có lỗi xảy ra",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="px-6 animate-fade-in">
      {/* Tabs */}
      <div className="flex justify-center gap-8 mb-8">
        <Link
          to="/login"
          className="pb-2 font-medium text-primary-foreground/50 transition-all"
        >
          Đăng nhập
        </Link>
        <Link
          to="/register"
          className="pb-2 font-medium text-primary-foreground border-b-2 border-primary-foreground transition-all"
        >
          Đăng ký
        </Link>
      </div>

      {/* Form */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {/* Phone Number */}
        <div className="space-y-1">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Phone size={18} />
            </div>
            <Input
              {...form.register("phoneNumber")}
              placeholder="Số điện thoại"
              className="pl-12 h-12 bg-transparent border-0 border-b border-muted-foreground/30 rounded-none text-primary-foreground placeholder:text-muted-foreground/50 focus-visible:ring-0 focus-visible:border-primary-foreground"
            />
          </div>
          {form.formState.errors.phoneNumber && (
            <p className="text-xs text-destructive pl-12">
              {form.formState.errors.phoneNumber.message}
            </p>
          )}
        </div>

        {/* Full Name */}
        <div className="space-y-1">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              <User size={18} />
            </div>
            <Input
              {...form.register("fullName")}
              placeholder="Tên đăng nhập"
              className="pl-12 h-12 bg-transparent border-0 border-b border-muted-foreground/30 rounded-none text-primary-foreground placeholder:text-muted-foreground/50 focus-visible:ring-0 focus-visible:border-primary-foreground"
            />
          </div>
          {form.formState.errors.fullName && (
            <p className="text-xs text-destructive pl-12">
              {form.formState.errors.fullName.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Lock size={18} />
            </div>
            <Input
              {...form.register("password")}
              type={showPassword ? "text" : "password"}
              placeholder="Mật khẩu"
              className="pl-12 pr-12 h-12 bg-transparent border-0 border-b border-muted-foreground/30 rounded-none text-primary-foreground placeholder:text-muted-foreground/50 focus-visible:ring-0 focus-visible:border-primary-foreground"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {form.formState.errors.password && (
            <p className="text-xs text-destructive pl-12">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Lock size={18} />
            </div>
            <Input
              {...form.register("confirmPassword")}
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Xác nhận mật khẩu"
              className="pl-12 pr-12 h-12 bg-transparent border-0 border-b border-muted-foreground/30 rounded-none text-primary-foreground placeholder:text-muted-foreground/50 focus-visible:ring-0 focus-visible:border-primary-foreground"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {form.formState.errors.confirmPassword && (
            <p className="text-xs text-destructive pl-12">
              {form.formState.errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <Button
            type="submit"
            disabled={registerMutation.isPending}
            className="w-full h-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
          >
            {registerMutation.isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              "Đăng ký"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Register;
