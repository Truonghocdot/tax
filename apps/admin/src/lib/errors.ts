import axios from "axios";

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || "Không thể hoàn tất thao tác.";
  }

  return "Không thể hoàn tất thao tác.";
}
