import type { Playlist } from "../../data/playlists";

function formatDate(iso: string) {
  // Minimal + safe formatting without extra deps
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}

export function PlaylistRow(props: {
  playlist: Playlist;
  showDivider?: boolean;
  onClick?: () => void;
}) {
  const { playlist, showDivider = true, onClick } = props;

  return (
    <div>
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center gap-3 px-3 py-3 text-left transition hover:bg-white/10"
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">
            {playlist.name}
          </p>
          <p className="truncate text-xs text-white/55">
            Created {formatDate(playlist.createdAt)}
          </p>
        </div>

        <div className="shrink-0 text-right text-xs text-white/45">
          <span className="tabular-nums">{playlist.trackCount}</span>
          <span className="ml-1">tracks</span>
        </div>
      </button>

      {showDivider ? <div className="mx-3 h-px bg-white/10" /> : null}
    </div>
  );
}
