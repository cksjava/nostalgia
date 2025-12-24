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
}) {
  const { isPlaying, setIsPlaying } = props;

  return (
    <div className="mt-6 flex items-center justify-center gap-6">
      <button
        type="button"
        className="rounded-full bg-white/10 p-4 text-white/80 hover:bg-white/15 hover:text-white"
        aria-label="Previous"
        title="Previous"
      >
        <FontAwesomeIcon icon={faBackwardStep} size="lg" />
      </button>

      <button
        type="button"
        onClick={() => setIsPlaying((v) => !v)}
        className="rounded-full bg-white/20 text-white shadow-lg shadow-black/30 hover:bg-white/25 w-18 h-18"
        aria-label={isPlaying ? "Pause" : "Play"}
        title={isPlaying ? "Pause" : "Play"}
      >
        <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} size="xl" />
      </button>

      <button
        type="button"
        className="rounded-full bg-white/10 p-4 text-white/80 hover:bg-white/15 hover:text-white"
        aria-label="Next"
        title="Next"
      >
        <FontAwesomeIcon icon={faForwardStep} size="lg" />
      </button>
    </div>
  );
}
