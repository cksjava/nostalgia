// src/screens/NowPlayingScreen.tsx
import React, { useEffect, useRef, useState } from "react";
import nowPlayingRaw from "../data/nowPlayingData.json";
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

export default function NowPlayingScreen() {
  const data = nowPlayingRaw as NowPlayingData;

  // Local UI state (swap with API/websocket later)
  const [isPlaying, setIsPlaying] = useState<boolean>(data.playback.isPlaying);
  const [shuffle, setShuffle] = useState<boolean>(data.playback.shuffle);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>(data.playback.repeatMode);
  const [positionSec, setPositionSec] = useState<number>(data.playback.positionSec);
  const [volume, setVolume] = useState<number>(data.playback.volume);

  const [isVolumeOpen, setIsVolumeOpen] = useState(false);
  const volPanelRef = useRef<HTMLDivElement | null>(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTrackListOpen, setIsTrackListOpen] = useState(false);

  const durationSec = data.playback.durationSec;

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

  // ✅ Initialize / keep localStorage "nowPlaying" in sync
  useEffect(() => {
    try {
      localStorage.setItem(
        "nowPlaying",
        JSON.stringify({
          artwork: {
            url: data.artwork.url,
            alt: data.artwork.alt,
          },
          track: {
            title: data.track.title,
            artist: data.track.artist,
            album: data.track.album,
          },
          playback: {
            isPlaying,
            positionSec,
            durationSec: data.playback.durationSec,
            volume,
          },
          deviceName: data.deviceName,
        })
      );
    } catch {
      // ignore storage errors (private mode / quota)
    }
    // Keep it updated for the sidebar and other screens
  }, [data, isPlaying, positionSec, volume]);

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
            <Artwork src={data.artwork.url} alt={data.artwork.alt} />

            <div className="mt-5">
              <div className="flex items-start justify-between gap-3">
                <TrackMeta
                  title={data.track.title}
                  artist={data.track.artist}
                  album={data.track.album}
                  isExplicit={data.track.isExplicit}
                />

                <ShuffleRepeatControls
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
              onSeek={setPositionSec}
            />

            <PlaybackControls isPlaying={isPlaying} setIsPlaying={setIsPlaying} />
          </NowPlayingCard>
        </div>

        {/* ✅ SidebarDrawer is now independent: only open/onClose */}
        <SidebarDrawer open={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        {data.album?.tracks?.length ? (
          <TrackListSheet
            open={isTrackListOpen}
            onClose={() => setIsTrackListOpen(false)}
            artworkUrl={data.artwork.url}
            albumTitle={data.album.title}
            albumArtist={data.album.artist}
            tracks={data.album.tracks}
            currentTrackNo={data.album.currentTrackNo}
            onSelectTrack={(trackNo) => {
              console.log("Selected track:", trackNo);
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
