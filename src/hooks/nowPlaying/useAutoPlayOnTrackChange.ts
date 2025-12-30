import { useEffect, useRef } from "react";
import { tracksService } from "../../api/services/tracksService";
import type { Toast } from "./useToast";

export function useAutoPlayOnTrackChange(params: {
  trackId?: string;

  // if true, will autoplay even on first mount (default true)
  autoplayOnMount?: boolean;

  // position to start at when a NEW trackId is detected (default 0)
  startPositionSec?: number;

  setToast: (t: Toast) => void;
  setIsPlaying: (v: boolean) => void;
  setPositionSec: (v: number) => void;
  endedGuardRef: React.MutableRefObject<boolean>;
  lastTickMsRef: React.MutableRefObject<number>;
}) {
  const {
    trackId,
    autoplayOnMount = true,
    startPositionSec = 0,
    setToast,
    setIsPlaying,
    setPositionSec,
    endedGuardRef,
    lastTickMsRef,
  } = params;

  const prevTrackIdRef = useRef<string | undefined>(undefined);
  const didMountRef = useRef(false);

  useEffect(() => {
    if (!trackId) return;

    const prev = prevTrackIdRef.current;
    const isSame = prev != null && String(prev) === String(trackId);

    // first mount behavior
    if (!didMountRef.current) {
      didMountRef.current = true;
      prevTrackIdRef.current = String(trackId);

      if (!autoplayOnMount) {
        return; // do nothing on initial mount
      }
      // else: treat as "new track" and play below
    } else {
      // subsequent renders: only act if trackId changed
      if (isSame) return;
      prevTrackIdRef.current = String(trackId);
    }

    let cancelled = false;

    const play = async () => {
      try {
        await tracksService.play(trackId, { positionSec: startPositionSec });
        if (cancelled) return;

        endedGuardRef.current = false;
        lastTickMsRef.current = performance.now();

        setIsPlaying(true);
        setPositionSec(startPositionSec);
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
  }, [
    trackId,
    autoplayOnMount,
    startPositionSec,
    setToast,
    setIsPlaying,
    setPositionSec,
    endedGuardRef,
    lastTickMsRef,
  ]);
}
