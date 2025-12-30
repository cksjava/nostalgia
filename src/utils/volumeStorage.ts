const KEY = "player.volume";

export function readStoredVolume(fallback = 70): number {
  try {
    const raw = localStorage.getItem(KEY);
    const n = raw == null ? NaN : Number(raw);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(0, Math.min(100, Math.round(n)));
  } catch {
    return fallback;
  }
}

export function writeStoredVolume(v: number) {
  try {
    const n = Math.max(0, Math.min(100, Math.round(Number(v) || 0)));
    localStorage.setItem(KEY, String(n));
  } catch {
    // ignore
  }
}
