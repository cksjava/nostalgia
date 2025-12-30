import { useEffect, useState } from "react";
import type { RouteKind } from "./useRouteKind";
import { albumsService } from "../../api/services/albumsService";
import { playlistsService } from "../../api/services/playlistsService";
import { tracksService } from "../../api/services/tracksService";
import type { Track as TrackDto } from "../../api/types/models";
import type { Toast } from "./useToast";

function sortAlbumLike(tracks: TrackDto[]) {
  return [...tracks].sort((a, b) => {
    const ad = a.discNo != null ? Number(a.discNo) : 0;
    const bd = b.discNo != null ? Number(b.discNo) : 0;
    if (ad !== bd) return ad - bd;

    const an = a.trackNo != null ? Number(a.trackNo) : 0;
    const bn = b.trackNo != null ? Number(b.trackNo) : 0;
    if (an !== bn) return an - bn;

    return String(a.title || "").localeCompare(String(b.title || ""));
  });
}

export function useContextTracks(params: {
  routeKind: RouteKind;
  albumId?: string;
  playlistId?: string;
  setToast: (t: Toast) => void;
}) {
  const { routeKind, albumId, playlistId, setToast } = params;

  const [contextTracks, setContextTracks] = useState<TrackDto[]>([]);
  const [contextLoading, setContextLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setContextLoading(true);
      try {
        if (routeKind === "album") {
          if (!albumId) throw new Error("albumId missing in URL.");
          const dto: any = await albumsService.getById(albumId, { withTracks: true });
          const tracks: TrackDto[] = Array.isArray(dto?.tracks) ? dto.tracks : [];
          if (!cancelled) setContextTracks(sortAlbumLike(tracks));
          return;
        }

        if (routeKind === "playlist") {
          if (!playlistId) throw new Error("playlistId missing in URL.");
          const dto: any = await playlistsService.getById(playlistId, { withTracks: true });
          const tracks: TrackDto[] = Array.isArray(dto?.tracks) ? dto.tracks : [];
          if (!cancelled) setContextTracks(tracks);
          return;
        }

        if (routeKind === "favourites") {
          const rows: any = await (tracksService as any).listFavourites?.();
          const tracks: TrackDto[] = Array.isArray(rows)
            ? rows
            : Array.isArray(rows?.tracks)
            ? rows.tracks
            : [];
          if (!cancelled) setContextTracks(sortAlbumLike(tracks));
          return;
        }

        if (!cancelled) setContextTracks([]);
      } catch (e: any) {
        if (cancelled) return;
        setContextTracks([]);
        setToast({
          kind: "err",
          message:
            e?.response?.data?.error ??
            e?.message ??
            "Failed to load track list for previous/next navigation.",
        });
      } finally {
        if (!cancelled) setContextLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [routeKind, albumId, playlistId, setToast]);

  return { contextTracks, contextLoading };
}
