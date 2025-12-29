import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faTrash } from "@fortawesome/free-solid-svg-icons";
import { formatTime } from "../../utils/format";

export type PlaylistTrackRowUI = {
  id: string;
  no: number;
  title: string;
  artist: string;
  album?: string;
  durationSec?: number | null;
};

export function PlaylistTrackRow(props: {
  track: PlaylistTrackRowUI;
  showDivider?: boolean;
  onPlay: (trackNo: number) => void;
  onRemove: () => void;
}) {
  const { track, showDivider = true, onPlay, onRemove } = props;

  return (
    <div>
      <div className="flex w-full items-center gap-3 px-3 py-3">
        <button
          type="button"
          onClick={() => onPlay(track.no)}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/5 text-white/80 transition hover:bg-white/10"
          aria-label="Play"
          title="Play"
        >
          <FontAwesomeIcon icon={faPlay} />
        </button>

        <button
          type="button"
          onClick={() => onPlay(track.no)}
          className="min-w-0 flex-1 text-left"
          title="Play"
        >
          <p className="truncate text-sm font-semibold text-white/90">{track.title}</p>
          <p className="truncate text-xs text-white/55">
            {track.artist}
            {track.album ? ` • ${track.album}` : ""}
          </p>
        </button>

        <div className="shrink-0 text-xs text-white/45 tabular-nums">
          {track.durationSec != null ? formatTime(track.durationSec) : ""}
        </div>

        <button
          type="button"
          onClick={onRemove}
          className="ml-1 rounded-full p-2 text-white/60 hover:bg-white/10 hover:text-white"
          aria-label="Remove from playlist"
          title="Remove from playlist"
        >
          <FontAwesomeIcon icon={faTrash} />
        </button>
      </div>

      {showDivider ? <div className="mx-3 h-px bg-white/10" /> : null}
    </div>
  );
}
