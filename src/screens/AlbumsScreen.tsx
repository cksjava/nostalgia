import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import type { NowPlayingData } from "../types/nowPlaying";

import { AlbumCardGrid } from "../components/albums/AlbumCardGrid";
import { AlbumRowList } from "../components/albums/AlbumRowList";
import { NowPlayingStrip } from "../components/albums/NowPlayingStrip";
import { SidebarDrawer } from "../components/common/SidebarDrawer";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faMagnifyingGlass,
  faList,
  faGrip,
  faMusic,
  faEllipsisVertical,
  faCircleNotch,
  faTriangleExclamation,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";

import { albumsService } from "../api/services/albumsService";
import type { Album as AlbumDto } from "../api/types/models";
import { toBackendUrl } from "../api/utils/url";

type ViewMode = "grid" | "list";

/**
 * UI-friendly album model that your existing cards already expect.
 * Backend doesn't currently expose trackCount or a public cover URL,
 * so we map fields and provide a placeholder image.
 */
export type AlbumUI = {
  id: string;
  title: string;
  artists: string[];
  year?: number;
  trackCount?: number;
  artworkUrl: string;
  // Keep raw DTO if you want later screens to use it:
  raw: AlbumDto;
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

function artistsFromDto(dto: AlbumDto): string[] {
  // Prefer albumArtists (JSON array) if present, else albumArtist (single string)
  const arr = safeJsonArray(dto.albumArtists);
  if (arr.length) return arr;

  const single = dto.albumArtist ? String(dto.albumArtist).trim() : "";
  return single ? [single] : ["Unknown Artist"];
}

export default function AlbumsScreen(props: { nowPlaying?: NowPlayingData }) {
  const { nowPlaying } = props;

  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [view, setView] = useState<ViewMode>("grid");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [albums, setAlbums] = useState<AlbumUI[]>([]);
  const [loading, setLoading] = useState(true);

  const [toast, setToast] = useState<{
    kind: "ok" | "warn" | "err";
    message: string;
  } | null>(null);

  const lastReqId = useRef(0);

  // Close sidebar on Escape (same behavior as NowPlaying)
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

  const loadAlbums = async (search?: string) => {
    const reqId = ++lastReqId.current;
    setLoading(true);
    try {
      const rows = await albumsService.search({
        search: (search || "").trim() || undefined,
        limit: 200,
        offset: 0,
      });

      // Ignore out-of-order responses
      if (reqId !== lastReqId.current) return;

      const mapped: AlbumUI[] = rows.map((dto) => ({
        id: dto.id,
        title: dto.title,
        artists: artistsFromDto(dto),
        year: dto.year ?? undefined,
        // trackCount is not available yet from backend list endpoint:
        trackCount: dto.trackCount,
        artworkUrl: toBackendUrl(dto.coverArtPath),
        raw: dto,
      }));

      setAlbums(mapped);
    } catch (e: any) {
      if (reqId !== lastReqId.current) return;
      setToast({
        kind: "err",
        message: e?.response?.data?.error ?? e?.message ?? "Failed to load albums.",
      });
    } finally {
      if (reqId === lastReqId.current) setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    void loadAlbums("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced search (server-side)
  useEffect(() => {
    const t = window.setTimeout(() => {
      void loadAlbums(query);
    }, 220);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // Same background style as Now Playing
  const bgStyle: React.CSSProperties = {
    backgroundImage: `
      radial-gradient(900px 600px at 18% 20%, rgba(255, 110, 90, 0.45), transparent 60%),
      radial-gradient(900px 600px at 85% 25%, rgba(110, 160, 255, 0.45), transparent 55%),
      radial-gradient(900px 700px at 70% 85%, rgba(190, 120, 255, 0.35), transparent 60%),
      linear-gradient(135deg, rgba(10, 12, 18, 0.92), rgba(8, 10, 16, 0.92))
    `,
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
        {/* Top bar */}
        <header className="mx-auto flex w-full max-w-md items-center justify-between px-4 pt-6">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="rounded-full p-2 text-white/75 hover:bg-white/10 hover:text-white"
            aria-label="Menu"
            title="Menu"
          >
            <FontAwesomeIcon icon={faBars} />
          </button>

          <div className="flex items-center gap-2 text-white/70">
            <FontAwesomeIcon icon={faMusic} className="text-white/60" />
            <span className="text-sm tracking-widest">ALBUMS</span>
          </div>

          <button
            type="button"
            className="rounded-full p-2 text-white/75 hover:bg-white/10 hover:text-white"
            aria-label="More"
            title="More"
            onClick={() => setToast({ kind: "warn", message: "More actions coming soon." })}
          >
            <FontAwesomeIcon icon={faEllipsisVertical} />
          </button>
        </header>

        {/* Main card */}
        <main className="mx-auto w-full max-w-md px-4 pb-10 pt-4">
          <section className="rounded-[1.75rem] border border-white/10 bg-black/25 shadow-2xl shadow-black/40 backdrop-blur-2xl">
            {/* CHANGED: bound height + column layout so only the list scrolls */}
            <div className="flex max-h-[calc(100vh-11.5rem)] flex-col p-4">
              {/* Search + view switch */}
              <div className="flex items-center gap-3">
                <div className="flex flex-1 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                  <FontAwesomeIcon icon={faMagnifyingGlass} className="text-white/45" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search albums, artists…"
                    className="w-full bg-transparent text-sm text-white/90 outline-none placeholder:text-white/40"
                  />
                </div>

                <div className="flex items-center overflow-hidden rounded-xl border border-white/10 bg-white/5">
                  <button
                    type="button"
                    onClick={() => setView("grid")}
                    className={[
                      "px-3 py-2 text-sm transition",
                      view === "grid"
                        ? "bg-white/15 text-white"
                        : "text-white/60 hover:bg-white/10 hover:text-white",
                    ].join(" ")}
                    aria-label="Grid view"
                    title="Grid view"
                  >
                    <FontAwesomeIcon icon={faGrip} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setView("list")}
                    className={[
                      "px-3 py-2 text-sm transition",
                      view === "list"
                        ? "bg-white/15 text-white"
                        : "text-white/60 hover:bg-white/10 hover:text-white",
                    ].join(" ")}
                    aria-label="List view"
                    title="List view"
                  >
                    <FontAwesomeIcon icon={faList} />
                  </button>
                </div>
              </div>

              {/* Optional now playing */}
              {nowPlaying ? <NowPlayingStrip nowPlaying={nowPlaying} /> : null}

              <div className="mt-4 h-px w-full bg-white/10" />

              {/* Albums */}
              {/* CHANGED: this is the scroll container */}
              <div className="mt-4 flex-1 overflow-y-auto pb-2">
                {loading ? (
                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                    <FontAwesomeIcon icon={faCircleNotch} spin className="text-white/60" />
                    Loading albums…
                  </div>
                ) : albums.length === 0 ? (
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center text-sm text-white/60">
                    No albums found.
                  </div>
                ) : view === "grid" ? (
                  <div className="space-y-3">
                    {albums.map((album) => (
                      <AlbumCardGrid
                        key={album.id}
                        album={album}
                        onClick={() =>
                          navigate("/album", {
                            state: { album, nowPlaying },
                          })
                        }
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-white/10 bg-white/5">
                    {albums.map((album, idx) => (
                      <AlbumRowList
                        key={album.id}
                        album={album}
                        showDivider={idx !== albums.length - 1}
                        onClick={() =>
                          navigate("/album", {
                            state: { album, nowPlaying },
                          })
                        }
                      />
                    ))}
                  </div>
                )}
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

        {/* Sidebar drawer */}
        <SidebarDrawer open={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      </div>
    </div>
  );
}
