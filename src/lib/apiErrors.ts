import type { AxiosError } from "axios";

export function getApiErrorMessage(err: unknown, fallback = "Something went wrong"): string {
  if (!err || typeof err !== "object") return fallback;
  if (!("isAxiosError" in err) || !(err as AxiosError).isAxiosError) return fallback;
  const ax = err as AxiosError<{ message?: string }>;
  const msg = ax.response?.data?.message;
  if (typeof msg === "string" && msg.trim()) return msg;
  if (ax.response?.status === 429) return "Too many requests. Please wait and try again.";
  if (!ax.response) return "Network error. Check your connection and try again.";
  return fallback;
}
