import axios, { AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from "axios";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
export const API_MODE = process.env.NEXT_PUBLIC_API_MODE === "live" ? "live" : "demo";

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiErrorPayload {
  success: false;
  message: string;
  code?: string;
  requestId?: string;
  errors?: { field: string; message: string }[];
}

let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 20_000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Client": "nexvia-web/1.0",
  },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const response = await axios.post<ApiEnvelope<{ accessToken: string }>>(
      `${API_URL}/auth/refresh`,
      {},
      { withCredentials: true, timeout: 15_000, headers: { "X-Client": "nexvia-web/1.0" } },
    );
    const token = response.data?.data?.accessToken ?? null;
    setAccessToken(token);
    return token;
  } catch {
    setAccessToken(null);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("nexvia:session-expired"));
    }
    return null;
  }
};

const isAuthPath = (url?: string) =>
  Boolean(url && ["/auth/login", "/auth/register", "/auth/refresh", "/auth/logout"].some((path) => url.includes(path)));

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorPayload>) => {
    const original = error.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined;
    const status = error.response?.status;

    if (status === 401 && original && !original._retry && !isAuthPath(original.url)) {
      original._retry = true;
      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
      const token = await refreshPromise;

      if (token) {
        original.headers = { ...(original.headers ?? {}), Authorization: `Bearer ${token}` };
        return api(original);
      }
    }

    return Promise.reject(error);
  },
);

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorPayload>(error)) {
    if (!error.response) {
      return "The Nexvia API is unreachable. Start the backend on port 5000 or use a demo account.";
    }
    return error.response.data?.message || error.message || "Request failed.";
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}

export function getApiFieldErrors(error: unknown): Record<string, string> {
  if (axios.isAxiosError<ApiErrorPayload>(error) && error.response?.data?.errors) {
    return Object.fromEntries(error.response.data.errors.map((item) => [item.field, item.message]));
  }
  return {};
}

export async function apiGet<T>(url: string, config?: AxiosRequestConfig) {
  const response = await api.get<ApiEnvelope<T>>(url, config);
  return response.data;
}

export async function apiPost<T>(url: string, body?: unknown, config?: AxiosRequestConfig) {
  const response = await api.post<ApiEnvelope<T>>(url, body, config);
  return response.data;
}

export async function apiPatch<T>(url: string, body?: unknown, config?: AxiosRequestConfig) {
  const response = await api.patch<ApiEnvelope<T>>(url, body, config);
  return response.data;
}
