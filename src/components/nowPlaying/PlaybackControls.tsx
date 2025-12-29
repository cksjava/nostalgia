import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBackwardStep,
  faForwardStep,
  faPause,
  faPlay,
} from "@fortawesome/free-solid-svg-icons";

export function PlaybackControls(props: {
  isPlaying: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;

  // optional hook to call backend pause/resume
  onTogglePlay?: (nextIsPlaying: boolean) => Promise<void> | void;

  onPrev?: () => void;
  onNext?: () => void;
  disablePrev?: boolean;
  disableNext?: boolean;
}) {
  const {
    isPlaying,
    setIsPlaying,
    onTogglePlay,
    onPrev,
    onNext,
    disablePrev,
    disableNext,
  } = props;

  const handleToggle = async () => {
    const next = !isPlaying;

    // ✅ If going from paused -> playing: UI only (no backend call)
    if (next === true) {
      setIsPlaying(true);
      return;
    }

    // ✅ If going from playing -> paused: optimistic + backend call
    setIsPlaying(false);

    try {
      await onTogglePlay?.(false);
    } catch {
      // revert if backend failed
      setIsPlaying(true);
    }
  };

  return (
    <div className="mt-6 flex items-center justify-center gap-6">
      <button
        type="button"
        onClick={onPrev}
        disabled={!onPrev || disablePrev}
        className={[
          "rounded-full bg-white/10 p-4 text-white/80 hover:bg-white/15 hover:text-white",
          !onPrev || disablePrev
            ? "cursor-not-allowed opacity-40 hover:bg-white/10 hover:text-white/80"
            : "",
        ].join(" ")}
        aria-label="Previous"
        title="Previous"
      >
        <FontAwesomeIcon icon={faBackwardStep} size="lg" />
      </button>

      <button
        type="button"
        onClick={handleToggle}
        className="h-18 w-18 rounded-full bg-white/20 text-white shadow-lg shadow-black/30 hover:bg-white/25"
        aria-label={isPlaying ? "Pause" : "Play"}
        title={isPlaying ? "Pause" : "Play"}
      >
        <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} size="xl" />
      </button>

      <button
        type="button"
        onClick={onNext}
        disabled={!onNext || disableNext}
        className={[
          "rounded-full bg-white/10 p-4 text-white/80 hover:bg-white/15 hover:text-white",
          !onNext || disableNext
            ? "cursor-not-allowed opacity-40 hover:bg-white/10 hover:text-white/80"
            : "",
        ].join(" ")}
        aria-label="Next"
        title="Next"
      >
        <FontAwesomeIcon icon={faForwardStep} size="lg" />
      </button>
    </div>
  );
}
