import { useEffect } from "react";
import { playerService } from "../../api/services/playerService";
import type { Toast } from "./useToast";

export function useDebouncedVolume(params: {
  volume: number;
  setToast: (t: Toast) => void;
  volDebounceRef: React.MutableRefObject<number | null>;
}) {
  const { volume, setToast, volDebounceRef } = params;

  useEffect(() => {
    if (volDebounceRef.current) window.clearTimeout(volDebounceRef.current);

    volDebounceRef.current = window.setTimeout(async () => {
      try {
        await playerService.setVolume(volume);
      } catch (e: any) {
        setToast({
          kind: "err",
          message: e?.response?.data?.error ?? e?.message ?? "Failed to set volume.",
        });
      }
    }, 160);

    return () => {
      if (volDebounceRef.current) window.clearTimeout(volDebounceRef.current);
    };
  }, [volume, setToast, volDebounceRef]);
}
