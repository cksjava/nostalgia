import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faVolumeHigh,
  faVolumeLow,
  faVolumeXmark,
} from "@fortawesome/free-solid-svg-icons";
import { clamp } from "../../utils/math";

export function VolumePopover(props: {
  refEl: React.RefObject<HTMLDivElement | null>;
  volume: number;
  setVolume: React.Dispatch<React.SetStateAction<number>>;
}) {
  const { refEl, volume, setVolume } = props;

  const v = clamp(volume, 0, 100);
  const volumeIcon = v === 0 ? faVolumeXmark : v < 40 ? faVolumeLow : faVolumeHigh;

  return (
    <div
      ref={refEl}
      className="absolute right-0 top-12 z-20 w-64 rounded-2xl border border-white/10 bg-black/40 p-4 shadow-2xl shadow-black/40 backdrop-blur-xl"
      role="dialog"
      aria-label="Volume controls"
    >
      <div className="flex items-center gap-3">
        <span className="shrink-0 text-white/85" aria-hidden="true">
          <FontAwesomeIcon icon={volumeIcon} />
        </span>

        <input
          type="range"
          min={0}
          max={100}
          value={v}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="flex-1 accent-white/80"
          aria-label="Volume level"
        />

        <span className="shrink-0 text-xs text-white/70 tabular-nums">
          {v}%
        </span>
      </div>
    </div>
  );
}
