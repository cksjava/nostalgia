import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay } from "@fortawesome/free-solid-svg-icons";
import type { AlbumTrack } from "../../types/nowPlaying";
import { formatTime } from "../../utils/format";

export function CdTrackRow(props: {
  track: AlbumTrack;
  showDivider?: boolean;
  onPlay: (trackNo: number) => void;
}) {
  const { track, showDivider = true, onPlay } = props;

  return (
    <div>
      <button
        type="button"
        onClick={() => onPlay(track.no)}
        className="flex w-full items-center gap-3 px-3 py-3 text-left hover:bg-white/10"
      >
        <div className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/5 text-white/80">
          <FontAwesomeIcon icon={faPlay} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">
            {track.title}
          </p>
        </div>

        <div className="text-xs text-white/45 tabular-nums">
          {track.durationSec ? formatTime(track.durationSec) : ""}
        </div>
      </button>

      {showDivider && <div className="mx-3 h-px bg-white/10" />}
    </div>
  );
}
