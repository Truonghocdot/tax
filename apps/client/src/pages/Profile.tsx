import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import trongDongImage from "@/assets/trong.png";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi, userApi } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const profileSchema = z.object({
  // Text fields - only letters and spaces (Vietnamese characters allowed)
  businessName: z
    .string()
    .min(1, "Vui lòng nhập tên doanh nghiệp")
    .regex(
      /^[a-zA-ZÀ-ỹ\s]+$/u,
      "Tên doanh nghiệp chỉ được chứa chữ cái và khoảng trắng",
    ),

  // Tax code - 10 or 13 digits
  taxCode: z
    .string()
    .min(1, "Vui lòng nhập mã số thuế")
    .regex(/^\d{10}$|^\d{13}$/, "Mã số thuế phải có 10 hoặc 13 chữ số"),

  // Representative name - only letters and spaces
  representative: z
    .string()
    .min(1, "Vui lòng nhập người đại diện")
    .regex(
      /^[a-zA-ZÀ-ỹ\s]+$/u,
      "Tên người đại diện chỉ được chứa chữ cái và khoảng trắng",
    ),

  // Address - alphanumeric with Vietnamese characters
  address: z
    .string()
    .min(1, "Vui lòng nhập địa chỉ trụ sở")
    .min(10, "Địa chỉ phải có ít nhất 10 ký tự"),

  phone: z
    .string()
    .min(1, "Vui lòng nhập số điện thoại")
    .regex(/^0\d{9}$/, "Số điện thoại phải có 10 chữ số và bắt đầu bằng 0"),

  // Capital - numeric only (VND)
  capital: z
    .string()
    .optional()
    .refine((val) => !val || /^\d+$/.test(val), "Vốn điều lệ chỉ được chứa số"),

  // Founding date - DD/MM/YYYY format
  foundingDate: z
    .string()
    .optional()
    .refine(
      (val) =>
        !val || /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/.test(val),
      "Ngày thành lập phải có định dạng DD/MM/YYYY",
    ),

  // Main business - text field
  mainBusiness: z.string().optional(),

  // Bank name - text only
  bankName: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[a-zA-ZÀ-ỹ\s]+$/u.test(val),
      "Tên ngân hàng chỉ được chứa chữ cái và khoảng trắng",
    ),

  // Bank account - numeric only
  bankAccount: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\d+$/.test(val),
      "Số tài khoản chỉ được chứa số",
    ),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const Profile = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const isErrorMode = location.state?.error;

  const [activeErrorMessage, setActiveErrorMessage] = useState<string | null>(
    null,
  );
  const [showErrorDialog, setShowErrorDialog] = useState(false);

  // Fetch user profile
  const { data: userData, isLoading } = useQuery({
    queryKey: ["userProfile"],
    queryFn: () => authApi.getUser().then((res) => res.data),
  });

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    mode: "onChange",
    defaultValues: {
      businessName: "",
      taxCode: "",
      representative: "",
      address: "",
      phone: "",
      capital: "",
      foundingDate: "",
      mainBusiness: "",
      bankName: "",
      bankAccount: "",
    },
  });

  // Populate form when data is loaded
  useEffect(() => {
    // console.log(userData?.data?.profile);
    const profile = userData?.data?.profile || userData?.data || userData;
    if (profile) {
      form.reset({
        businessName: profile.bussiness_name || profile.business_name || "",
        taxCode: profile.tax_code || "",
        representative:
          profile.company_representative || profile.representative || "",
        address: profile.bussiness_address || profile.address || "",
        phone: profile.bussiness_phone || profile.phone || "",
        capital: profile.charter_capital || "",
        foundingDate: profile.date_of_establishment || "",
        mainBusiness: profile.primary_business_lines || "",
        bankName: profile.bank_name || "",
        bankAccount: profile.number_account || "",
      });
    }
  }, [userData, form]);

  const updateProfileMutation = useMutation({
    mutationFn: (data: ProfileFormData) => userApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      navigate("/loading");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      navigate("/loading");
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    if (isErrorMode && activeErrorMessage) {
      setShowErrorDialog(true);
      return;
    }
    updateProfileMutation.mutate(data);
  };

  const handleFieldFocus = (name: string) => {
    if (!isErrorMode) return;

    switch (name) {
      case "taxCode":
        setActiveErrorMessage(
          "Vui lòng kê khai tối thiểu 1-10% vốn điều lệ của công ty",
        );
        break;
      case "representative":
        setActiveErrorMessage(
          "Vui lòng kê khai tối thiểu 30%- 50% vốn điều lệ công ty",
        );
        break;
      case "address":
        setActiveErrorMessage(
          "Vui lòng kê khai 1 hoá đơn không kê khai nhiều hoá đơn cùng lúc",
        );
        break;
      default:
        break;
    }
  };

  const afterErrorDialog = () => {
    setShowErrorDialog(false);
    navigate("/loading");
  };

  const formFields = [
    {
      name: "businessName" as const,
      label: "Tên doanh nghiệp",
      type: "text",
    },
    {
      name: "taxCode" as const,
      label: "Mã số thuế",
      type: "text",
    },
    {
      name: "representative" as const,
      label: "Người đại diện",
      type: "text",
    },
    {
      name: "address" as const,
      label: "Địa chỉ trụ sở",
      type: "text",
    },
    {
      name: "phone" as const,
      label: "Số điện thoại",
      type: "tel",
    },
    {
      name: "capital" as const,
      label: "Vốn điều lệ (VNĐ)",
      type: "text",
    },
    {
      name: "foundingDate" as const,
      label: "Ngày thành lập",
      type: "text",
    },
    {
      name: "mainBusiness" as const,
      label: "Ngành nghề chính",
      type: "text",
    },
    {
      name: "bankName" as const,
      label: "Tên ngân hàng",
      type: "text",
    },
    {
      name: "bankAccount" as const,
      label: "Số tài khoản",
      type: "text",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Decorative header background */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-primary -z-10" />

      {/* Watermark decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute right-0 top-1/4 w-64 h-64 opacity-10">
          <div className="w-full h-full rounded-full border-8 border-accent" />
        </div>
        <div className="absolute left-0 bottom-1/4 w-48 h-48 opacity-10">
          <div className="w-full h-full rounded-full border-8 border-accent" />
        </div>
      </div>

      {/* Form Card */}
      <div className="px-4 pt-4 pb-8">
        <div
          className="bg-card rounded-2xl p-5 shadow-lg"
          style={{
            backgroundImage: `url(${trongDongImage})`,
            backgroundSize: "fill",
            backgroundPosition: "center",
          }}
        >
          <h2 className="text-lg font-semibold text-foreground mb-6">
            Thông tin doanh nghiệp
          </h2>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {formFields.map((field) => (
              <div key={field.name} className="space-y-1">
                <label className="text-sm font-medium text-foreground">
                  {field.label}
                </label>
                <Input
                  {...form.register(field.name, {
                    onChange: (e) => {
                      if (field.name === "foundingDate") {
                        let val = e.target.value.replace(/\D/g, "");
                        if (val.length > 8) val = val.slice(0, 8);

                        if (val.length > 4) {
                          val = `${val.slice(0, 2)}/${val.slice(2, 4)}/${val.slice(4)}`;
                        } else if (val.length > 2) {
                          val = `${val.slice(0, 2)}/${val.slice(2)}`;
                        }

                        e.target.value = val;
                        return val;
                      }
                    },
                  })}
                  onFocus={() => handleFieldFocus(field.name)}
                  type={field.type}
                  placeholder={field.placeholder}
                  className="h-11 bg-background border-border rounded-lg"
                />
                {form.formState.errors[field.name] && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors[field.name]?.message}
                  </p>
                )}
              </div>
            ))}

            <Button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="w-full h-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold mt-6"
            >
              {updateProfileMutation.isPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Cập nhật"
              )}
            </Button>
          </form>
        </div>
      </div>

      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent className="max-w-xs rounded-xl bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive text-center">
              Thông báo
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-foreground font-medium">
              {activeErrorMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => afterErrorDialog()}
              className="w-full bg-primary text-white hover:bg-primary/90"
            >
              Tiếp tục
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Profile;
