import type { Toast } from "../../hooks/nowPlaying/useToast";

export function NowPlayingToast({ toast }: { toast: Toast }) {
  if (!toast) return null;

  return (
    <div className="mt-3">
      <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70">
        {toast.message}
      </div>
    </div>
  );
}
