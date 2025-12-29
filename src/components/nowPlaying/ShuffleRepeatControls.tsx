// src/components/nowPlaying/ShuffleRepeatControls.tsx
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

  const repeatLabel =
    repeatMode === "off" ? "Repeat off" : repeatMode === "one" ? "Repeat one" : "Repeat all";

  const base =
    "h-10 w-10 rounded-full border inline-flex items-center justify-center text-sm transition active:scale-[0.98]";
  const on = "border-white/30 bg-white/20 text-white";
  const off = "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white";

  return (
    <div className="flex shrink-0 items-center gap-2">
      <button
        type="button"
        onClick={() => setShuffle((v) => !v)}
        className={[base, shuffle ? on : off].join(" ")}
        aria-pressed={shuffle}
        aria-label="Shuffle"
        title="Shuffle"
      >
        <FontAwesomeIcon icon={faShuffle} />
      </button>

      <button
        type="button"
        onClick={onToggleRepeat}
        className={[base, repeatMode !== "off" ? on : off].join(" ")}
        aria-pressed={repeatMode !== "off"}
        aria-label={repeatLabel}
        title={repeatLabel}
      >
        <FontAwesomeIcon icon={faRepeat} />
      </button>
    </div>
  );
}
