import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import type { NowPlayingData, RepeatMode } from "../types/nowPlaying";

import { NowPlayingHeader } from "../components/nowPlaying/NowPlayingHeader";
import { VolumePopover } from "../components/nowPlaying/VolumePopover";
import { NowPlayingCard } from "../components/nowPlaying/NowPlayingCard";
import { Artwork } from "../components/nowPlaying/Artwork";
import { TrackMeta } from "../components/nowPlaying/TrackMeta";
import { ShuffleRepeatControls } from "../components/nowPlaying/ShuffleRepeatControls";
import { SeekBar } from "../components/nowPlaying/SeekBar";
import { PlaybackControls } from "../components/nowPlaying/PlaybackControls";
import { SidebarDrawer } from "../components/common/SidebarDrawer";
import { TrackListSheet } from "../components/nowPlaying/TrackListSheet";

import { tracksService } from "../api/services/tracksService";
import { albumsService } from "../api/services/albumsService";
import { playlistsService } from "../api/services/playlistsService";
import { playerService } from "../api/services/playerService";

import type { Track as TrackDto } from "../api/types/models";
import { toBackendUrl } from "../api/utils/url";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { AddToPlaylistModal } from "../components/playlists/AddToPlaylistModal";

type RouteParams = {
  albumId?: string;
  playlistId?: string;
  trackId?: string;
};

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

export default function NowPlayingScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { albumId, playlistId, trackId } = useParams<RouteParams>();

  const [track, setTrack] = useState<TrackDto | null>(null);
  const [loading, setLoading] = useState(true);

  const [toast, setToast] = useState<{
    kind: "ok" | "warn" | "err";
    message: string;
  } | null>(null);

  // Local UI state (swap with API/websocket later)
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [shuffle, setShuffle] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("off");
  const [positionSec, setPositionSec] = useState<number>(0);
  const [volume, setVolume] = useState<number>(70);

  const [isVolumeOpen, setIsVolumeOpen] = useState(false);
  const volPanelRef = useRef<HTMLDivElement | null>(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTrackListOpen, setIsTrackListOpen] = useState(false);

  const [isAddToPlaylistOpen, setIsAddToPlaylistOpen] = useState(false);

  // Track list for prev/next navigation
  const [contextTracks, setContextTracks] = useState<TrackDto[]>([]);
  const [contextLoading, setContextLoading] = useState(false);

  // Debounce refs
  const seekDebounceRef = useRef<number | null>(null);
  const volDebounceRef = useRef<number | null>(null);

  // Playback ticking refs (to move seekbar immediately)
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

  // Auto-hide toast
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(t);
  }, [toast]);

  // Identify which route family we're in
  const routeKind = useMemo<"album" | "playlist" | "favourites" | "unknown">(() => {
    const p = location.pathname;
    if (p.startsWith("/albums/")) return "album";
    if (p.startsWith("/playlists/")) return "playlist";
    if (p.startsWith("/favourites/")) return "favourites";
    return "unknown";
  }, [location.pathname]);

  // Back button behavior: go to album/playlist/favourites listing
  const onBack = useCallback(() => {
    if (routeKind === "album" && albumId) {
      navigate(`/album/${albumId}`);
      return;
    }
    if (routeKind === "playlist" && playlistId) {
      navigate(`/playlists/${playlistId}`);
      return;
    }
    if (routeKind === "favourites") {
      navigate("/favourites");
      return;
    }
    navigate(-1);
  }, [routeKind, albumId, playlistId, navigate]);

  // Load context tracks (for prev/next)
  useEffect(() => {
    let cancelled = false;

    const loadContext = async () => {
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

    void loadContext();
    return () => {
      cancelled = true;
    };
  }, [routeKind, albumId, playlistId]);

  // Load track details from backend
  useEffect(() => {
    if (!trackId) {
      setToast({ kind: "err", message: "Track id missing in URL." });
      setLoading(false);
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
        setToast({
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
  }, [trackId]);

  // Send play signal whenever trackId changes (existing play API)
  useEffect(() => {
    if (!trackId) return;

    let cancelled = false;

    const play = async () => {
      try {
        await tracksService.play(trackId, { positionSec: 0 });
        if (cancelled) return;

        // reset local playback state so seekbar moves immediately
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
  }, [trackId]);

  const navigateToTrackInSameContext = useCallback(
    (nextTrackId: string) => {
      if (routeKind === "album") {
        if (!albumId) {
          setToast({ kind: "err", message: "albumId missing in URL." });
          return;
        }
        navigate(`/albums/${albumId}/tracks/${nextTrackId}`);
        return;
      }
      if (routeKind === "playlist") {
        if (!playlistId) {
          setToast({ kind: "err", message: "playlistId missing in URL." });
          return;
        }
        navigate(`/playlists/${playlistId}/tracks/${nextTrackId}`);
        return;
      }
      if (routeKind === "favourites") {
        navigate(`/favourites/tracks/${nextTrackId}`);
        return;
      }

      setToast({ kind: "err", message: "Unknown route context for next/previous navigation." });
    },
    [navigate, routeKind, albumId, playlistId]
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
    if (idx < 0) {
      setToast({ kind: "warn", message: "Current track not found in list." });
      return;
    }

    let targetIdx = idx - 1;

    if (targetIdx < 0) {
      if (repeatMode === "all") targetIdx = contextTracks.length - 1;
      else {
        setToast({ kind: "warn", message: "This is the first track." });
        return;
      }
    }

    const nextId = String((contextTracks[targetIdx] as any).id);
    if (!nextId) return;
    navigateToTrackInSameContext(nextId);
  }, [trackId, contextTracks, contextLoading, repeatMode, navigateToTrackInSameContext]);

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
    if (idx < 0) {
      setToast({ kind: "warn", message: "Current track not found in list." });
      return;
    }

    let targetIdx = idx + 1;

    if (targetIdx >= contextTracks.length) {
      if (repeatMode === "all") targetIdx = 0;
      else {
        setToast({ kind: "warn", message: "This is the last track." });
        return;
      }
    }

    const nextId = String((contextTracks[targetIdx] as any).id);
    if (!nextId) return;
    navigateToTrackInSameContext(nextId);
  }, [trackId, contextTracks, contextLoading, repeatMode, navigateToTrackInSameContext]);

  const durationSec = Number(track?.durationSec || 0) || 0;

  const handleTrackEnded = useCallback(async () => {
    if (endedGuardRef.current) return;
    endedGuardRef.current = true;

    if (repeatMode === "one") {
      // restart same track
      try {
        await playerService.seek(0);
      } catch {
        // ignore
      } finally {
        setPositionSec(0);
        lastTickMsRef.current = performance.now();
        endedGuardRef.current = false; // allow end detection again later
      }
      return;
    }

    // "all" and "off" both attempt to goNext; if "off" and last track, we stop.
    if (repeatMode === "off") {
      // try next; if it can't (last track), pause locally
      const idx = contextTracks.findIndex((t: any) => String((t as any).id) === String(trackId));
      const isLast =
        idx >= 0 && contextTracks.length > 0 ? idx === contextTracks.length - 1 : true;

      if (isLast) {
        setIsPlaying(false);
        return;
      }
    }

    goNext();
  }, [repeatMode, goNext, contextTracks, trackId]);

  // ✅ Debounced seek -> backend (used for "preview while dragging")
  const onSeek = useCallback((next: number) => {
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
  }, []);

  // ✅ Commit seek at end of drag (immediate), and if seeking reaches end → go next
  const onSeekEnd = useCallback(
    async (finalPos: number) => {
      // cancel pending debounced seek; we will commit immediately
      if (seekDebounceRef.current) window.clearTimeout(seekDebounceRef.current);

      try {
        await playerService.seek(finalPos);
        setPositionSec(finalPos);
        lastTickMsRef.current = performance.now();

        // if user dragged to (near) end, advance as soon as seeking ends
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
    [durationSec, handleTrackEnded]
  );

  // ✅ Local ticking so the seekbar moves immediately when playback starts
  useEffect(() => {
    // clear any previous timer
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
        if (durationSec > 0 && next >= durationSec) {
          // snap to end; end handler runs in a separate effect below
          return durationSec;
        }
        return next;
      });
    }, 250);

    return () => {
      if (tickTimerRef.current) {
        window.clearInterval(tickTimerRef.current);
        tickTimerRef.current = null;
      }
    };
  }, [isPlaying, durationSec]);

  // ✅ Auto-next when track ends naturally (position reaches duration)
  useEffect(() => {
    if (!isPlaying) return;
    if (durationSec <= 0) return;

    if (positionSec >= Math.max(0, durationSec - 0.05)) {
      void handleTrackEnded();
    }
  }, [positionSec, durationSec, isPlaying, handleTrackEnded]);

  // ✅ Debounced volume -> backend
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
  }, [volume]);

  // ✅ Pause/resume -> backend (called from PlaybackControls)
  const onTogglePlay = useCallback(async (nextIsPlaying: boolean) => {
    await playerService.pause(!nextIsPlaying);
    // keep tick baseline sane
    lastTickMsRef.current = performance.now();
  }, []);

  // ✅ Keep localStorage "nowPlaying" in sync (sidebar strip + album highlight)
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
      // ignore storage errors
    }
  }, [track, trackId, routeKind, albumId, playlistId, isPlaying, positionSec, volume]);

  // Close volume popover on outside click / Escape
  useEffect(() => {
    if (!isVolumeOpen) return;

    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (volPanelRef.current && !volPanelRef.current.contains(t)) setIsVolumeOpen(false);
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsVolumeOpen(false);
    };

    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [isVolumeOpen]);

  // Close sidebar on Escape
  useEffect(() => {
    if (!isSidebarOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsSidebarOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isSidebarOpen]);

  // Close tracklist on Escape
  useEffect(() => {
    if (!isTrackListOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsTrackListOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isTrackListOpen]);

  // Make sidebar + tracklist mutually exclusive
  useEffect(() => {
    if (isSidebarOpen) setIsTrackListOpen(false);
  }, [isSidebarOpen]);
  useEffect(() => {
    if (isTrackListOpen) setIsSidebarOpen(false);
  }, [isTrackListOpen]);

  // Derive UI meta from track
  const title = String(track?.title || "—");
  const artist = String(track?.trackArtist || "—");
  const album = String(track?.album?.title || "—");

  const artworkUrlRaw = track?.album?.coverArtPath ? String(track.album.coverArtPath) : "";
  const artworkUrl = artworkUrlRaw ? toBackendUrl(artworkUrlRaw) : "";

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

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddToPlaylistOpen(true)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white active:scale-[0.98]"
                    aria-label="Add to playlist"
                    title="Add to playlist"
                    disabled={!trackId}
                  >
                    <FontAwesomeIcon icon={faPlus} />
                  </button>

                  <ShuffleRepeatControls
                    shuffle={shuffle}
                    setShuffle={setShuffle}
                    repeatMode={repeatMode}
                    onToggleRepeat={onToggleRepeat}
                  />
                </div>
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

            {toast ? (
              <div className="mt-3">
                <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70">
                  {toast.message}
                </div>
              </div>
            ) : null}
          </NowPlayingCard>
        </div>

        <SidebarDrawer open={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        {trackId && isTrackListOpen ? (
          <TrackListSheet
            open={false}
            onClose={() => setIsTrackListOpen(false)}
            artworkUrl={artworkUrl}
            albumTitle={album}
            albumArtist={artist}
            tracks={[]}
            currentTrackNo={1}
            onSelectTrack={() => {}}
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
