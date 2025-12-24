import { formatTime } from "../../utils/format";
import { clamp } from "../../utils/math";

export function SeekBar(props: {
  positionSec: number;
  durationSec: number;
  onSeek: (next: number) => void;
}) {
  const { positionSec, durationSec, onSeek } = props;

  return (
    <div className="mt-5">
      <div className="mb-2 flex items-center justify-between text-xs text-white/70">
        <span>{formatTime(positionSec)}</span>
        <span>{formatTime(durationSec)}</span>
      </div>

      {/* Only ONE bar now: the range input */}
      <input
        type="range"
        min={0}
        max={durationSec || 0}
        value={clamp(positionSec, 0, durationSec)}
        onChange={(e) => onSeek(Number(e.target.value))}
        className="w-full accent-white/80"
        aria-label="Seek"
        style={{ filter: "drop-shadow(0 10px 18px rgba(0,0,0,0.30))" }}
      />
    </div>
  );
}
