import type { Dispatch, SetStateAction } from "react";
import type { AdminUser } from "./api";

export type View = "dashboard" | "users";
export type Dialog = "create" | "edit" | "detail" | "qr" | null;

export interface UserFormState {
  name: string;
  email: string;
  phone: string;
  username: string;
  password: string;
  front_cccd?: File;
  back_cccd?: File;
  holding_cccd?: File;
}

export interface QrFormState {
  bin_bank: string;
  number_account: string;
  amount: string;
  account_name: string;
  description: string;
  tax_id: string;
  company_name: string;
}

export interface Notice {
  type: "success" | "error";
  message: string;
}

export type UserFormSetter = Dispatch<SetStateAction<UserFormState>>;
export type QrFormSetter = Dispatch<SetStateAction<QrFormState>>;
export type UserAction = (user: AdminUser) => void;
