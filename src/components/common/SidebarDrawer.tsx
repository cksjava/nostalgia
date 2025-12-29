import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCompactDisc,
  faHeart,
  faLayerGroup,
  faMusic,
  faXmark,
  faGear,
} from "@fortawesome/free-solid-svg-icons";

type DrawerItem = {
  key: string;
  label: string;
  icon: any;
  route: string;
};

const ITEMS: DrawerItem[] = [
  { key: "albums", label: "Albums", icon: faLayerGroup, route: "/albums" },
  { key: "cd", label: "CD Audio", icon: faCompactDisc, route: "/cd" },
  { key: "playlists", label: "Playlists", icon: faMusic, route: "/playlists" },
  { key: "favourites", label: "Favourites", icon: faHeart, route: "/favourites" },
  { key: "settings", label: "Settings", icon: faGear, route: "/settings" },
];

type StoredNowPlaying = {
  artwork?: { url: string; alt?: string };
  track?: { title?: string; artist?: string };
};

export function SidebarDrawer(props: { open: boolean; onClose: () => void }) {
  const { open, onClose } = props;
  const navigate = useNavigate();

  // Prevent background scroll when open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Read now playing from localStorage
  const nowPlaying = useMemo<StoredNowPlaying>(() => {
    try {
      const raw = localStorage.getItem("nowPlaying");
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }, []);

  const artworkUrl =
    nowPlaying.artwork?.url ?? "https://placehold.co/200x200/png?text=No+Audio";
  const artworkAlt = nowPlaying.artwork?.alt ?? "Now playing cover";

  const title = nowPlaying.track?.title ?? "Nothing playing";
  const subtitle = nowPlaying.track?.artist ?? "—";

  return (
    <div
      className={[
        "fixed inset-0 z-40",
        open ? "pointer-events-auto" : "pointer-events-none",
      ].join(" ")}
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <div
        className={[
          "absolute inset-0 transition-opacity",
          open ? "opacity-100" : "opacity-0",
          "bg-black/50",
        ].join(" ")}
        onClick={onClose}
      />

      {/* Panel */}
      <aside
        className={[
          "absolute left-0 top-0 h-full",
          "w-[82%] sm:w-[420px]",
          "transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "-translate-x-full",
          "border-r border-white/10 bg-black/45 backdrop-blur-2xl",
          "shadow-2xl shadow-black/50",
        ].join(" ")}
        role="dialog"
        aria-label="Sidebar menu"
      >
        <div className="flex h-full flex-col">
          {/* Top area */}
          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              {/* CHANGED: make row layout properly constrain text */}
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/5">
                  <img
                    src={artworkUrl}
                    alt={artworkAlt}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>

                {/* CHANGED: flex-1 + min-w-0 ensures truncation actually works */}
                <div className="min-w-0 flex-1">
                  <p className="text-xs tracking-widest text-white/60">NOW PLAYING</p>

                  {/* CHANGED: explicit block + w-full + truncate */}
                  <p className="block w-full truncate text-base font-semibold text-white">
                    {title}
                  </p>

                  {/* CHANGED: explicit block + w-full + truncate */}
                  <p className="block w-full truncate text-sm text-white/70">
                    {subtitle}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="shrink-0 rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white"
                aria-label="Close menu"
                title="Close"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <div className="mt-4 h-px w-full bg-white/10" />
          </div>

          {/* Menu */}
          <nav className="flex-1 px-2 pb-4">
            {ITEMS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  navigate(item.route);
                  onClose();
                }}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-white/80 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/20"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5">
                  <FontAwesomeIcon icon={item.icon} />
                </span>
                <span className="text-sm font-semibold">{item.label}</span>
              </button>
            ))}

            <div className="mt-3 px-4 text-xs text-white/40">
              <FontAwesomeIcon icon={faMusic} className="mr-2" />
              Browse your library and sources.
            </div>
          </nav>
        </div>
      </aside>
    </div>
  );
}
