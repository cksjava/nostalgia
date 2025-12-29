import axios, { AxiosError } from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL as string | undefined;
if (!baseURL) {
  // Fail fast so misconfig is obvious
  // eslint-disable-next-line no-console
  console.warn("VITE_API_BASE_URL is not set. API calls will likely fail.");
}

const timeoutRaw = import.meta.env.VITE_API_TIMEOUT as string | undefined;
const timeout = timeoutRaw ? Number(timeoutRaw) : 15000;

export const axiosClient = axios.create({
  baseURL: baseURL || "/api",
  timeout: Number.isFinite(timeout) ? timeout : 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Optional: central error normalization
export type ApiError = {
  status?: number;
  message: string;
  details?: unknown;
};

export function toApiError(err: unknown): ApiError {
  if (axios.isAxiosError(err)) {
    const ax = err as AxiosError<any>;
    const status = ax.response?.status;
    const message =
      ax.response?.data?.error ||
      ax.response?.data?.message ||
      ax.message ||
      "Request failed";
    return { status, message, details: ax.response?.data };
  }
  return { message: err instanceof Error ? err.message : "Unknown error", details: err };
}
