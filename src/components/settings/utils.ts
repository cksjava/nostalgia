// src/components/settings/utils.ts
export function csvToArray(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return String(raw)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function arrayToCsv(arr: string[]): string {
  return arr.map((s) => String(s).trim()).filter(Boolean).join(",");
}

export function normalizeRoot(input: string) {
  const s = input.trim();
  if (!s) return "";
  return s.replace(/[\/]{2,}/g, "/");
}

export function normalizeExt(input: string) {
  const s = input.trim().toLowerCase();
  if (!s) return "";
  return s.startsWith(".") ? s.slice(1) : s;
}

export function uniqSorted(arr: string[]) {
  const set = new Set(arr.map((x) => x.trim()).filter(Boolean));
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}
