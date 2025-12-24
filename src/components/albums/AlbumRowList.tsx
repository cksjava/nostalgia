// src/components/albums/AlbumRowList.tsx
import type { Album } from "../../data/albums";

export function AlbumRowList(props: {
  album: Album;
  onClick?: () => void;
  showDivider?: boolean;
}) {
  const { album, onClick, showDivider = true } = props;

  return (
    <div>
      <button
        type="button"
        onClick={onClick}
        className={[
          "flex w-full items-center gap-4 text-left",
          "px-3 py-3",
          "transition hover:bg-white/10",
        ].join(" ")}
      >
        {/* Slightly larger cover */}
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/5">
          <img
            src={album.artworkUrl}
            alt={`${album.title} cover`}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">
            {album.title}
          </p>
          <p className="truncate text-xs text-white/60">
            {album.artists.join(", ")}
          </p>
        </div>

        <div className="shrink-0 text-right text-xs text-white/45">
          <span className="tabular-nums">{album.trackCount ?? 0}</span>
          <span className="ml-1">tracks</span>
        </div>
      </button>

      {/* Thin divider */}
      {showDivider && (
        <div className="mx-3 h-px bg-white/10" />
      )}
    </div>
  );
}
