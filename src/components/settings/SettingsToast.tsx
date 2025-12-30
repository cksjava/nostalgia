// src/components/settings/SettingsToast.tsx
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import type { Toast } from "./types";

export function SettingsToast({ toast }: { toast: Toast }) {
  if (!toast) return null;

  const toastIcon =
    toast.kind === "ok" ? faCheck : toast.kind === "warn" ? faTriangleExclamation : faTriangleExclamation;

  const toastStyle =
    toast.kind === "ok"
      ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-100"
      : toast.kind === "warn"
      ? "border-amber-400/20 bg-amber-500/10 text-amber-100"
      : "border-rose-400/20 bg-rose-500/10 text-rose-100";

  return (
    <div className="mt-3">
      <div className={`flex items-start gap-2 rounded-xl border px-3 py-2 text-sm ${toastStyle}`}>
        <FontAwesomeIcon icon={toastIcon} className="mt-0.5 shrink-0" />
        <span className="leading-snug">{toast.message}</span>
      </div>
    </div>
  );
}
