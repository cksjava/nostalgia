import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faBars,
  faHeart,
  faMagnifyingGlass,
  faPlay,
  faShuffle,
  faCircleNotch,
  faTriangleExclamation,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";

import { SidebarDrawer } from "../components/common/SidebarDrawer";
import { FavouriteTrackRow } from "../components/favourites/FavouriteTrackRow";

import { tracksService } from "../api/services/tracksService";
import type { Track } from "../api/types/models";
import { toBackendUrl } from "../api/utils/url";

type FavouriteTrackUI = {
  no: number;
  title: string;
  artist: string;
  album?: string;
  duration?: string;
  artworkUrl?: string;

  trackId: string;
};

function formatDuration(sec: number | null | undefined): string | undefined {
  if (!sec || !Number.isFinite(sec) || sec <= 0) return undefined;
  const s = Math.round(sec);
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${mm}:${String(ss).padStart(2, "0")}`;
}

function safeJsonArray(raw: any): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(String(raw));
    if (Array.isArray(parsed)) return parsed.map((x) => String(x)).filter(Boolean);
    return [];
  } catch {
    return [];
  }
}

function mapTrackToUI(t: Track, idx: number): FavouriteTrackUI {
  const trackNo = (t as any).trackNo != null && Number((t as any).trackNo) > 0 ? Number((t as any).trackNo) : idx + 1;

  const trackArtists = safeJsonArray((t as any).trackArtists);
  const artist =
    String((t as any).trackArtist || "").trim() ||
    (trackArtists.length ? trackArtists.join(", ") : "") ||
    String((t as any).albumArtist || "").trim() ||
    "Unknown Artist";

  const albumTitle = String((t as any)?.album?.title || "").trim() || undefined;

  const coverRaw = (t as any)?.album?.coverArtPath || "";
  const artworkUrl = coverRaw ? toBackendUrl(String(coverRaw)) : undefined;

  return {
    no: trackNo,
    title: String((t as any).title || `Track ${trackNo}`),
    artist,
    album: albumTitle,
    duration: formatDuration((t as any).durationSec),
    artworkUrl,
    trackId: String((t as any).id),
  };
}

export default function FavouritesScreen() {
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [query, setQuery] = useState("");

  const [tracks, setTracks] = useState<FavouriteTrackUI[]>([]);
  const [loading, setLoading] = useState(true);

  const [toast, setToast] = useState<{
    kind: "ok" | "warn" | "err";
    message: string;
  } | null>(null);

  // Close sidebar on Escape
  useEffect(() => {
    if (!isSidebarOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsSidebarOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isSidebarOpen]);

  // Auto-hide toast
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(t);
  }, [toast]);

  const load = async () => {
    setLoading(true);
    try {
      const favs = await tracksService.search({
        favourite: 1,
        withAlbum: 1,
        limit: 5000,
        offset: 0,
      });

      setTracks((favs || []).map(mapTrackToUI));
      setToast(null);
    } catch (e: any) {
      setToast({
        kind: "err",
        message: e?.response?.data?.error ?? e?.message ?? "Failed to load favourites.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tracks;
    return tracks.filter((t) =>
      [t.title, t.artist, t.album ?? ""].join(" ").toLowerCase().includes(q)
    );
  }, [query, tracks]);

  const bgStyle: React.CSSProperties = {
    backgroundImage: `
      radial-gradient(900px 600px at 18% 20%, rgba(255, 110, 90, 0.45), transparent 60%),
      radial-gradient(900px 600px at 85% 25%, rgba(110, 160, 255, 0.45), transparent 55%),
      radial-gradient(900px 700px at 70% 85%, rgba(190, 120, 255, 0.35), transparent 60%),
      linear-gradient(135deg, rgba(10, 12, 18, 0.92), rgba(8, 10, 16, 0.92))
    `,
  };

  const startPlayback = (trackNo?: string, shuffle = false) => {
    navigate("/", {
      state: { fromSource: "favourites", trackNo, shuffle },
    });
  };

  const toastIcon =
    toast?.kind === "ok"
      ? faCheck
      : toast?.kind === "warn"
      ? faTriangleExclamation
      : faTriangleExclamation;

  const toastStyle =
    toast?.kind === "ok"
      ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-100"
      : toast?.kind === "warn"
      ? "border-amber-400/20 bg-amber-500/10 text-amber-100"
      : "border-rose-400/20 bg-rose-500/10 text-rose-100";

  return (
    <div className="min-h-screen w-full" style={bgStyle}>
      <div className="min-h-screen w-full backdrop-blur-2xl">
        {/* Top bar: Back + Menu */}
        <header className="mx-auto flex w-full max-w-md items-center justify-between px-4 pt-6">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="rounded-full p-2 text-white/75 hover:bg-white/10 hover:text-white"
              aria-label="Back"
              title="Back"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
            </button>

            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="rounded-full p-2 text-white/75 hover:bg-white/10 hover:text-white"
              aria-label="Menu"
              title="Menu"
            >
              <FontAwesomeIcon icon={faBars} />
            </button>
          </div>

          <div className="flex items-center gap-2 text-white/70">
            <FontAwesomeIcon icon={faHeart} className="text-white/60" />
            <span className="text-sm tracking-widest">FAVOURITES</span>
          </div>

          <div className="w-8" />
        </header>

        <main className="mx-auto w-full max-w-md px-4 pb-10 pt-4">
          <section className="rounded-[1.75rem] border border-white/10 bg-black/25 shadow-2xl shadow-black/40 backdrop-blur-2xl">
            <div className="flex h-[78vh] flex-col p-4">
              {/* Top container */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-white">Favourite Tracks</p>
                    <p className="mt-1 text-xs text-white/55">
                      <span className="tabular-nums">{tracks.length}</span> tracks
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => void load()}
                    className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/15 disabled:opacity-60"
                    disabled={loading}
                    title="Reload"
                  >
                    {loading ? (
                      <>
                        <FontAwesomeIcon icon={faCircleNotch} spin className="mr-2" />
                        Loading…
                      </>
                    ) : (
                      "Reload"
                    )}
                  </button>
                </div>

                <div className="mt-3 flex gap-3">
                  <button
                    type="button"
                    onClick={() => startPlayback("1", false)}
                    disabled={tracks.length === 0}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/15 disabled:opacity-60"
                  >
                    <FontAwesomeIcon icon={faPlay} />
                    Play
                  </button>

                  <button
                    type="button"
                    onClick={() => startPlayback(undefined, true)}
                    disabled={tracks.length === 0}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/80 hover:bg-white/10 hover:text-white disabled:opacity-60"
                  >
                    <FontAwesomeIcon icon={faShuffle} />
                    Shuffle
                  </button>
                </div>

                {/* Search */}
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                  <FontAwesomeIcon icon={faMagnifyingGlass} className="text-white/45" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search favourites…"
                    className="w-full bg-transparent text-sm text-white/90 outline-none placeholder:text-white/40"
                  />
                </div>
              </div>

              {/* Track list container */}
              <div className="mt-4 min-h-0 flex-1">
                <div className="h-full overflow-hidden rounded-xl border border-white/10 bg-white/5">
                  <div className="h-full overflow-auto">
                    {loading ? (
                      <div className="flex items-center justify-center gap-2 p-4 text-sm text-white/60">
                        <FontAwesomeIcon icon={faCircleNotch} spin className="text-white/60" />
                        Loading favourites…
                      </div>
                    ) : filtered.length === 0 ? (
                      <div className="p-4 text-center text-sm text-white/60">
                        No favourites found.
                      </div>
                    ) : (
                      filtered.map((t, idx) => (
                        <FavouriteTrackRow
                          key={t.trackId}
                          track={t as any}
                          showDivider={idx !== filtered.length - 1}
                          onPlay={(trackNo: string) => startPlayback(trackNo, false)}
                        />
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Toast */}
              {toast && (
                <div className="mt-3">
                  <div className={`flex items-start gap-2 rounded-xl border px-3 py-2 text-sm ${toastStyle}`}>
                    <FontAwesomeIcon icon={toastIcon} className="mt-0.5 shrink-0" />
                    <span className="leading-snug">{toast.message}</span>
                  </div>
                </div>
              )}
            </div>
          </section>
        </main>

        <SidebarDrawer open={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      </div>
    </div>
  );
}
