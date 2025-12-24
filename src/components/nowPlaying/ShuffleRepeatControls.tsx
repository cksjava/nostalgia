import React from "react";
import type { RepeatMode } from "../../types/nowPlaying";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRepeat, faShuffle } from "@fortawesome/free-solid-svg-icons";

export function ShuffleRepeatControls(props: {
  shuffle: boolean;
  setShuffle: React.Dispatch<React.SetStateAction<boolean>>;
  repeatMode: RepeatMode;
  onToggleRepeat: () => void;
}) {
  const { shuffle, setShuffle, repeatMode, onToggleRepeat } = props;

  const repeatLabel = repeatMode === "off" ? "Repeat off" : repeatMode === "one" ? "Repeat one" : "Repeat all";

  return (
    <div className="flex shrink-0 flex-col items-end gap-2">
      <button
        type="button"
        onClick={() => setShuffle((v) => !v)}
        className={[
          "rounded-full border px-3 py-2 text-sm transition",
          shuffle
            ? "border-white/30 bg-white/20 text-white"
            : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white",
        ].join(" ")}
        aria-pressed={shuffle}
        title="Shuffle"
      >
        <FontAwesomeIcon icon={faShuffle} className="mr-2" />
        <span className="hidden sm:inline">Shuffle</span>
        <span className="sm:hidden">{shuffle ? "On" : "Off"}</span>
      </button>

      <button
        type="button"
        onClick={onToggleRepeat}
        className={[
          "rounded-full border px-3 py-2 text-sm transition",
          repeatMode !== "off"
            ? "border-white/30 bg-white/20 text-white"
            : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white",
        ].join(" ")}
        aria-pressed={repeatMode !== "off"}
        title={repeatLabel}
      >
        <FontAwesomeIcon icon={faRepeat} className="mr-2" />
        <span className="hidden sm:inline">{repeatMode === "one" ? "Repeat 1" : "Repeat"}</span>
        <span className="sm:hidden">{repeatMode === "off" ? "Off" : repeatMode === "all" ? "All" : "1"}</span>
      </button>
    </div>
  );
}
