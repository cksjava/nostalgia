import { useEffect, useState } from "react";

export type Toast = { kind: "ok" | "warn" | "err"; message: string } | null;

export function useToast(autoHideMs = 3200) {
  const [toast, setToast] = useState<Toast>(null);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), autoHideMs);
    return () => window.clearTimeout(t);
  }, [toast, autoHideMs]);

  return { toast, setToast };
}
