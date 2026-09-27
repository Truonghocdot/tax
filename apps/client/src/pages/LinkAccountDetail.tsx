import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { userApi } from "@/lib/api";
import { TypeBank } from "@/consts/TypeBank";
import { ArrowLeft, Landmark, Loader2 } from "lucide-react";

const linkAccountSchema = z.object({
  accountNumber: z.string().min(1, "Vui lòng nhập số tài khoản"),
  accountHolderName: z.string().min(1, "Vui lòng nhập tên chủ tài khoản"),
  branch: z.string().min(1, "Vui lòng nhập chi nhánh"),
});

type LinkAccountFormData = z.infer<typeof linkAccountSchema>;

interface Bank {
  id: string;
  name: string;
  shortName: string;
  logo?: string;
  recommended?: boolean;
}

const LinkAccountDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const selectedBank = location.state?.bank as Bank | undefined;

  useEffect(() => {
    if (!selectedBank) {
      navigate("/link-account");
    }
  }, [selectedBank, navigate]);

  const form = useForm<LinkAccountFormData>({
    resolver: zodResolver(linkAccountSchema),
    defaultValues: {
      accountNumber: "",
      accountHolderName: "",
      branch: "",
    },
  });

  const addBankMutation = useMutation({
    mutationFn: (data: LinkAccountFormData) => {
      if (!selectedBank) throw new Error("No bank selected");
      return userApi.addBank({
        bankId: selectedBank.id,
        type: TypeBank.OLD,
        accountNumber: data.accountNumber,
        accountHolderName: data.accountHolderName,
        branch: data.branch,
      });
    },
    onSuccess: (response) => {
      setSuccessMessage(
        response.data?.message ||
          "Đây là tài khoản mới liên kết, vui lòng liên hệ cán bộ hỗ trợ để xác minh thông tin",
      );
      setShowSuccessDialog(true);
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      // ... existing error toast
      console.error("Add bank failed:", error);
      toast({
        title: "Lỗi",
        description:
          error.response?.data?.message || "Không thể liên kết ngân hàng",
        variant: "destructive",
      });
    },
  });

  const handleSuccessClose = () => {
    setShowSuccessDialog(false);
    navigate("/link-account");
  };

  const onSubmit = (data: LinkAccountFormData) => {
    addBankMutation.mutate(data);
  };

  if (!selectedBank) return null;

  return (
    <div className="bg-white min-h-screen flex relative flex-col">
      {/* ... existing JSX ... */}
      <div className="bg-red-800 text-white p-4 flex items-center shadow-md">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="text-white hover:bg-red-700"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="flex-1 text-center font-bold text-lg">
          Liên kết tài khoản
        </h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
          className="text-white hover:bg-red-700"
        >
          <Landmark className="h-6 w-6" />
        </Button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        {/* ... existing form content ... */}
        <p className="text-red-600 text-sm mb-4 text-center">
          Vui lòng nhập thông tin đã đăng ký với ngân hàng vào các trường: Tên
          tài khoản, Số điện thoại, Số tài khoản/Thẻ.
        </p>

        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-800">
            Thông tin tài khoản
          </h2>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* ... existing fields ... */}

          {/* ... accountNumber field ... */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-gray-600">Tên ngân hàng</span>
              <div className="font-bold text-gray-900 border-b pb-1">
                {selectedBank.name} {selectedBank.shortName}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-gray-600">
              Số tài khoản <span className="text-red-500">*</span>
            </span>
            <Input
              placeholder="Nhập số tài khoản"
              {...form.register("accountNumber")}
            />
            {form.formState.errors.accountNumber && (
              <p className="text-xs text-red-500">
                {form.formState.errors.accountNumber.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <span className="text-gray-600">
              Tên chủ tài khoản <span className="text-red-500">*</span>
            </span>
            <Input
              placeholder="Chủ tài khoản"
              className=""
              {...form.register("accountHolderName")}
            />
            {form.formState.errors.accountHolderName && (
              <p className="text-xs text-red-500">
                {form.formState.errors.accountHolderName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <span className="text-gray-600">
              Chi nhánh <span className="text-red-500">*</span>
            </span>
            <Input
              placeholder="Nhập chi nhánh ngân hàng"
              {...form.register("branch")}
            />
            {form.formState.errors.branch && (
              <p className="text-xs text-red-500">
                {form.formState.errors.branch.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-6 mt-6 rounded-lg"
            disabled={addBankMutation.isPending}
          >
            {addBankMutation.isPending ? (
              <Loader2 className="animate-spin mr-2" />
            ) : (
              "Liên kết"
            )}
          </Button>
        </form>
      </div>

      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent className="bg-white rounded-xl w-[90%] max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center text-green-600">
              Thành công
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-gray-700 py-4">
              {successMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={handleSuccessClose}
              className="w-full bg-red-700 hover:bg-red-800 text-white"
            >
              Tiếp tục gửi yêu cầu
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default LinkAccountDetail;
