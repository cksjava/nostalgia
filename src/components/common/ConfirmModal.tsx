import { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch, faTriangleExclamation, faXmark } from "@fortawesome/free-solid-svg-icons";

export function ConfirmModal(props: {
  open: boolean;
  title: string;
  message?: string;

  confirmText?: string;
  cancelText?: string;
  danger?: boolean;

  busy?: boolean;

  onConfirm: () => void;
  onClose: () => void;
}) {
  const {
    open,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    danger = false,
    busy = false,
    onConfirm,
    onClose,
  } = props;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Enter") onConfirm();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose, onConfirm]);

  if (!open) return null;

  const primaryBtn = danger
    ? "border-rose-400/20 bg-rose-500/15 text-rose-100 hover:bg-rose-500/20"
    : "border-white/20 bg-white/15 text-white hover:bg-white/20";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close"
        disabled={busy}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-black/70 shadow-2xl shadow-black/60 backdrop-blur-2xl">
        <div className="flex items-start justify-between gap-3 p-5">
          <div className="flex min-w-0 items-start gap-3">
            <div
              className={[
                "mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-2xl border",
                danger ? "border-rose-400/20 bg-rose-500/10" : "border-amber-400/20 bg-amber-500/10",
              ].join(" ")}
              aria-hidden="true"
            >
              <FontAwesomeIcon icon={faTriangleExclamation} className={danger ? "text-rose-200" : "text-amber-200"} />
            </div>

            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-white">{title}</div>
              {message ? <div className="mt-1 text-xs leading-snug text-white/55">{message}</div> : null}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-50"
            aria-label="Close"
            title="Close"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 pb-5">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={[
              "rounded-full border px-4 py-2 text-sm transition disabled:opacity-50",
              primaryBtn,
            ].join(" ")}
          >
            {busy ? (
              <span className="inline-flex items-center gap-2">
                <FontAwesomeIcon icon={faCircleNotch} spin />
                Working…
              </span>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
