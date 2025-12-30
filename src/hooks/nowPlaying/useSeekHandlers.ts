import { useCallback } from "react";
import { playerService } from "../../api/services/playerService";
import type { Toast } from "./useToast";

export function useSeekHandlers(params: {
  durationSec: number;
  setPositionSec: (n: number) => void;
  setToast: (t: Toast) => void;
  lastTickMsRef: React.MutableRefObject<number>;
  endedGuardRef: React.MutableRefObject<boolean>;
  seekDebounceRef: React.MutableRefObject<number | null>;
  handleTrackEnded: () => Promise<void>;
}) {
  const {
    durationSec,
    setPositionSec,
    setToast,
    lastTickMsRef,
    endedGuardRef,
    seekDebounceRef,
    handleTrackEnded,
  } = params;

  const onSeek = useCallback(
    (next: number) => {
      setPositionSec(next);

      if (seekDebounceRef.current) window.clearTimeout(seekDebounceRef.current);

      seekDebounceRef.current = window.setTimeout(async () => {
        try {
          await playerService.seek(next);
          lastTickMsRef.current = performance.now();
          endedGuardRef.current = false;
        } catch (e: any) {
          setToast({
            kind: "err",
            message: e?.response?.data?.error ?? e?.message ?? "Failed to seek.",
          });
        }
      }, 140);
    },
    [setPositionSec, seekDebounceRef, lastTickMsRef, endedGuardRef, setToast]
  );

  const onSeekEnd = useCallback(
    async (finalPos: number) => {
      if (seekDebounceRef.current) window.clearTimeout(seekDebounceRef.current);

      try {
        await playerService.seek(finalPos);
        setPositionSec(finalPos);
        lastTickMsRef.current = performance.now();

        if (durationSec > 0 && finalPos >= Math.max(0, durationSec - 0.25)) {
          await handleTrackEnded();
        } else {
          endedGuardRef.current = false;
        }
      } catch (e: any) {
        setToast({
          kind: "err",
          message: e?.response?.data?.error ?? e?.message ?? "Failed to seek.",
        });
      }
    },
    [durationSec, setPositionSec, seekDebounceRef, lastTickMsRef, endedGuardRef, setToast, handleTrackEnded]
  );

  return { onSeek, onSeekEnd };
}
