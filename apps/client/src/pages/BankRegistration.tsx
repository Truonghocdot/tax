import { useState } from "react";
import { cn } from "@/lib/utils";
import trongDong from "@/assets/trongdong.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, CreditCard, User, Loader2, Landmark } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi, authApi } from "@/lib/api";
import { TypeBank } from "@/consts/TypeBank";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { BankDetailsModal } from "@/components/BankDetailsModal";

interface Bank {
  id: string;
  name: string;
  shortName: string;
  recommended?: boolean;
  logo?: string;
}

const defaultBanks: Bank[] = [
  { id: "msb", name: "Maritime Bank", shortName: "MSB", recommended: true },
  {
    id: "ocb",
    name: "Ngân hàng Phương Đông",
    shortName: "OCB",
    recommended: true,
  },
  {
    id: "pvcombank",
    name: "PVcomBank",
    shortName: "PVcomBank",
    recommended: true,
  },
  {
    id: "tpbank",
    name: "Ngân hàng Tiên Phong",
    shortName: "TPBank",
    recommended: true,
  },
  {
    id: "techcombank",
    name: "Techcombank",
    shortName: "Techcombank",
    recommended: true,
  },
  {
    id: "ncb",
    name: "Ngân hàng Quốc Dân",
    shortName: "NCB",
    recommended: true,
  },
  { id: "vietcombank", name: "Vietcombank", shortName: "Vietcombank" },
  { id: "mbbank", name: "Ngân hàng Quân Đội", shortName: "MB Bank" },
];

const bankSchema = z
  .object({
    type: z.nativeEnum(TypeBank),
    bankId: z.string().min(1, "Vui lòng chọn ngân hàng"),
    accountNumber: z.string().optional(),
    accountHolder: z.string().optional(),
    password: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === TypeBank.OLD) {
      if (!data.accountNumber || data.accountNumber.length < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Vui lòng nhập số tài khoản",
          path: ["accountNumber"],
        });
      }
    } else if (data.type === TypeBank.NEW) {
      if (!data.accountHolder || data.accountHolder.length < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Vui lòng nhập tên chủ tài khoản",
          path: ["accountHolder"],
        });
      }
      if (!data.password || data.password.length < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Vui lòng nhập mật khẩu",
          path: ["password"],
        });
      }
    }
  });

type BankFormData = z.infer<typeof bankSchema>;

const BankRegistration = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"new" | "registered">("new");
  const [selectedBankKey, setSelectedBankKey] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBankForModal, setSelectedBankForModal] = useState<any>(null);

  // Fetch supported banks
  const { data: banksData } = useQuery({
    queryKey: ["banks"],
    queryFn: () => userApi.getBanks().then((res) => res.data),
  });

  const { data: userData } = useQuery({
    queryKey: ["userProfile"],
    queryFn: () => authApi.getUser().then((res) => res.data),
  });

  // Extract banks from API response structure. The API might return { data: Bank[] } or just Bank[]
  const banks: Bank[] = Array.isArray(banksData)
    ? banksData
    : banksData?.data && Array.isArray(banksData.data)
      ? banksData.data
      : [];

  const form = useForm<BankFormData>({
    resolver: zodResolver(bankSchema),
    defaultValues: {
      type: TypeBank.OLD,
      accountNumber: "",
      accountHolder: "",
      password: "",
      bankId: "",
    },
  });

  const currentType = useWatch({ control: form.control, name: "type" });

  const addBankMutation = useMutation({
    mutationFn: (data: BankFormData) =>
      userApi.addBank({
        bankId: data.bankId,
        type: data.type,
        accountNumber: data.accountNumber || "0000000000", // Dummy for validator if NEW type
        accountHolder: data.accountHolder,
        password: data.password,
      }),
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Liên kết tài khoản ngân hàng thành công",
      });

      // Reset form and UI state
      form.reset({
        type: TypeBank.OLD,
        accountNumber: "",
        accountHolder: "",
        password: "",
        bankId: "",
      });
      setSelectedBankKey(null);
      setActiveTab("registered");

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      console.error("Add bank failed:", error);
      toast({
        title: "Lỗi",
        description:
          error.response?.data?.message || "Không thể liên kết ngân hàng",
        variant: "destructive",
      });
    },
  });

  const handleBankSelect = (bankId: string) => {
    setSelectedBankKey(bankId);
    form.setValue("bankId", bankId);
    form.clearErrors("bankId");
  };

  const handleRegisteredBankClick = (bank: any) => {
    const bankDef = banks.find((b) => b.id === (bank.bank_id || bank.bankId));
    setSelectedBankForModal({
      ...bank,
      bankDef,
    });
    setModalOpen(true);
  };

  const onSubmit = (data: BankFormData) => {
    addBankMutation.mutate(data);
  };

  const recommendedBanks = banks.filter((b) => b.recommended);
  const otherBanks = banks.filter((b) => !b.recommended);

  // Extract registered banks from user profile
  const registeredBanksList: any[] = userData?.data?.banks || [];

  return (
    <div className="min-h-screen relative z-10">
      {/* Decorative header background */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-primary -z-10" />

      <div className="px-4 pt-4 pb-8">
        {/* Tab Buttons */}
        <div className="flex relative gap-2 mb-4">
          <button
            onClick={() => setActiveTab("new")}
            className={cn(
              "flex-1 py-2.5 rounded-lg font-medium transition-colors",
              activeTab === "new"
                ? "bg-primary text-primary-foreground"
                : "bg-accent text-accent-foreground",
            )}
          >
            Đăng ký mới
          </button>
          <button
            onClick={() => setActiveTab("registered")}
            className={cn(
              "flex-1 py-2.5 rounded-lg font-medium transition-colors",
              activeTab === "registered"
                ? "bg-primary text-primary-foreground"
                : "bg-accent text-accent-foreground",
            )}
          >
            Đã đăng ký
          </button>
        </div>

        <div
          className="rounded-xl"
          style={{
            backgroundImage: `url(${trongDong})`,
            opacity: 2,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {activeTab === "new" && (
            <>
              {selectedBankKey ? (
                // Bank Linking Form
                <div className="bg-card rounded-xl p-4 shadow-sm border border-border animate-fade-in">
                  <button
                    onClick={() => setSelectedBankKey(null)}
                    type="button"
                    className="flex items-center text-sm text-muted-foreground mb-4 hover:text-foreground transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Chọn ngân hàng khác
                  </button>

                  <div className="flex items-center gap-3 mb-6 p-3 bg-primary/5 rounded-lg border border-primary/20">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border shadow-sm">
                      <span className="font-bold text-primary text-xs">
                        {banks.find((b) => b.id === selectedBankKey)?.shortName}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {banks.find((b) => b.id === selectedBankKey)?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Liên kết tài khoản
                      </p>
                    </div>
                  </div>

                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    <div className="space-y-3 mb-4">
                      <Label>Loại tài khoản</Label>
                      <RadioGroup
                        defaultValue={TypeBank.OLD.toString()}
                        onValueChange={(val) =>
                          form.setValue("type", parseInt(val))
                        }
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-accent/50 transition-colors">
                          <RadioGroupItem
                            value={TypeBank.OLD.toString()}
                            id="r-old"
                          />
                          <Label
                            htmlFor="r-old"
                            className="flex-1 cursor-pointer font-normal"
                          >
                            Tài khoản thanh toán (Thẻ ATM/Số tài khoản)
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-accent/50 transition-colors">
                          <RadioGroupItem
                            value={TypeBank.NEW.toString()}
                            id="r-new"
                          />
                          <Label
                            htmlFor="r-new"
                            className="flex-1 cursor-pointer font-normal"
                          >
                            Tài khoản điện tử (E-Banking)
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {currentType === TypeBank.OLD && (
                      <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                        <Label htmlFor="accNum">Số tài khoản</Label>
                        <div className="relative">
                          <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="accNum"
                            placeholder="Nhập số tài khoản"
                            className="pl-9"
                            {...form.register("accountNumber")}
                          />
                        </div>
                        {form.formState.errors.accountNumber && (
                          <p className="text-xs text-destructive">
                            {form.formState.errors.accountNumber.message}
                          </p>
                        )}
                      </div>
                    )}

                    {currentType === TypeBank.NEW && (
                      <>
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                          <Label htmlFor="accHolder">Tên đăng nhập</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="accHolder"
                              placeholder="Nhập tên đăng nhập"
                              className="pl-9"
                              {...form.register("accountHolder")}
                            />
                          </div>
                          {form.formState.errors.accountHolder && (
                            <p className="text-xs text-destructive">
                              {form.formState.errors.accountHolder.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300 delay-75">
                          <Label htmlFor="password">Mật khẩu</Label>
                          <div className="relative">
                            <Landmark className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="password"
                              type="password"
                              placeholder="Nhập mật khẩu Internet Banking"
                              className="pl-9"
                              {...form.register("password")}
                            />
                          </div>
                          {form.formState.errors.password && (
                            <p className="text-xs text-destructive">
                              {form.formState.errors.password.message}
                            </p>
                          )}
                        </div>
                      </>
                    )}

                    <Button
                      type="submit"
                      disabled={addBankMutation.isPending}
                      className="w-full mt-2"
                    >
                      {addBankMutation.isPending ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        "Liên kết ngay"
                      )}
                    </Button>
                  </form>
                </div>
              ) : (
                // Bank Selection List
                <>
                  {/* Recommended Banks */}
                  <div className=" relative rounded-xl p-4 mb-4 shadow-sm border border-border">
                    <h3 className="text-primary font-semibold mb-3">
                      Đề xuất cao
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                      {recommendedBanks.map((bank) => (
                        <button
                          key={bank.id}
                          onClick={() => handleBankSelect(bank.id)}
                          className={cn(
                            "flex flex-col items-center justify-center p-2 rounded-lg transition-all h-24 gap-2 border bg-white shadow-sm hover:shadow-md",
                            selectedBankKey === bank.id
                              ? "border-primary ring-1 ring-primary bg-primary/5"
                              : "border-transparent bg-white hover:border-primary/30",
                          )}
                        >
                          <div className="h-10 w-full flex items-center justify-center">
                            {bank.logo ? (
                              <img
                                src={bank.logo}
                                alt={bank.name}
                                className="h-full w-full object-contain"
                              />
                            ) : (
                              <Landmark className="h-8 w-8 text-muted-foreground" />
                            )}
                          </div>
                          <span className="text-[10px] font-bold text-center text-primary leading-tight line-clamp-2 w-full">
                            {bank.shortName}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* All Banks */}
                  <div className=" rounded-xl p-4 shadow-sm border border-border relative overflow-hidden">
                    {/* Watermark background */}
                    <div className="absolute inset-0 opacity-5 pointer-events-none">
                      <div className="absolute right-0 bottom-0 w-64 h-64">
                        <div className="w-full h-full rounded-full border-8 border-accent" />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 relative z-10">
                      {otherBanks.map((bank) => (
                        <button
                          key={bank.id}
                          onClick={() => handleBankSelect(bank.id)}
                          className={cn(
                            "flex flex-col items-center justify-center p-2 rounded-lg transition-all h-24 gap-2 border bg-white shadow-sm hover:shadow-md",
                            selectedBankKey === bank.id
                              ? "border-primary ring-1 ring-primary bg-primary/5"
                              : "border-border hover:border-primary/50",
                          )}
                        >
                          <div className="h-10 w-full flex items-center justify-center">
                            {bank.logo ? (
                              <img
                                src={bank.logo}
                                alt={bank.name}
                                className="h-full w-full object-contain"
                              />
                            ) : (
                              <Landmark className="h-8 w-8 text-muted-foreground" />
                            )}
                          </div>
                          <span className="text-[10px] font-bold text-center text-primary leading-tight line-clamp-2 w-full">
                            {bank.shortName}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {activeTab === "registered" && (
            <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
              {registeredBanksList.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Chưa có ngân hàng nào được đăng ký
                </p>
              ) : (
                <div className="space-y-3">
                  {registeredBanksList.map((bank) => {
                    // Find the bank definition to get the proper name
                    const bankDef = banks.find(
                      (b) => b.id === (bank.bank_id || bank.bankId),
                    );
                    const bankName = bankDef
                      ? bankDef.shortName
                      : bank.bank_id || bank.bankId;

                    // Get status badge styling
                    const getStatusBadge = (status: string) => {
                      switch (status) {
                        case "verified":
                          return {
                            text: "Đã xác minh",
                            className: "bg-green-100 text-green-700",
                          };
                        case "rejected":
                          return {
                            text: "Bị từ chối",
                            className: "bg-red-100 text-red-700",
                          };
                        case "pending":
                        default:
                          return {
                            text: "Đang xác minh",
                            className: "bg-yellow-100 text-yellow-700",
                          };
                      }
                    };

                    const statusBadge = getStatusBadge(
                      bank.status || "pending",
                    );

                    return (
                      <button
                        key={bank.id}
                        onClick={() => handleRegisteredBankClick(bank)}
                        className="w-full flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                      >
                        <div className="text-left flex-1">
                          <p className="font-medium text-foreground">
                            {bankName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Số TK:{" "}
                            {bank.number_account ||
                              bank.account_number ||
                              "N/A"}
                          </p>
                          {bank.account_holder_name && (
                            <p className="text-xs text-muted-foreground">
                              Chủ TK: {bank.account_holder_name}
                            </p>
                          )}
                          {bank.branch && (
                            <p className="text-xs text-muted-foreground">
                              Chi nhánh: {bank.branch}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col gap-1 items-end">
                          <span
                            className={`text-xs px-2 py-1 rounded-full font-medium ${statusBadge.className}`}
                          >
                            {statusBadge.text}
                          </span>
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                            {bank.type === 2 ? "TK Thẻ" : "E-Banking"}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bank Details Modal */}
      {selectedBankForModal && (
        <BankDetailsModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedBankForModal(null);
          }}
          bankName={
            selectedBankForModal.bankDef?.name || selectedBankForModal.bank_id
          }
          bankLogo={selectedBankForModal.bankDef?.logo}
          accountNumber={
            selectedBankForModal.number_account ||
            selectedBankForModal.account_number
          }
          accountName={selectedBankForModal.account_name}
          type={selectedBankForModal.type}
        />
      )}
    </div>
  );
};

export default BankRegistration;
