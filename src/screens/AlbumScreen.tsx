import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import type { NowPlayingData } from "../types/nowPlaying";
import { AlbumHeader } from "../components/album/AlbumHeader";
import { AlbumTrackRow } from "../components/album/AlbumTrackRow";

import { albumsService } from "../api/services/albumsService";
import { tracksService } from "../api/services/tracksService";
import type { Album as AlbumDto, Track as TrackDto } from "../api/types/models";
import { toBackendUrl } from "../api/utils/url";

import { AddToPlaylistModal } from "../components/playlists/AddToPlaylistModal";

// From AlbumsScreen we navigate with state: { album, nowPlaying }
// album is AlbumUI (defined in AlbumsScreen). We avoid importing from screen to prevent circular deps.
type AlbumUI = {
  id: string;
  title: string;
  artists: string[];
  year?: number;
  trackCount?: number;
  artworkUrl: string;
  raw?: AlbumDto;
};

type LocationState = {
  album?: AlbumUI;
  nowPlaying?: NowPlayingData;
};

type TrackRowUI = {
  no: number; // used by your AlbumTrackRow key and handlers
  title: string;
  duration?: string;
  isFavourite?: boolean;
  trackId?: string; // useful for backend actions
};

function safeJsonArray(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map((x) => String(x)).filter(Boolean);
    return [];
  } catch {
    return [];
  }
}

function formatDuration(sec: number | null | undefined): string | undefined {
  if (!sec || !Number.isFinite(sec) || sec <= 0) return undefined;
  const s = Math.round(sec);
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${mm}:${String(ss).padStart(2, "0")}`;
}

function normalizeTrackNo(t: TrackDto, idx: number): number {
  const n = t.trackNo != null ? Number(t.trackNo) : NaN;
  if (Number.isFinite(n) && n > 0) return n;
  return idx + 1;
}

function buildAlbumArtistLineFromDto(albumDto: AlbumDto | null, fallback: string[]): string {
  if (!albumDto) return fallback.join(", ");

  const arr = safeJsonArray(albumDto.albumArtists);
  if (arr.length) return arr.join(", ");

  const single = albumDto.albumArtist ? String(albumDto.albumArtist).trim() : "";
  if (single) return single;

  return fallback.join(", ");
}

export default function AlbumScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as LocationState;

  const initialAlbum = state.album;
  const nowPlaying = state.nowPlaying;

  // If user refreshed directly on this page, state may be missing
  useEffect(() => {
    if (!initialAlbum) navigate("/albums");
  }, [initialAlbum, navigate]);

  const [activeTrackNo, setActiveTrackNo] = useState<number | undefined>(
    nowPlaying?.album?.currentTrackNo
  );

  const [albumDto, setAlbumDto] = useState<(AlbumDto & { tracks?: TrackDto[] }) | null>(null);
  const [tracks, setTracks] = useState<TrackRowUI[]>([]);
  const [loading, setLoading] = useState(true);

  const [toast, setToast] = useState<{
    kind: "ok" | "warn" | "err";
    message: string;
  } | null>(null);

  // ✅ Add-to-playlist modal state
  const [isAddToPlaylistOpen, setIsAddToPlaylistOpen] = useState(false);
  const [addTrackId, setAddTrackId] = useState<string | null>(null);
  const [addTrackTitle, setAddTrackTitle] = useState<string | undefined>(undefined);

  // Auto-hide toast
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(t);
  }, [toast]);

  const albumId = initialAlbum?.id;

  useEffect(() => {
    if (!albumId) return;

    const load = async () => {
      setLoading(true);
      try {
        const dto = (await albumsService.getById(albumId, { withTracks: true })) as any;
        setAlbumDto(dto);

        const dtoTracks: TrackDto[] = Array.isArray(dto?.tracks) ? dto.tracks : [];

        // Sort by discNo then trackNo then title as stable fallback
        dtoTracks.sort((a, b) => {
          const ad = a.discNo != null ? Number(a.discNo) : 0;
          const bd = b.discNo != null ? Number(b.discNo) : 0;
          if (ad !== bd) return ad - bd;

          const an = a.trackNo != null ? Number(a.trackNo) : 0;
          const bn = b.trackNo != null ? Number(b.trackNo) : 0;
          if (an !== bn) return an - bn;

          return String(a.title || "").localeCompare(String(b.title || ""));
        });

        const mapped: TrackRowUI[] = dtoTracks.map((t, idx) => ({
          no: normalizeTrackNo(t, idx),
          title: String(t.title || `Track ${idx + 1}`),
          duration: formatDuration(t.durationSec),
          isFavourite: !!(t as any).isFavourite,
          trackId: (t as any).id,
        }));

        setTracks(mapped);
      } catch (e: any) {
        setToast({
          kind: "err",
          message: e?.response?.data?.error ?? e?.message ?? "Failed to load album.",
        });
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [albumId]);

  // Same background style as Now Playing
  const bgStyle: React.CSSProperties = {
    backgroundImage: `
      radial-gradient(900px 600px at 18% 20%, rgba(255, 110, 90, 0.45), transparent 60%),
      radial-gradient(900px 600px at 85% 25%, rgba(110, 160, 255, 0.45), transparent 55%),
      radial-gradient(900px 700px at 70% 85%, rgba(190, 120, 255, 0.35), transparent 60%),
      linear-gradient(135deg, rgba(10, 12, 18, 0.92), rgba(8, 10, 16, 0.92))
    `,
  };

  if (!initialAlbum) return null;

  const albumArtistLine = useMemo(
    () => buildAlbumArtistLineFromDto(albumDto, initialAlbum.artists),
    [albumDto, initialAlbum.artists]
  );

  const albumTitle = albumDto?.title ?? initialAlbum.title;
  const albumYear = albumDto?.year ?? initialAlbum.year;
  const albumCoverRaw = (albumDto?.coverArtPath as string | null) || initialAlbum.artworkUrl;

  const albumCover = albumCoverRaw ? toBackendUrl(albumCoverRaw) : albumCoverRaw;

  const computedTrackCount = tracks.length || initialAlbum.trackCount;

  const onPlayTrack = (trackNo: number) => {
    setActiveTrackNo(trackNo);

    const tr = tracks.find((x) => x.no === trackNo);
    if (!tr?.trackId) {
      setToast({ kind: "err", message: "Track ID not available." });
      return;
    }

    navigate(`/now-playing/${tr.trackId}`, {
      state: {
        nowPlaying,
        fromAlbumId: initialAlbum.id,
        fromTrackNo: trackNo,
      },
    });
  };

  const onAddToFavourites = async (trackNo: number) => {
    const tr = tracks.find((x) => x.no === trackNo);
    if (!tr?.trackId) {
      setToast({ kind: "err", message: "Track ID not available." });
      return;
    }

    const nextIsFav = !tr.isFavourite;
    setTracks((prev) => prev.map((x) => (x.no === trackNo ? { ...x, isFavourite: nextIsFav } : x)));

    try {
      await tracksService.setFavourite(tr.trackId, nextIsFav);
      setToast({
        kind: "ok",
        message: nextIsFav ? "Added to favourites." : "Removed from favourites.",
      });
    } catch (e: any) {
      setTracks((prev) => prev.map((x) => (x.no === trackNo ? { ...x, isFavourite: !nextIsFav } : x)));
      setToast({
        kind: "err",
        message: e?.response?.data?.error ?? e?.message ?? "Failed to update favourite.",
      });
    }
  };

  // ✅ Open add-to-playlist for a specific track
  const onAddToPlaylist = (trackNo: number) => {
    const tr = tracks.find((x) => x.no === trackNo);
    if (!tr?.trackId) {
      setToast({ kind: "err", message: "Track ID not available." });
      return;
    }
    setAddTrackId(String(tr.trackId));
    setAddTrackTitle(tr.title);
    setIsAddToPlaylistOpen(true);
  };

  const toastStyle =
    toast?.kind === "ok"
      ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-100"
      : toast?.kind === "warn"
      ? "border-amber-400/20 bg-amber-500/10 text-amber-100"
      : "border-rose-400/20 bg-rose-500/10 text-rose-100";

  return (
    <div className="min-h-screen w-full" style={bgStyle}>
      <div className="min-h-screen w-full backdrop-blur-2xl">
        <AlbumHeader title={albumTitle} onBack={() => navigate(-1)} />

        <main className="mx-auto w-full max-w-md px-4 pb-10 pt-4">
          <section className="rounded-[1.75rem] border border-white/10 bg-black/25 shadow-2xl shadow-black/40 backdrop-blur-2xl">
            <div className="flex max-h-[calc(100vh-11.5rem)] flex-col p-4">
              {/* Album top area */}
              <div className="flex items-center gap-4">
                <div className="h-24 w-24 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                  <img
                    src={albumCover}
                    alt={`${albumTitle} cover`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-lg font-semibold text-white">{albumTitle}</p>
                  <p className="truncate text-sm text-white/65">{albumArtistLine}</p>
                  <p className="mt-1 text-xs text-white/45">
                    {albumYear ? `${albumYear}` : ""}
                    {albumYear && computedTrackCount ? " • " : ""}
                    {computedTrackCount ? `${computedTrackCount} tracks` : ""}
                  </p>
                </div>
              </div>

              <div className="mt-4 h-px w-full bg-white/10" />

              {/* Tracks */}
              <div className="mt-4 flex min-h-0 flex-1 flex-col">
                <p className="mb-2 text-xs tracking-widest text-white/50">TRACKS</p>

                {loading ? (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center text-sm text-white/60">
                    Loading tracks…
                  </div>
                ) : tracks.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center text-sm text-white/60">
                    No tracks found for this album.
                  </div>
                ) : (
                  <div className="min-h-0 flex-1 overflow-y-auto rounded-2xl border border-white/10 bg-white/5">
                    {tracks.map((t, idx) => (
                      <AlbumTrackRow
                        key={t.no}
                        track={t as any}
                        artistLine={albumArtistLine}
                        active={activeTrackNo === t.no}
                        showDivider={idx !== tracks.length - 1}
                        onPlay={onPlayTrack}
                        onAddToPlaylist={onAddToPlaylist}
                        onAddToFavourites={(trackNo) => void onAddToFavourites(trackNo)}
                      />
                    ))}
                  </div>
                )}

                {toast && (
                  <div className="mt-3">
                    <div className={`rounded-xl border px-3 py-2 text-sm ${toastStyle}`}>
                      {toast.message}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        </main>

        {/* ✅ Add to playlist modal */}
        {addTrackId ? (
          <AddToPlaylistModal
            open={isAddToPlaylistOpen}
            onClose={() => setIsAddToPlaylistOpen(false)}
            trackId={addTrackId}
            trackTitle={addTrackTitle}
            onToast={(t) => setToast(t)}
          />
        ) : null}
      </div>
    </div>
  );
}
