import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay } from "@fortawesome/free-solid-svg-icons";
import { formatTime } from "../../utils/format";
import type { Track } from "../../api/types/models";
// import type { FavouriteTrack } from "../../data/favourites";

export function FavouriteTrackRow(props: {
  track: Track;
  showDivider?: boolean;
  onPlay: (trackNo: string) => void;
}) {
  const { track, showDivider = true, onPlay } = props;

  return (
    <div>
      <button
        type="button"
        onClick={() => onPlay(track.id)}
        className="flex w-full items-center gap-3 px-3 py-3 text-left transition hover:bg-white/10"
      >
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/5 text-white/80">
          <FontAwesomeIcon icon={faPlay} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white/90">{track.title}</p>
          <p className="truncate text-xs text-white/55">
            {track.trackArtist}
            {track.album ? ` • ${track.album}` : ""}
          </p>
        </div>

        <div className="shrink-0 text-xs text-white/45 tabular-nums">
          {track.durationSec != null ? formatTime(track.durationSec) : ""}
        </div>
      </button>

      {showDivider ? <div className="mx-3 h-px bg-white/10" /> : null}
    </div>
  );
}
