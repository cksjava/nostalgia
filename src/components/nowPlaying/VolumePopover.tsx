import React, { useEffect, useMemo, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVolumeHigh, faVolumeLow, faVolumeXmark } from "@fortawesome/free-solid-svg-icons";
import { clamp } from "../../utils/math";

// ⬇️ update this import path/name to match your service file
import { playerService } from "../../api/services/playerService";

export function VolumePopover(props: {
  refEl: React.RefObject<HTMLDivElement | null>;
  volume: number;
  setVolume: React.Dispatch<React.SetStateAction<number>>;

  // optional: so NowPlayingScreen can show toast
  onToast?: (t: { kind: "ok" | "warn" | "err"; message: string }) => void;
}) {
  const { refEl, volume, setVolume, onToast } = props;

  const v = clamp(volume, 0, 100);

  const volumeIcon = useMemo(() => {
    return v === 0 ? faVolumeXmark : v < 40 ? faVolumeLow : faVolumeHigh;
  }, [v]);

  // --- debounce backend calls while dragging ---
  const pendingTimerRef = useRef<number | null>(null);
  const lastSentRef = useRef<number | null>(null);
  const latestValueRef = useRef<number>(v);

  useEffect(() => {
    latestValueRef.current = v;
  }, [v]);

  const clearTimer = () => {
    if (pendingTimerRef.current != null) {
      window.clearTimeout(pendingTimerRef.current);
      pendingTimerRef.current = null;
    }
  };

  const sendVolume = async (next: number) => {
    try {
      await playerService.setVolume(next);
      lastSentRef.current = next;
    } catch (e: any) {
      onToast?.({
        kind: "err",
        message: e?.response?.data?.error ?? e?.message ?? "Failed to set volume.",
      });
    }
  };

  const scheduleSend = (next: number) => {
    // if same as last sent, skip
    if (lastSentRef.current === next) return;

    clearTimer();
    pendingTimerRef.current = window.setTimeout(() => {
      void sendVolume(next);
    }, 180); // tweak: 120-250ms usually feels good
  };

  const flushSend = () => {
    clearTimer();
    const next = clamp(latestValueRef.current, 0, 100);
    if (lastSentRef.current === next) return;
    void sendVolume(next);
  };

  // cleanup
  useEffect(() => {
    return () => clearTimer();
  }, []);

  return (
    <div
      ref={refEl}
      className="absolute right-0 top-12 z-20 w-64 rounded-2xl border border-white/10 bg-black/40 p-4 shadow-2xl shadow-black/40 backdrop-blur-xl"
      role="dialog"
      aria-label="Volume controls"
    >
      <div className="flex items-center gap-3">
        <span className="shrink-0 text-white/85" aria-hidden="true">
          <FontAwesomeIcon icon={volumeIcon} />
        </span>

        <input
          type="range"
          min={0}
          max={100}
          value={v}
          onChange={(e) => {
            const next = clamp(Number(e.target.value), 0, 100);
            setVolume(next);        // UI immediately
            scheduleSend(next);     // backend debounced
          }}
          onMouseUp={flushSend}
          onTouchEnd={flushSend}
          onKeyUp={flushSend}
          className="flex-1 accent-white/80"
          aria-label="Volume level"
        />

        <span className="shrink-0 text-xs text-white/70 tabular-nums">{v}%</span>
      </div>
    </div>
  );
}
