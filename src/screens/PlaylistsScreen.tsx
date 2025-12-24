import React, { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faListUl,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";

import { playlists as PLAYLISTS, type Playlist } from "../data/playlists";
import { SidebarDrawer } from "../components/common/SidebarDrawer";
import { PlaylistRow } from "../components/playlists/PlaylistRow";
import { useNavigate } from "react-router-dom";

export default function PlaylistsScreen() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  // Close sidebar on Escape (consistent behavior)
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
    if (!q) return PLAYLISTS;
    return PLAYLISTS.filter((p) => p.name.toLowerCase().includes(q));
  }, [query]);

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
            <FontAwesomeIcon icon={faListUl} className="text-white/60" />
            <span className="text-sm tracking-widest">PLAYLISTS</span>
          </div>

          <div className="w-8" />
        </header>

        <main className="mx-auto w-full max-w-md px-4 pb-10 pt-4">
          <section className="rounded-[1.75rem] border border-white/10 bg-black/25 shadow-2xl shadow-black/40 backdrop-blur-2xl">
            <div className="p-4">
              {/* Search (optional but useful and minimal) */}
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <FontAwesomeIcon icon={faMagnifyingGlass} className="text-white/45" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search playlists…"
                  className="w-full bg-transparent text-sm text-white/90 outline-none placeholder:text-white/40"
                />
              </div>

              <div className="mt-4 h-px w-full bg-white/10" />

              {/* List */}
              <div className="mt-3 overflow-hidden rounded-xl border border-white/10 bg-white/5">
                {filtered.length === 0 ? (
                  <div className="p-4 text-center text-sm text-white/60">
                    No playlists found.
                  </div>
                ) : (
                  filtered.map((p: Playlist, idx: number) => (
                    <PlaylistRow
                      key={p.id}
                      playlist={p}
                      showDivider={idx !== filtered.length - 1}
                      onClick={() => navigate(`/playlists/${p.id}`)}
                    />
                  ))
                )}
              </div>
            </div>
          </section>
        </main>

        <SidebarDrawer open={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      </div>
    </div>
  );
}
