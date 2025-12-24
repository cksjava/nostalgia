import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { albums as ALBUMS } from "../data/albums";
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
} from "@fortawesome/free-solid-svg-icons";

type ViewMode = "grid" | "list";

export default function AlbumsScreen(props: {
  nowPlaying?: NowPlayingData;
}) {
  const { nowPlaying } = props;

  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [view, setView] = useState<ViewMode>("grid");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close sidebar on Escape (same behavior as NowPlaying)
  useEffect(() => {
    if (!isSidebarOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsSidebarOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isSidebarOpen]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ALBUMS;

    return ALBUMS.filter((a) =>
      [a.title, a.artists.join(" "), a.year?.toString() ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
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
          >
            <FontAwesomeIcon icon={faEllipsisVertical} />
          </button>
        </header>

        {/* Main card */}
        <main className="mx-auto w-full max-w-md px-4 pb-10 pt-4">
          <section className="rounded-[1.75rem] border border-white/10 bg-black/25 shadow-2xl shadow-black/40 backdrop-blur-2xl">
            <div className="p-4">
              {/* Search + view switch */}
              <div className="flex items-center gap-3">
                <div className="flex flex-1 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                  <FontAwesomeIcon
                    icon={faMagnifyingGlass}
                    className="text-white/45"
                  />
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
              <div className="mt-4 pb-2">
                {filtered.length === 0 ? (
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center text-sm text-white/60">
                    No albums found.
                  </div>
                ) : view === "grid" ? (
                  <div className="space-y-3">
                    {filtered.map((album) => (
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
                    {filtered.map((album, idx) => (
                      <AlbumRowList
                        key={album.id}
                        album={album}
                        showDivider={idx !== filtered.length - 1}
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
            </div>
          </section>
        </main>

        {/* Sidebar drawer (shared with Now Playing) */}
        <SidebarDrawer
          open={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      </div>
    </div>
  );
}
