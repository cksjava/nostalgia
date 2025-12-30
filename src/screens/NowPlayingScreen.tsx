import React, { useCallback, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import type { RepeatMode } from "../types/nowPlaying";

import { NowPlayingHeader } from "../components/nowPlaying/NowPlayingHeader";
import { VolumePopover } from "../components/nowPlaying/VolumePopover";
import { NowPlayingCard } from "../components/nowPlaying/NowPlayingCard";
import { Artwork } from "../components/nowPlaying/Artwork";
import { TrackMeta } from "../components/nowPlaying/TrackMeta";
import { SeekBar } from "../components/nowPlaying/SeekBar";
import { PlaybackControls } from "../components/nowPlaying/PlaybackControls";
import { SidebarDrawer } from "../components/common/SidebarDrawer";
import { TrackListSheet } from "../components/nowPlaying/TrackListSheet";
import { AddToPlaylistModal } from "../components/playlists/AddToPlaylistModal";

import { toBackendUrl } from "../api/utils/url";
import { playerService } from "../api/services/playerService";

import { useToast } from "../hooks/nowPlaying/useToast";
import { useRouteKind } from "../hooks/nowPlaying/useRouteKind";
import { useContextTracks } from "../hooks/nowPlaying/useContextTracks";
import { useTrackDetails } from "../hooks/nowPlaying/useTrackDetails";
import { useAutoPlayOnTrackChange } from "../hooks/nowPlaying/useAutoPlayOnTrackChange";
import { usePlaybackTick } from "../hooks/nowPlaying/usePlaybackTick";
import { useSeekHandlers } from "../hooks/nowPlaying/useSeekHandlers";
import { useExclusiveOverlays } from "../hooks/nowPlaying/useExclusiveOverlays";
import { useNowPlayingLocalStorage } from "../hooks/nowPlaying/useNowPlayingLocalStorage";

import { TrackActionsRow } from "../components/nowPlaying/TrackActionsRow";
import { NowPlayingToast } from "../components/nowPlaying/NowPlayingToast";
import { readStoredVolume, writeStoredVolume } from "../utils/volumeStorage";
import { tracksService } from "../api/services/tracksService";

type RouteParams = {
  albumId?: string;
  playlistId?: string;
  trackId?: string;
};

export default function NowPlayingScreen() {
  const navigate = useNavigate();
  const { albumId, playlistId, trackId } = useParams<RouteParams>();

  const { toast, setToast } = useToast(3200);
  const routeKind = useRouteKind();

  const { track, loading } = useTrackDetails(trackId, setToast);

  // Local UI state
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [shuffle, setShuffle] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("off");
  const [positionSec, setPositionSec] = useState<number>(0);
  const [volume, setVolume] = useState<number>(() => readStoredVolume(70));

  const [isVolumeOpen, setIsVolumeOpen] = useState(false);
  const volPanelRef = useRef<HTMLDivElement | null>(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTrackListOpen, setIsTrackListOpen] = useState(false);

  const [isAddToPlaylistOpen, setIsAddToPlaylistOpen] = useState(false);

  // Lists for prev/next
  const { contextTracks, contextLoading } = useContextTracks({
    routeKind,
    albumId,
    playlistId,
    setToast,
  });

  // Debounce + ticking refs
  const seekDebounceRef = useRef<number | null>(null);
  const tickTimerRef = useRef<number | null>(null);
  const lastTickMsRef = useRef<number>(0);
  const endedGuardRef = useRef<boolean>(false);

  const bgStyle: React.CSSProperties = {
    backgroundImage: `
      radial-gradient(900px 600px at 18% 20%, rgba(255, 110, 90, 0.45), transparent 60%),
      radial-gradient(900px 600px at 85% 25%, rgba(110, 160, 255, 0.45), transparent 55%),
      radial-gradient(900px 700px at 70% 85%, rgba(190, 120, 255, 0.35), transparent 60%),
      linear-gradient(135deg, rgba(10, 12, 18, 0.92), rgba(8, 10, 16, 0.92))
    `,
  };

  const onToggleRepeat = () => {
    setRepeatMode((prev) => (prev === "off" ? "all" : prev === "all" ? "one" : "off"));
  };

  const durationSec = Number(track?.durationSec || 0) || 0;

  const navigateToTrackInSameContext = useCallback(
    (nextTrackId: string) => {
      if (routeKind === "album") {
        if (!albumId) return setToast({ kind: "err", message: "albumId missing in URL." });
        navigate(`/albums/${albumId}/tracks/${nextTrackId}`);
        return;
      }
      if (routeKind === "playlist") {
        if (!playlistId) return setToast({ kind: "err", message: "playlistId missing in URL." });
        navigate(`/playlists/${playlistId}/tracks/${nextTrackId}`);
        return;
      }
      if (routeKind === "favourites") {
        navigate(`/favourites/tracks/${nextTrackId}`);
        return;
      }
      setToast({ kind: "err", message: "Unknown route context for next/previous navigation." });
    },
    [navigate, routeKind, albumId, playlistId, setToast]
  );

  const goPrev = useCallback(() => {
    if (!trackId) return;

    if (!contextTracks.length) {
      setToast({
        kind: "warn",
        message: contextLoading ? "Loading track list…" : "No track list available for previous/next.",
      });
      return;
    }

    const idx = contextTracks.findIndex((t: any) => String((t as any).id) === String(trackId));
    if (idx < 0) return setToast({ kind: "warn", message: "Current track not found in list." });

    let targetIdx = idx - 1;
    if (targetIdx < 0) {
      if (repeatMode === "all") targetIdx = contextTracks.length - 1;
      else return setToast({ kind: "warn", message: "This is the first track." });
    }

    const nextId = String((contextTracks[targetIdx] as any).id);
    if (nextId) navigateToTrackInSameContext(nextId);
  }, [trackId, contextTracks, contextLoading, repeatMode, navigateToTrackInSameContext, setToast]);

  const goNext = useCallback(() => {
    if (!trackId) return;

    if (!contextTracks.length) {
      setToast({
        kind: "warn",
        message: contextLoading ? "Loading track list…" : "No track list available for previous/next.",
      });
      return;
    }

    const idx = contextTracks.findIndex((t: any) => String((t as any).id) === String(trackId));
    if (idx < 0) return setToast({ kind: "warn", message: "Current track not found in list." });

    let targetIdx = idx + 1;
    if (targetIdx >= contextTracks.length) {
      if (repeatMode === "all") targetIdx = 0;
      else return setToast({ kind: "warn", message: "This is the last track." });
    }

    const nextId = String((contextTracks[targetIdx] as any).id);
    if (nextId) navigateToTrackInSameContext(nextId);
  }, [trackId, contextTracks, contextLoading, repeatMode, navigateToTrackInSameContext, setToast]);

  const handleTrackEnded = useCallback(async () => {
    if (endedGuardRef.current) return;
    endedGuardRef.current = true;

    if (repeatMode === "one") {
      try {
        await playerService.seek(0);
      } catch {
        // ignore
      } finally {
        setPositionSec(0);
        lastTickMsRef.current = performance.now();
        endedGuardRef.current = false;
      }
      return;
    }

    if (repeatMode === "off") {
      const idx = contextTracks.findIndex((t: any) => String((t as any).id) === String(trackId));
      const isLast = idx >= 0 && contextTracks.length > 0 ? idx === contextTracks.length - 1 : true;
      if (isLast) {
        setIsPlaying(false);
        return;
      }
    }

    goNext();
  }, [repeatMode, contextTracks, trackId, goNext]);

  // Seek handlers
  const { onSeek, onSeekEnd } = useSeekHandlers({
    durationSec,
    setPositionSec,
    setToast,
    lastTickMsRef,
    endedGuardRef,
    seekDebounceRef,
    handleTrackEnded,
  });

  // Auto play when track changes
  useAutoPlayOnTrackChange({
    trackId,
    setToast,
    setIsPlaying,
    setPositionSec,
    endedGuardRef,
    lastTickMsRef,
  });

  // Local ticking
  usePlaybackTick({
    isPlaying,
    durationSec,
    setPositionSec,
    lastTickMsRef,
    tickTimerRef,
  });

  // Auto-next when reaches end
  React.useEffect(() => {
    if (!isPlaying) return;
    if (durationSec <= 0) return;
    if (positionSec >= Math.max(0, durationSec - 0.05)) void handleTrackEnded();
  }, [positionSec, durationSec, isPlaying, handleTrackEnded]);

  React.useEffect(() => {
    writeStoredVolume(volume);
  }, [volume]);

  // Pause/resume to backend (✅ real resume)
  const onTogglePlay = useCallback(
    async (nextIsPlaying: boolean) => {
      if (!trackId) return;

      if (nextIsPlaying === false) {
        // playing -> paused
        await playerService.pause(true);
        return;
      }

      // paused -> playing (resume)
      const resumed = await playerService.tryResume();

      if (resumed) {
        // keep tick baseline sane
        lastTickMsRef.current = performance.now();
        endedGuardRef.current = false;

        // if backend gave us a position, sync local UI so seekbar doesn't jump
        if (typeof resumed.positionSec === "number") {
          setPositionSec(resumed.positionSec);
        }
        return;
      }

      // mpv has nothing loaded -> start track again at current UI position
      // (this fixes the "play only works on screen load" dependency)
      await tracksService.play(trackId, { positionSec });
      lastTickMsRef.current = performance.now();
      endedGuardRef.current = false;
    },
    [trackId, positionSec, setPositionSec]
  );

  // localStorage nowPlaying sync
  useNowPlayingLocalStorage({
    track,
    trackId,
    routeKind,
    albumId,
    playlistId,
    isPlaying,
    positionSec,
    volume,
  });

  // overlays mutual exclusivity + ESC close
  useExclusiveOverlays({ isSidebarOpen, setIsSidebarOpen, isTrackListOpen, setIsTrackListOpen });

  // Derive UI meta
  const title = String(track?.title || "—");
  const artist = String(track?.trackArtist || "—");
  const album = String(track?.album?.title || "—");

  const artworkUrlRaw = track?.album?.coverArtPath ? String(track.album.coverArtPath) : "";
  const artworkUrl = artworkUrlRaw ? toBackendUrl(artworkUrlRaw) : "";

  // Back behavior
  const onBack = useCallback(() => {
    if (routeKind === "album" && albumId) return navigate(`/album/${albumId}`);
    if (routeKind === "playlist" && playlistId) return navigate(`/playlists/${playlistId}`);
    if (routeKind === "favourites") return navigate("/favourites");
    navigate(-1);
  }, [routeKind, albumId, playlistId, navigate]);

  // Close volume on outside click / ESC (keep local here because it uses ref)
  React.useEffect(() => {
    if (!isVolumeOpen) return;

    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (volPanelRef.current && !volPanelRef.current.contains(t)) setIsVolumeOpen(false);
    };

    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsVolumeOpen(false);

    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [isVolumeOpen]);

  return (
    <div className="min-h-screen w-full" style={bgStyle}>
      <div className="min-h-screen w-full backdrop-blur-2xl">
        <div className="mx-auto w-full max-w-md px-4 pb-10 pt-6">
          <NowPlayingHeader
            volume={volume}
            isVolumeOpen={isVolumeOpen}
            onToggleVolume={() => setIsVolumeOpen((v) => !v)}
            onOpenSidebar={() => setIsSidebarOpen(true)}
            onBack={onBack}
            isTrackListOpen={isTrackListOpen}
            onToggleTrackList={() => setIsTrackListOpen((v) => !v)}
          >
            {isVolumeOpen ? (
              <VolumePopover refEl={volPanelRef} volume={volume} setVolume={setVolume} />
            ) : null}
          </NowPlayingHeader>

          <NowPlayingCard>
            <Artwork
              src={artworkUrl || "/placeholder.png"}
              alt={artworkUrl ? `${title} artwork` : "Artwork"}
            />

            <div className="mt-4">
              <div className="flex items-start justify-between gap-3">
                <TrackMeta
                  title={loading ? "Loading…" : title}
                  artist={loading ? "" : artist}
                  album={loading ? "" : album}
                  isExplicit={!!(track as any)?.isExplicit}
                />

                <TrackActionsRow
                  trackId={trackId}
                  onAddToPlaylist={() => setIsAddToPlaylistOpen(true)}
                  shuffle={shuffle}
                  setShuffle={setShuffle}
                  repeatMode={repeatMode}
                  onToggleRepeat={onToggleRepeat}
                />
              </div>
            </div>

            <SeekBar
              positionSec={positionSec}
              durationSec={durationSec}
              onSeek={onSeek}
              onSeekEnd={onSeekEnd}
            />

            <PlaybackControls
              isPlaying={isPlaying}
              setIsPlaying={setIsPlaying}
              onTogglePlay={onTogglePlay}
              onPrev={goPrev}
              onNext={goNext}
            />

            <NowPlayingToast toast={toast} />
          </NowPlayingCard>
        </div>

        <SidebarDrawer open={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        {/* TrackListSheet wiring placeholder: you currently pass open={false} and tracks={[]} which disables it.
            When you’re ready, pass open={isTrackListOpen} and tracks={contextTracks}. */}
        {isTrackListOpen ? (
          <TrackListSheet
            open={isTrackListOpen}
            onClose={() => setIsTrackListOpen(false)}
            artworkUrl={artworkUrl}
            albumTitle={album}
            albumArtist={artist}
            tracks={contextTracks.map((t) => ({
              id: String((t as any).id),
              title: String(t.title || "—"),
              durationSec: t.durationSec ?? null,
              trackNo: (t as any).trackNo ?? null,
            }))}
            currentTrackId={trackId}
            onSelectTrack={(id) => navigateToTrackInSameContext(String(id))}
            preferTrackNo={routeKind === "album"} // albums show trackNo; playlists/favs show index
          />
        ) : null}

        {trackId ? (
          <AddToPlaylistModal
            open={isAddToPlaylistOpen}
            onClose={() => setIsAddToPlaylistOpen(false)}
            trackId={trackId}
            trackTitle={title}
            onToast={(t) => setToast(t)}
          />
        ) : null}
      </div>
    </div>
  );
}
