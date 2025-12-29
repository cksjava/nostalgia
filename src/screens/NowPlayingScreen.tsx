import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

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
import type { Track as TrackDto } from "../api/types/models";
import { toBackendUrl } from "../api/utils/url";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { AddToPlaylistModal } from "../components/playlists/AddToPlaylistModal";

export default function NowPlayingScreen() {
  const { trackId } = useParams<{ trackId: string }>();

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

  // Send play signal whenever trackId changes
  useEffect(() => {
    if (!trackId) return;

    let cancelled = false;

    const play = async () => {
      try {
        await tracksService.play(trackId, { positionSec: 0 });
        if (cancelled) return;
        setIsPlaying(true);
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

  // ✅ Keep localStorage "nowPlaying" in sync (for sidebar strip etc.)
  useEffect(() => {
    if (!track) return;

    const albumCoverPath = track.album?.coverArtPath ? String(track.album.coverArtPath) : "";
    const artworkUrl = albumCoverPath ? toBackendUrl(albumCoverPath) : "";

    const title = String(track.title || "Unknown Track");
    const artist = String(track.trackArtist || "Unknown Artist");
    const album = String(track.album?.title || "Unknown Album");

    const durationSec = Number(track.durationSec || 0) || 0;

    try {
      localStorage.setItem(
        "nowPlaying",
        JSON.stringify({
          artwork: { url: artworkUrl, alt: `${title} artwork` },
          track: { title, artist, album, isExplicit: !!(track as any)?.isExplicit },
          playback: { isPlaying, positionSec, durationSec, volume },
          deviceName: "Raspberry Pi",
        } as NowPlayingData)
      );
    } catch {
      // ignore storage errors
    }
  }, [track, isPlaying, positionSec, volume]);

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

  // Optional: make sidebar + tracklist mutually exclusive
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

  const durationSec = Number(track?.durationSec || 0) || 0;

  return (
    <div className="min-h-screen w-full" style={bgStyle}>
      <div className="min-h-screen w-full backdrop-blur-2xl">
        <div className="mx-auto w-full max-w-md px-4 pb-10 pt-6">
          <NowPlayingHeader
            volume={volume}
            isVolumeOpen={isVolumeOpen}
            onToggleVolume={() => setIsVolumeOpen((v) => !v)}
            onOpenSidebar={() => setIsSidebarOpen(true)}
            isTrackListOpen={isTrackListOpen}
            onToggleTrackList={() => setIsTrackListOpen((v) => !v)}
          >
            {isVolumeOpen ? (
              <VolumePopover refEl={volPanelRef} volume={volume} setVolume={setVolume} />
            ) : null}
          </NowPlayingHeader>

          <NowPlayingCard>
            <Artwork src={artworkUrl || "/placeholder.png"} alt={artworkUrl ? `${title} artwork` : "Artwork"} />

            <div className="mt-4">
              <div className="flex items-start justify-between gap-3">
                <TrackMeta
                  title={loading ? "Loading…" : title}
                  artist={loading ? "" : artist}
                  album={loading ? "" : album}
                  isExplicit={!!(track as any)?.isExplicit}
                />

                {/* Right side controls: + (add to playlist) + shuffle/repeat */}
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

            <SeekBar positionSec={positionSec} durationSec={durationSec} onSeek={setPositionSec} />
            <PlaybackControls isPlaying={isPlaying} setIsPlaying={setIsPlaying} />

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

        {/* Add to playlist modal */}
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
