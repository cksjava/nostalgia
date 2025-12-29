import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faEllipsisVertical,
  faListUl,
  faVolumeHigh,
  faVolumeLow,
  faVolumeXmark,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";

export function NowPlayingHeader(props: {
  volume: number;
  isVolumeOpen: boolean;
  onToggleVolume: () => void;
  onOpenSidebar: () => void;

  // ✅ new
  onBack?: () => void;

  isTrackListOpen: boolean;
  onToggleTrackList: () => void;

  children?: React.ReactNode;
}) {
  const {
    volume,
    isVolumeOpen,
    onToggleVolume,
    onOpenSidebar,
    onBack,
    isTrackListOpen,
    onToggleTrackList,
    children,
  } = props;

  const volumeIcon =
    volume === 0 ? faVolumeXmark : volume < 40 ? faVolumeLow : faVolumeHigh;

  return (
    <div className="mb-5 flex items-center justify-between">
      {/* Left: back + hamburger */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white"
          aria-label="Open menu"
          title="Menu"
        >
          <FontAwesomeIcon icon={faBars} />
        </button>
        <button
          type="button"
          onClick={onBack}
          disabled={!onBack}
          className={[
            "rounded-full p-2 hover:bg-white/10 hover:text-white",
            onBack ? "text-white/70" : "text-white/30 cursor-not-allowed",
          ].join(" ")}
          aria-label="Back"
          title="Back"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
      </div>

      {/* Right controls */}
      <div className="relative flex items-center gap-1">
        <button
          type="button"
          onClick={onToggleTrackList}
          className={[
            "rounded-full p-2 hover:bg-white/10 hover:text-white",
            isTrackListOpen ? "text-white" : "text-white/70",
          ].join(" ")}
          aria-label="Album tracks"
          aria-expanded={isTrackListOpen}
          title="Album tracks"
        >
          <FontAwesomeIcon icon={faListUl} />
        </button>

        <button
          type="button"
          onClick={onToggleVolume}
          className="rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white"
          aria-label="Volume"
          aria-expanded={isVolumeOpen}
          title="Volume"
        >
          <FontAwesomeIcon icon={volumeIcon} />
        </button>

        <button
          type="button"
          className="rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white"
          aria-label="More options"
          title="More"
        >
          <FontAwesomeIcon icon={faEllipsisVertical} />
        </button>

        {children}
      </div>
    </div>
  );
}
