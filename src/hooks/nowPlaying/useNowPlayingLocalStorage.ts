import { useEffect } from "react";
import type { NowPlayingData } from "../../types/nowPlaying";
import { toBackendUrl } from "../../api/utils/url";
import type { RouteKind } from "./useRouteKind";
import type { Track as TrackDto } from "../../api/types/models";

export function useNowPlayingLocalStorage(params: {
  track: TrackDto | null;
  trackId?: string;
  routeKind: RouteKind;
  albumId?: string;
  playlistId?: string;
  isPlaying: boolean;
  positionSec: number;
  volume: number;
}) {
  const { track, trackId, routeKind, albumId, playlistId, isPlaying, positionSec, volume } =
    params;

  useEffect(() => {
    if (!track) return;

    const albumCoverPath = track.album?.coverArtPath ? String(track.album.coverArtPath) : "";
    const artworkUrl = albumCoverPath ? toBackendUrl(albumCoverPath) : "";

    const tTitle = String(track.title || "Unknown Track");
    const tArtist = String(track.trackArtist || "Unknown Artist");
    const tAlbumTitle = String(track.album?.title || "Unknown Album");
    const duration = Number(track.durationSec || 0) || 0;

    const resolvedTrackId = String((track as any)?.id ?? trackId ?? "");
    const resolvedAlbumId =
      routeKind === "album"
        ? String(albumId ?? "")
        : track.album?.id != null
        ? String((track.album as any).id)
        : "";

    try {
      localStorage.setItem(
        "nowPlaying",
        JSON.stringify({
          artwork: { url: artworkUrl, alt: `${tTitle} artwork` },
          track: {
            id: resolvedTrackId,
            title: tTitle,
            artist: tArtist,
            album: tAlbumTitle,
            isExplicit: !!(track as any)?.isExplicit,
          },
          album: resolvedAlbumId ? { id: resolvedAlbumId, title: tAlbumTitle } : undefined,
          context: {
            kind: routeKind,
            albumId: albumId ? String(albumId) : undefined,
            playlistId: playlistId ? String(playlistId) : undefined,
          },
          playback: { isPlaying, positionSec, durationSec: duration, volume },
          deviceName: "Raspberry Pi",
        } as any as NowPlayingData)
      );
    } catch {
      // ignore
    }
  }, [track, trackId, routeKind, albumId, playlistId, isPlaying, positionSec, volume]);
}
