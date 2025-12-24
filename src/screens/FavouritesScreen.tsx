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
} from "@fortawesome/free-solid-svg-icons";

import { SidebarDrawer } from "../components/common/SidebarDrawer";
import { favouriteTracks, type FavouriteTrack } from "../data/favourites";
import { FavouriteTrackRow } from "../components/favourites/FavouriteTrackRow";

export default function FavouritesScreen() {
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [query, setQuery] = useState("");

  // Close sidebar on Escape
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
    if (!q) return favouriteTracks;
    return favouriteTracks.filter((t) =>
      [t.title, t.artist, t.album ?? ""].join(" ").toLowerCase().includes(q)
    );
  }, [query]);

  const bgStyle: React.CSSProperties = {
    backgroundImage: `
      radial-gradient(900px 600px at 18% 20%, rgba(255, 110, 90, 0.45), transparent 60%),
      radial-gradient(900px 600px at 85% 25%, rgba(110, 160, 255, 0.45), transparent 55%),
      radial-gradient(900px 700px at 70% 85%, rgba(190, 120, 255, 0.35), transparent 60%),
      linear-gradient(135deg, rgba(10, 12, 18, 0.92), rgba(8, 10, 16, 0.92))
    `,
  };

  const startPlayback = (trackNo?: number, shuffle = false) => {
    console.log("Favourites playback:", { trackNo, shuffle });
    navigate("/", {
      state: {
        fromSource: "favourites",
        trackNo,
        shuffle,
      },
    });
  };

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
                <p className="text-base font-semibold text-white">Favourite Tracks</p>
                <p className="mt-1 text-xs text-white/55">
                  <span className="tabular-nums">{favouriteTracks.length}</span> tracks
                </p>

                <div className="mt-3 flex gap-3">
                  <button
                    type="button"
                    onClick={() => startPlayback(1, false)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/15"
                  >
                    <FontAwesomeIcon icon={faPlay} />
                    Play
                  </button>

                  <button
                    type="button"
                    onClick={() => startPlayback(undefined, true)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/80 hover:bg-white/10 hover:text-white"
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
                    {filtered.length === 0 ? (
                      <div className="p-4 text-center text-sm text-white/60">
                        No favourites found.
                      </div>
                    ) : (
                      filtered.map((t: FavouriteTrack, idx: number) => (
                        <FavouriteTrackRow
                          key={`${t.no}-${t.title}`}
                          track={t}
                          showDivider={idx !== filtered.length - 1}
                          onPlay={(trackNo) => startPlayback(trackNo, false)}
                        />
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        <SidebarDrawer open={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      </div>
    </div>
  );
}
