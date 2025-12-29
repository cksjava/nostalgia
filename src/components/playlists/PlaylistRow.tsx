import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

export type PlaylistRowUI = {
  id: string;
  name: string;
  createdAt: string; // ISO string
  trackCount: number;
};

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export function PlaylistRow(props: {
  playlist: PlaylistRowUI;
  showDivider?: boolean;
  onClick?: () => void;
  onDelete?: () => void;
}) {
  const { playlist, showDivider = true, onClick, onDelete } = props;

  return (
    <div>
      <div className="flex w-full items-center gap-2 px-3 py-3 transition hover:bg-white/10">
        <button type="button" onClick={onClick} className="flex min-w-0 flex-1 items-center gap-3 text-left">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{playlist.name}</p>
            <p className="truncate text-xs text-white/55">Created {formatDate(playlist.createdAt)}</p>
          </div>

          <div className="shrink-0 text-right text-xs text-white/45">
            <span className="tabular-nums">{playlist.trackCount}</span>
            <span className="ml-1">tracks</span>
          </div>
        </button>

        {onDelete ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="shrink-0 rounded-full p-2 text-white/55 hover:bg-white/10 hover:text-white"
            aria-label="Delete playlist"
            title="Delete playlist"
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        ) : null}
      </div>

      {showDivider ? <div className="mx-3 h-px bg-white/10" /> : null}
    </div>
  );
}
