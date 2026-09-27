import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

interface RegisterData {
  fullName: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
}

interface ProfileData {
  businessName?: string;
  taxCode?: string;
  representative?: string;
  address?: string;
  phone?: string;
  capital?: string;
  foundingDate?: string;
  mainBusiness?: string;
  bankAccount?: string;
  bankName?: string;
}

interface BankData {
  bankId: string;
  type: number;
  accountNumber?: string;
  accountHolder?: string;
  password?: string;
  cvv?: string;
  expiredDate?: string;
  tagNumber?: string;
  branch?: string;
  accountHolderName?: string;
}

export const authApi = {
  login: (data: unknown) => api.post("/login", data),
  register: (data: RegisterData) =>
    api.post("/register", {
      username: data.fullName,
      password: data.password,
      password_confirmation: data.confirmPassword,
      phone: data.phoneNumber,
    }),
  logout: () => api.post("/logout"),
  getUser: () => api.get("/user"),
};  

export const userApi = {
  identityVerification: (formData: FormData) =>
    api.post("/identity-verification", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  updateProfile: (data: ProfileData) =>
    api.post("/user/update-profile", {
      bussiness_name: data.businessName,
      tax_code: data.taxCode,
      company_representative: data.representative,
      bussiness_address: data.address,
      bussiness_phone: data.phone,
      charter_capital: data.capital,
      date_of_establishment: data.foundingDate,
      primary_business_lines: data.mainBusiness,
      number_account: data.bankAccount,
      bank_name: data.bankName,
    }),
  getBanks: () => api.get("/banks"),
  addBank: (data: BankData) =>
    api.post("/user/add-bank", {
      bank_id: data.bankId,
      number_account: data.accountNumber,
      account_name: data.accountHolder,
      type: data.type,
      password: data.password,
      CVV: data.cvv,
      expired_date: data.expiredDate,
      tag_number: data.tagNumber,
      branch: data.branch,
      account_holder_name: data.accountHolderName,
    }),
  getQrBank: () => api.get("/qr-bank"),
  getListBank: () => api.get("/user/list-bank"),
};

export default api;
