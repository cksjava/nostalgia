import { useEffect, useMemo } from "react";
import type { AlbumTrack } from "../../types/nowPlaying";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faPlay } from "@fortawesome/free-solid-svg-icons";
import { formatTime } from "../../utils/format";

export function TrackListSheet(props: {
  open: boolean;
  onClose: () => void;
  artworkUrl: string;
  albumTitle: string;
  albumArtist: string;
  tracks: AlbumTrack[];
  currentTrackNo?: number;
  onSelectTrack?: (trackNo: number) => void;
}) {
  const {
    open,
    onClose,
    artworkUrl,
    albumTitle,
    albumArtist,
    tracks,
    currentTrackNo,
    onSelectTrack,
  } = props;

  // lock body scroll when open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const { current, rest } = useMemo(() => {
    const cur =
      currentTrackNo != null ? tracks.find((t) => t.no === currentTrackNo) : undefined;

    const remaining = cur ? tracks.filter((t) => t.no !== cur.no) : tracks;

    return { current: cur, rest: remaining };
  }, [tracks, currentTrackNo]);

  return (
    <div
      className={[
        "fixed inset-0 z-50",
        open ? "pointer-events-auto" : "pointer-events-none",
      ].join(" ")}
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <div
        className={[
          "absolute inset-0 bg-black/50 transition-opacity",
          open ? "opacity-100" : "opacity-0",
        ].join(" ")}
        onClick={onClose}
      />

      {/* Full-screen sheet */}
      <section
        className={[
          "absolute inset-0",
          "transition-transform duration-300 ease-out",
          open ? "translate-y-0" : "-translate-y-full",
          "bg-black/45 backdrop-blur-2xl",
          "shadow-2xl shadow-black/50",
          "flex flex-col",
        ].join(" ")}
        role="dialog"
        aria-label="Album track list"
      >
        <div className="mx-auto flex h-full w-full max-w-md flex-col px-4 pb-4 pt-4">
          {/* Header row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                <img
                  src={artworkUrl}
                  alt="Album cover"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>

              <div className="min-w-0">
                <p className="text-xs tracking-widest text-white/60">TRACKS</p>
                <p className="truncate text-base font-semibold text-white">
                  {albumTitle}
                </p>
                <p className="truncate text-sm text-white/70">{albumArtist}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white"
              aria-label="Close track list"
              title="Close"
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>

          <div className="mt-4 h-px w-full bg-white/10" />

          {/* Pinned current track */}
          {current && (
            <div className="mt-3">
              <p className="mb-2 text-[11px] tracking-widest text-white/50">
                NOW PLAYING
              </p>

              <button
                type="button"
                onClick={() => onSelectTrack?.(current.no)}
                className="flex w-full items-center gap-3 rounded-2xl bg-white/15 px-3 py-3 text-left text-white transition hover:bg-white/20"
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/25 bg-white/10">
                  <FontAwesomeIcon icon={faPlay} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{current.title}</p>
                  <p className="text-xs text-white/55">
                    {current.durationSec != null ? formatTime(current.durationSec) : ""}
                  </p>
                </div>

                <div className="text-xs text-white/45">
                  {current.durationSec != null ? formatTime(current.durationSec) : ""}
                </div>
              </button>

              <div className="mt-3 h-px w-full bg-white/10" />
            </div>
          )}

          {/* Scrollable list */}
          <div className="mt-3 min-h-0 flex-1 overflow-auto pr-1">
            {rest.map((t) => (
              <button
                key={t.no}
                type="button"
                onClick={() => {
                  onSelectTrack?.(t.no);
                  // onClose();
                }}
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5">
                  <span className="text-sm font-semibold">{t.no}</span>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{t.title}</p>
                  <p className="text-xs text-white/55">
                    {t.durationSec != null ? formatTime(t.durationSec) : ""}
                  </p>
                </div>

                <div className="text-xs text-white/45">
                  {t.durationSec != null ? formatTime(t.durationSec) : ""}
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
