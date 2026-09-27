import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";

import { useToast } from "@/hooks/use-toast";

import { userApi, authApi } from "@/lib/api";
import z from "zod";
import { TypeBank } from "@/consts/TypeBank";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

interface Bank {
  id: string;
  name: string;
  shortName: string;
  logo?: string;
  recommended?: boolean;
}

// Reuse default banks from BankRegistration for now, ideally shared const or API
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

const linkAccountSchema = z.object({
  bankId: z.string().min(1, "Vui lòng chọn ngân hàng"),
  accountNumber: z.string().min(1, "Vui lòng nhập số tài khoản"),
  accountHolderName: z.string().min(1, "Vui lòng nhập tên chủ tài khoản"),
  branch: z.string().min(1, "Vui lòng nhập chi nhánh"),
});

type LinkAccountFormData = z.infer<typeof linkAccountSchema>;

interface LinkedBank {
  id: number;
  number_account: string;
  account_holder_name: string;
  status: string | number;
  bank: {
    id: number;
    name: string;
    short_name?: string; // API calls it 'short_name' or 'shortName'? Controller 'with(bank)'.
    logo?: string;
  };
}

const LinkAccount = () => {
  const navigate = useNavigate();

  // Fetch linked banks
  const { data: linkedBanksData } = useQuery({
    queryKey: ["linkedBanks"],
    queryFn: () => userApi.getListBank().then((res) => res.data),
  });

  const linkedBanks: LinkedBank[] = Array.isArray(linkedBanksData?.data)
    ? linkedBanksData.data
    : [];

  // Fetch banks from API for selection list
  const { data: banksData } = useQuery({
    queryKey: ["banks"],
    queryFn: () => userApi.getBanks().then((res) => res.data),
  });

  const banks: Bank[] = Array.isArray(banksData)
    ? banksData
    : banksData?.data && Array.isArray(banksData.data)
      ? banksData.data
      : [];

  const handleSelectBank = (bank: Bank) => {
    navigate("/link-account-detail", { state: { bank } });
  };

  const getStatusBadge = (status: string | number) => {
    // Map status to badge style
    // Assuming 0/pending, 1/verified, 2/rejected
    const s = String(status).toLowerCase();
    if (s === "1" || s === "verified" || s === "approved") {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Đã xác minh
        </span>
      );
    }
    if (s === "2" || s === "rejected") {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Từ chối
        </span>
      );
    }
    return (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        Đang xác minh
      </span>
    );
  };

  return (
    <div className="relative bg-white min-h-screen flex flex-col ">
      <div className="relative z-10 p-4 bg-white min-h-screen">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="flex-1 text-center font-bold text-lg text-primary">
            Liên kết tài khoản
          </h1>
          <div className="w-10"></div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border mb-4">
          <p className="font-medium text-red-600 mb-2">Ngân hàng đã liên kết</p>
          {linkedBanks.length === 0 ? (
            <p className="text-sm text-gray-500">
              Vui lòng liên kết thêm ngân hàng bên dưới
            </p>
          ) : (
            <div className="space-y-3">
              {linkedBanks.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between border-b border-gray-100 last:border-0 pb-2 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    {/* Simplified bank logic, using bank relationship name/shortname */}
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                      {item.bank?.logo ? (
                        <img
                          src={item.bank.logo}
                          alt=""
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span className="text-[10px] font-bold">
                          {item.bank?.short_name ||
                            item.bank?.name?.substring(0, 3)}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {item.bank?.short_name || item.bank?.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.number_account}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {item.account_holder_name}
                      </p>
                    </div>
                  </div>
                  <div>{getStatusBadge(item.status)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <h2 className="font-bold text-lg text-gray-800 mb-4">
          Liên kết thêm ngân hàng
        </h2>

        <div className="grid grid-cols-4 gap-4">
          {banks.map((bank) => (
            <button
              key={bank.id}
              onClick={() => handleSelectBank(bank)}
              className="bg-white p-2 rounded-xl border hover:border-primary flex flex-col items-center justify-center gap-2 h-24 shadow-sm transition-all"
            >
              <div className="flex-1 flex items-center justify-center w-full">
                {bank.logo ? (
                  <img
                    src={bank.logo}
                    alt={bank.name}
                    className="h-full w-full object-contain max-h-12"
                  />
                ) : (
                  <span className="text-xs font-bold text-primary break-words text-center">
                    {bank.shortName}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-gray-500 text-center truncate w-full font-semibold">
                {bank.shortName}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LinkAccount;
