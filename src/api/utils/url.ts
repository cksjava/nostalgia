// src/api/utils/url.ts

// Prefer Vite env vars (same ones used by axiosService)
const RAW_BASE =
  (import.meta as any).env?.VITE_IMAGE_URL ||
  (import.meta as any).env?.VITE_SERVER_BASE_URL ||
  (import.meta as any).env?.VITE_BACKEND_URL ||
  "";

function stripTrailingSlashes(s: string) {
  return s.replace(/\/+$/, "");
}

function stripLeadingSlashes(s: string) {
  return s.replace(/^\/+/, "");
}

/**
 * Makes a URL absolute against backend base url if it is relative.
 * - If input is already absolute (http/https/data/blob), returns as-is
 * - If input starts with "/", prefixes: <base><path>
 * - If input is "covers/x.jpg", prefixes: <base>/covers/x.jpg
 */
export function toBackendUrl(input: string | null | undefined): string {
  const v = String(input || "").trim();
  if (!v) return "";

  // already absolute or special scheme
  if (/^(https?:)?\/\//i.test(v) || /^(data|blob):/i.test(v)) return v;

  const base = stripTrailingSlashes(String(RAW_BASE || "").trim());
  if (!base) return v; // fallback; at least don't break

  if (v.startsWith("/")) return `${base}${v}`;
  return `${base}/${stripLeadingSlashes(v)}`;
}
