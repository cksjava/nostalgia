import { useEffect } from "react";

export function usePlaybackTick(params: {
  isPlaying: boolean;
  durationSec: number;
  setPositionSec: React.Dispatch<React.SetStateAction<number>>;
  lastTickMsRef: React.MutableRefObject<number>;
  tickTimerRef: React.MutableRefObject<number | null>;
}) {
  const { isPlaying, durationSec, setPositionSec, lastTickMsRef, tickTimerRef } = params;

  useEffect(() => {
    if (tickTimerRef.current) {
      window.clearInterval(tickTimerRef.current);
      tickTimerRef.current = null;
    }

    if (!isPlaying || durationSec <= 0) return;

    lastTickMsRef.current = performance.now();

    tickTimerRef.current = window.setInterval(() => {
      const now = performance.now();
      const dt = (now - lastTickMsRef.current) / 1000;
      lastTickMsRef.current = now;

      if (!Number.isFinite(dt) || dt <= 0) return;

      setPositionSec((prev) => {
        const next = prev + dt;
        if (durationSec > 0 && next >= durationSec) return durationSec;
        return next;
      });
    }, 250);

    return () => {
      if (tickTimerRef.current) {
        window.clearInterval(tickTimerRef.current);
        tickTimerRef.current = null;
      }
    };
  }, [isPlaying, durationSec, setPositionSec, lastTickMsRef, tickTimerRef]);
}
