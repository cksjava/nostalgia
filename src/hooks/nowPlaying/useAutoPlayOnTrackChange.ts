import { useEffect } from "react";
import { tracksService } from "../../api/services/tracksService";
import type { Toast } from "./useToast";

export function useAutoPlayOnTrackChange(params: {
  trackId?: string;
  setToast: (t: Toast) => void;
  setIsPlaying: (v: boolean) => void;
  setPositionSec: (v: number) => void;
  endedGuardRef: React.MutableRefObject<boolean>;
  lastTickMsRef: React.MutableRefObject<number>;
}) {
  const { trackId, setToast, setIsPlaying, setPositionSec, endedGuardRef, lastTickMsRef } =
    params;

  useEffect(() => {
    if (!trackId) return;

    let cancelled = false;

    const play = async () => {
      try {
        await tracksService.play(trackId, { positionSec: 0 });
        if (cancelled) return;

        endedGuardRef.current = false;
        lastTickMsRef.current = performance.now();

        setIsPlaying(true);
        setPositionSec(0);
      } catch (e: any) {
        if (cancelled) return;
        setToast({
          kind: "err",
          message: e?.response?.data?.error ?? e?.message ?? "Failed to start playback.",
        });
      }
    };

    void play();
    return () => {
      cancelled = true;
    };
  }, [trackId, setToast, setIsPlaying, setPositionSec, endedGuardRef, lastTickMsRef]);
}
