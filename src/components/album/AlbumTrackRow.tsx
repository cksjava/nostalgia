// src/components/album/AlbumTrackRow.tsx
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart,
  faListUl,
  faPlay,
} from "@fortawesome/free-solid-svg-icons";
import type { AlbumTrack } from "../../types/nowPlaying";
import { formatTime } from "../../utils/format";

export function AlbumTrackRow(props: {
  track: AlbumTrack;
  artistLine: string;              // ✅ show artists under track title
  active?: boolean;
  showDivider?: boolean;
  onPlay?: (trackNo: number) => void;      // ✅ clicking row plays
  onAddToPlaylist?: (trackNo: number) => void;
  onAddToFavourites?: (trackNo: number) => void;
}) {
  const {
    track,
    artistLine,
    active,
    showDivider = true,
    onPlay,
    onAddToPlaylist,
    onAddToFavourites,
  } = props;

  return (
    <div>
      <button
        type="button"
        onClick={() => onPlay?.(track.no)}
        className={[
          "flex w-full items-center gap-3 px-3 py-3 text-left transition",
          active ? "bg-white/10" : "hover:bg-white/10",
        ].join(" ")}
      >
        <div
          className={[
            "grid h-10 w-10 shrink-0 place-items-center rounded-xl border",
            active ? "border-white/25 bg-white/10" : "border-white/10 bg-white/5",
          ].join(" ")}
        >
          {active ? (
            <FontAwesomeIcon icon={faPlay} className="text-white/85" />
          ) : (
            <span className="text-sm font-semibold text-white/80">{track.no}</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white/90">
            {track.title}
          </p>
          <p className="truncate text-xs text-white/55">{artistLine}</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Add to playlist */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAddToPlaylist?.(track.no);
            }}
            className="rounded-full p-2 text-white/55 hover:bg-white/10 hover:text-white"
            aria-label="Add to playlist"
            title="Add to playlist"
          >
            <FontAwesomeIcon icon={faListUl} />
          </button>

          {/* Add to favourites */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAddToFavourites?.(track.no);
            }}
            className="rounded-full p-2 text-white/55 hover:bg-white/10 hover:text-white"
            aria-label="Add to favourites"
            title="Add to favourites"
          >
            <FontAwesomeIcon icon={faHeart} />
          </button>

          <div className="w-12 text-right text-xs text-white/45 tabular-nums">
            {track.durationSec != null ? formatTime(track.durationSec) : ""}
          </div>
        </div>
      </button>

      {showDivider ? <div className="mx-3 h-px bg-white/10" /> : null}
    </div>
  );
}
