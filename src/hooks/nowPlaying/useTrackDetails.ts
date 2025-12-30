import { useEffect, useState } from "react";
import { tracksService } from "../../api/services/tracksService";
import type { Track as TrackDto } from "../../api/types/models";
import type { Toast } from "./useToast";

export function useTrackDetails(trackId?: string, setToast?: (t: Toast) => void) {
  const [track, setTrack] = useState<TrackDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!trackId) {
      setToast?.({ kind: "err", message: "Track id missing in URL." });
      setLoading(false);
      setTrack(null);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const dto = await tracksService.getById(trackId, { withAlbum: true });
        if (cancelled) return;
        setTrack(dto);
      } catch (e: any) {
        if (cancelled) return;
        setToast?.({
          kind: "err",
          message: e?.response?.data?.error ?? e?.message ?? "Failed to load track.",
        });
        setTrack(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [trackId, setToast]);

  return { track, loading, setTrack };
}
