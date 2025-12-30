import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { ShuffleRepeatControls } from "./ShuffleRepeatControls";
import type { RepeatMode } from "../../types/nowPlaying";

export function TrackActionsRow(props: {
  trackId?: string;
  onAddToPlaylist: () => void;
  shuffle: boolean;
  setShuffle: React.Dispatch<React.SetStateAction<boolean>>;
  repeatMode: RepeatMode;
  onToggleRepeat: () => void;
}) {
  const { trackId, onAddToPlaylist, shuffle, setShuffle, repeatMode, onToggleRepeat } = props;

  return (
    <div className="flex shrink-0 items-center gap-2">
      <button
        type="button"
        onClick={onAddToPlaylist}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white active:scale-[0.98]"
        aria-label="Add to playlist"
        title="Add to playlist"
        disabled={!trackId}
      >
        <FontAwesomeIcon icon={faPlus} />
      </button>

      <ShuffleRepeatControls
        shuffle={shuffle}
        setShuffle={setShuffle}
        repeatMode={repeatMode}
        onToggleRepeat={onToggleRepeat}
      />
    </div>
  );
}
