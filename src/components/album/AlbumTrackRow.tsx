import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faListUl, faHeart } from "@fortawesome/free-solid-svg-icons";

type TrackRowUI = {
  no: number;
  title: string;
  duration?: string;
  isFavourite?: boolean;
  trackId?: string;
};

export function AlbumTrackRow(props: {
  track: TrackRowUI;
  artistLine?: string;
  active?: boolean;
  showDivider?: boolean;

  onPlay: (trackNo: number) => void;
  onAddToPlaylist: (trackNo: number) => void;
  onAddToFavourites: (trackNo: number) => void;
}) {
  const { track, artistLine, active, showDivider, onPlay, onAddToPlaylist, onAddToFavourites } =
    props;

  const isFav = !!track.isFavourite;

  const rowBase = "w-full px-3 py-3 text-left transition select-none";
  const rowState = active ? "bg-white/10" : "hover:bg-white/5";
  const titleColor = active ? "text-white" : "text-white/90";
  const metaColor = active ? "text-white/70" : "text-white/60";
  const divider = showDivider ? "border-b border-white/10" : "";

  return (
    <div className={divider}>
      <div
        className={`${rowBase} ${rowState}`}
        onClick={() => onPlay(track.no)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter") onPlay(track.no);
        }}
      >
        <div className="grid grid-cols-[minmax(0,1fr)_2.5rem_2.5rem] items-start gap-2">
          <div className="min-w-0">
            <div className="flex min-w-0 items-start gap-2">
              <span className={`shrink-0 w-7 text-right text-xs ${metaColor} pt-[2px]`}>
                {track.no}.
              </span>

              <div className="min-w-0">
                <p className={`truncate text-sm font-medium ${titleColor}`}>{track.title}</p>

                <div className="mt-0.5 flex items-center gap-2 min-w-0">
                  {artistLine ? (
                    <span className={`truncate text-xs ${metaColor}`}>{artistLine}</span>
                  ) : null}

                  {track.duration ? (
                    <>
                      <span className={`text-xs ${metaColor}`}>•</span>
                      <span className={`text-xs ${metaColor}`}>{track.duration}</span>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAddToPlaylist(track.no);
            }}
            className="h-9 w-9 rounded-xl border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
            aria-label="Add to playlist"
            title="Add to playlist"
          >
            <FontAwesomeIcon icon={faListUl} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAddToFavourites(track.no);
            }}
            className="h-9 w-9 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition"
            aria-label={isFav ? "Remove from favourites" : "Add to favourites"}
            title={isFav ? "Remove from favourites" : "Add to favourites"}
          >
            <FontAwesomeIcon
              icon={faHeart}
              className={isFav ? "text-red-400" : "text-white/45 hover:text-white/70"}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
