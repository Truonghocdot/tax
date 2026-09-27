import axios from "axios";

export interface Bank {
  id: number;
  name: string;
  short_name: string;
  bin: string;
  logo?: string | null;
}

export interface AdminUser {
  id: number;
  name: string | null;
  email: string | null;
  username: string | null;
  phone: string | null;
  role: number;
  is_active: boolean;
  created_at: string;
  identity?: {
    front_cccd?: string | null;
    back_cccd?: string | null;
    holding_cccd?: string | null;
  };
  profile?: Record<string, string | null> | null;
  banks?: Array<{
    id: number;
    number_account?: string | null;
    account_name?: string | null;
    account_holder_name?: string | null;
    branch?: string | null;
    status?: string | null;
    bank?: Bank | null;
  }>;
  qr_bank?: {
    bin_bank: string;
    number_account: string;
    amount?: number | string | null;
    account_name?: string | null;
    description?: string | null;
    tax_id?: string | null;
    company_name?: string | null;
  } | null;
}

export interface PaginatedUsers {
  data: AdminUser[];
  meta?: {
    current_page: number;
    last_page: number;
    total: number;
  };
}

export interface AdminLoginResponse {
  status: boolean;
  message: string;
  data: {
    token: string;
    user: AdminUser;
  };
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api",
  headers: { Accept: "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("admin_token");
    }
    return Promise.reject(error);
  },
);

export const adminApi = {
  login: (payload: { identifier: string; password: string }) =>
    api.post<AdminLoginResponse>("/admin/login", payload),
  me: () => api.get<{ data: AdminUser }>("/admin/me"),
  banks: () => api.get<Bank[]>("/banks"),
  stats: () => api.get<{ data: Record<string, number> }>("/admin/stats"),
  users: (params: { search?: string; status?: string; page?: number }) =>
    api.get<PaginatedUsers>("/admin/users", { params }),
  createUser: (payload: FormData) => api.post("/admin/users", payload),
  updateUser: (id: number, payload: FormData) =>
    api.post(`/admin/users/${id}`, payload),
  approve: (id: number) => api.post(`/admin/users/${id}/approve`),
  updateQr: (id: number, payload: Record<string, unknown>) =>
    api.put(`/admin/users/${id}/qr-bank`, payload),
  remove: (id: number) => api.delete(`/admin/users/${id}`),
  bulkRemove: (ids: number[]) => api.post("/admin/users/bulk-delete", { ids }),
};

export default api;
