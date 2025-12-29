import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import type { NowPlayingData } from "../types/nowPlaying";
import { AlbumHeader } from "../components/album/AlbumHeader";
import { AlbumTrackRow } from "../components/album/AlbumTrackRow";

import { albumsService } from "../api/services/albumsService";
import { tracksService } from "../api/services/tracksService";
import type { Album as AlbumDto, Track as TrackDto } from "../api/types/models";
import { toBackendUrl } from "../api/utils/url";

import { AddToPlaylistModal } from "../components/playlists/AddToPlaylistModal";
import { SidebarDrawer } from "../components/common/SidebarDrawer";

type LocationState = {
  nowPlaying?: NowPlayingData;
};

type TrackRowUI = {
  no: number;
  title: string;
  duration?: string;
  isFavourite?: boolean;
  trackId?: string;
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

function buildAlbumArtistLineFromDto(albumDto: AlbumDto | null): string {
  if (!albumDto) return "—";

  const arr = safeJsonArray((albumDto as any).albumArtists);
  if (arr.length) return arr.join(", ");

  const single = (albumDto as any).albumArtist ? String((albumDto as any).albumArtist).trim() : "";
  if (single) return single;

  return "—";
}

// ✅ Try to read trackId + albumId from localStorage nowPlaying
function readNowPlayingFromStorage(): { trackId?: string; albumId?: string } {
  try {
    const raw = localStorage.getItem("nowPlaying");
    if (!raw) return {};
    const np = JSON.parse(raw) as any;

    // recommended if you store these (ideal)
    const storedTrackId = np?.track?.id ? String(np.track.id) : undefined;
    const storedAlbumId = np?.album?.id ? String(np.album.id) : undefined;

    // fallback: some implementations put these at top-level
    const fallbackTrackId = np?.trackId ? String(np.trackId) : undefined;
    const fallbackAlbumId = np?.albumId ? String(np.albumId) : undefined;

    return {
      trackId: storedTrackId ?? fallbackTrackId,
      albumId: storedAlbumId ?? fallbackAlbumId,
    };
  } catch {
    return {};
  }
}

export default function AlbumScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as LocationState;

  // ✅ Route: /album/:albumId
  const { albumId } = useParams<{ albumId: string }>();

  const nowPlayingFromState = state.nowPlaying;

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

  // ✅ Sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // ✅ Active highlight should be by trackId (not number)
  const [activeTrackId, setActiveTrackId] = useState<string | undefined>(() => {
    // Prefer state if present (rare), else localStorage
    const stTrackId = (nowPlayingFromState as any)?.track?.id
      ? String((nowPlayingFromState as any).track.id)
      : undefined;

    if (stTrackId) return stTrackId;

    const ls = readNowPlayingFromStorage();
    return ls.trackId;
  });

  // Auto-hide toast
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(t);
  }, [toast]);

  // ✅ Fetch album+tracks based on URL param
  useEffect(() => {
    if (!albumId) {
      setToast({ kind: "err", message: "Album id missing in URL." });
      setLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const dto = (await albumsService.getById(albumId, { withTracks: true })) as any;
        if (cancelled) return;

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
          no: idx + 1, // ✅ always 1..N in UI
          title: String(t.title || `Track ${idx + 1}`),
          duration: formatDuration(t.durationSec),
          isFavourite: !!(t as any).isFavourite,
          trackId: String((t as any).id ?? ""),
        }));

        setTracks(mapped);

        // ✅ Determine active highlight correctly:
        // - If nowPlaying in storage belongs to THIS album and track exists in list -> highlight it
        // - Else: no highlight (don’t force first track)
        const ls = readNowPlayingFromStorage();
        const lsBelongsToThisAlbum = ls.albumId && String(ls.albumId) === String(albumId);
        const existsInThisAlbum = ls.trackId && mapped.some((x) => String(x.trackId) === String(ls.trackId));

        if (lsBelongsToThisAlbum && existsInThisAlbum) {
          setActiveTrackId(String(ls.trackId));
        } else {
          // If you prefer: keep whatever was active earlier (e.g. user clicked),
          // but don't auto-highlight first row.
          setActiveTrackId((prev) => (prev && mapped.some((x) => x.trackId === prev) ? prev : undefined));
        }
      } catch (e: any) {
        if (cancelled) return;
        setToast({
          kind: "err",
          message: e?.response?.data?.error ?? e?.message ?? "Failed to load album.",
        });
        setAlbumDto(null);
        setTracks([]);
        setActiveTrackId(undefined);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [albumId]);

  // Close sidebar on Escape
  useEffect(() => {
    if (!isSidebarOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsSidebarOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isSidebarOpen]);

  const bgStyle: React.CSSProperties = {
    backgroundImage: `
      radial-gradient(900px 600px at 18% 20%, rgba(255, 110, 90, 0.45), transparent 60%),
      radial-gradient(900px 600px at 85% 25%, rgba(110, 160, 255, 0.45), transparent 55%),
      radial-gradient(900px 700px at 70% 85%, rgba(190, 120, 255, 0.35), transparent 60%),
      linear-gradient(135deg, rgba(10, 12, 18, 0.92), rgba(8, 10, 16, 0.92))
    `,
  };

  const albumTitle = String((albumDto as any)?.title ?? "—");
  const albumYear = (albumDto as any)?.year ? Number((albumDto as any).year) : undefined;

  const albumArtistLine = useMemo(() => buildAlbumArtistLineFromDto(albumDto), [albumDto]);

  const albumCoverRaw =
    ((albumDto as any)?.coverArtPath as string | null) ||
    ((albumDto as any)?.artworkUrl as string | null) ||
    "";

  const albumCover = albumCoverRaw ? toBackendUrl(albumCoverRaw) : "";

  const computedTrackCount = tracks.length;

  const onPlayTrack = (trackNo: number) => {
    const tr = tracks.find((x) => x.no === trackNo);
    if (!tr?.trackId) {
      setToast({ kind: "err", message: "Track ID not available." });
      return;
    }

    if (!albumId) {
      setToast({ kind: "err", message: "Album ID not available." });
      return;
    }

    // ✅ update highlight immediately
    setActiveTrackId(tr.trackId);

    // NowPlaying album route: /albums/:albumId/tracks/:trackId (plural)
    navigate(`/albums/${albumId}/tracks/${tr.trackId}`, {
      state: {
        nowPlaying: nowPlayingFromState,
        fromAlbumId: albumId,
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
    setTracks((prev) =>
      prev.map((x) => (x.no === trackNo ? { ...x, isFavourite: nextIsFav } : x))
    );

    try {
      await tracksService.setFavourite(tr.trackId, nextIsFav);
      setToast({
        kind: "ok",
        message: nextIsFav ? "Added to favourites." : "Removed from favourites.",
      });
    } catch (e: any) {
      setTracks((prev) =>
        prev.map((x) => (x.no === trackNo ? { ...x, isFavourite: !nextIsFav } : x))
      );
      setToast({
        kind: "err",
        message: e?.response?.data?.error ?? e?.message ?? "Failed to update favourite.",
      });
    }
  };

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
        <AlbumHeader
          title={albumTitle}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onBack={() => navigate("/albums")}
        />

        <main className="mx-auto w-full max-w-md px-4 pb-10 pt-4">
          <section className="rounded-[1.75rem] border border-white/10 bg-black/25 shadow-2xl shadow-black/40 backdrop-blur-2xl">
            <div className="flex max-h-[calc(100vh-11.5rem)] flex-col p-4">
              {/* Album top area */}
              <div className="flex items-center gap-4">
                <div className="h-24 w-24 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                  <img
                    src={albumCover || "/placeholder.png"}
                    alt={albumCover ? `${albumTitle} cover` : "Album cover"}
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
                        key={t.trackId || `${albumId}:${idx}`}
                        track={t as any}
                        artistLine={albumArtistLine}
                        active={!!t.trackId && !!activeTrackId && String(t.trackId) === String(activeTrackId)}
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

        <SidebarDrawer open={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

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
