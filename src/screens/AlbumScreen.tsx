// src/screens/AlbumScreen.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import type { NowPlayingData } from "../types/nowPlaying";
import type { Album } from "../data/albums";
import { albumTracks } from "../data/albumTracks";

import { AlbumHeader } from "../components/album/AlbumHeader";
import { AlbumTrackRow } from "../components/album/AlbumTrackRow";

type LocationState = {
  album?: Album;
  nowPlaying?: NowPlayingData;
};

export default function AlbumScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as LocationState;

  const album = state.album;
  const nowPlaying = state.nowPlaying;

  // If user refreshed directly on this page, state may be missing
  useEffect(() => {
    if (!album) navigate("/albums");
  }, [album, navigate]);

  const [activeTrackNo, setActiveTrackNo] = useState<number | undefined>(
    nowPlaying?.album?.currentTrackNo
  );

  const tracks = useMemo(() => {
    if (!album) return [];
    return albumTracks[album.id] ?? [];
  }, [album]);

  // Same background style as Now Playing
  const bgStyle: React.CSSProperties = {
    backgroundImage: `
      radial-gradient(900px 600px at 18% 20%, rgba(255, 110, 90, 0.45), transparent 60%),
      radial-gradient(900px 600px at 85% 25%, rgba(110, 160, 255, 0.45), transparent 55%),
      radial-gradient(900px 700px at 70% 85%, rgba(190, 120, 255, 0.35), transparent 60%),
      linear-gradient(135deg, rgba(10, 12, 18, 0.92), rgba(8, 10, 16, 0.92))
    `,
  };

  if (!album) return null;

  const albumArtistLine = album.artists.join(", ");

  const onPlayTrack = (trackNo: number) => {
    setActiveTrackNo(trackNo);

    // Navigate to Now Playing screen when a track is clicked
    // (Later you'll hook this to your actual playback controller)
    navigate("/", {
      state: {
        // optional: pass hints to NowPlaying screen if you want to use it later
        fromAlbumId: album.id,
        fromTrackNo: trackNo,
      },
    });
  };

  return (
    <div className="min-h-screen w-full" style={bgStyle}>
      <div className="min-h-screen w-full backdrop-blur-2xl">
        {/* Header only (no hamburger here) */}
        <AlbumHeader title={album.title} onBack={() => navigate(-1)} />

        <main className="mx-auto w-full max-w-md px-4 pb-10 pt-4">
          <section className="rounded-[1.75rem] border border-white/10 bg-black/25 shadow-2xl shadow-black/40 backdrop-blur-2xl">
            <div className="p-4">
              {/* Album top area */}
              <div className="flex items-center gap-4">
                <div className="h-24 w-24 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                  <img
                    src={album.artworkUrl}
                    alt={`${album.title} cover`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-lg font-semibold text-white">
                    {album.title}
                  </p>
                  <p className="truncate text-sm text-white/65">{albumArtistLine}</p>
                  <p className="mt-1 text-xs text-white/45">
                    {album.year ? `${album.year}` : ""}
                    {album.year && album.trackCount ? " • " : ""}
                    {album.trackCount ? `${album.trackCount} tracks` : ""}
                  </p>
                </div>
              </div>

              <div className="mt-4 h-px w-full bg-white/10" />

              {/* Tracks */}
              <div className="mt-4">
                <p className="mb-2 text-xs tracking-widest text-white/50">TRACKS</p>

                {tracks.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center text-sm text-white/60">
                    No tracks found for this album.
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                    {tracks.map((t, idx) => (
                      <AlbumTrackRow
                        key={t.no}
                        track={t}
                        artistLine={albumArtistLine} // ✅ show artists under track title
                        active={activeTrackNo === t.no}
                        showDivider={idx !== tracks.length - 1}
                        onPlay={onPlayTrack}
                        onAddToPlaylist={(trackNo) => {
                          console.log("Add to playlist:", {
                            albumId: album.id,
                            trackNo,
                          });
                        }}
                        onAddToFavourites={(trackNo) => {
                          console.log("Add to favourites:", {
                            albumId: album.id,
                            trackNo,
                          });
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
