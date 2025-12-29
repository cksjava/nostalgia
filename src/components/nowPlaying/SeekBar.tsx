import { useEffect, useRef } from "react";
import { formatTime } from "../../utils/format";
import { clamp } from "../../utils/math";

export function SeekBar(props: {
  positionSec: number;
  durationSec: number;
  onSeek: (next: number) => void;
}) {
  const { positionSec, durationSec, onSeek } = props;

  const lastValueRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);

  const max = Math.max(0, Number(durationSec || 0));
  const value = clamp(Number(positionSec || 0), 0, max);

  // Keep last value in sync when external updates come in
  useEffect(() => {
    if (!isDraggingRef.current) lastValueRef.current = value;
  }, [value]);

  const commit = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    onSeek(lastValueRef.current);
  };

  return (
    <div className="mt-5">
      <div className="mb-2 flex items-center justify-between text-xs text-white/70">
        <span>{formatTime(value)}</span>
        <span>{formatTime(max)}</span>
      </div>

      <input
        type="range"
        min={0}
        max={max}
        value={value}
        onChange={(e) => {
          const next = clamp(Number(e.target.value), 0, max);
          lastValueRef.current = next;
          isDraggingRef.current = true;

          // Update UI while dragging
          onSeek(next);
        }}
        onMouseUp={commit}
        onTouchEnd={commit}
        onKeyUp={commit}
        className="w-full accent-white/80"
        aria-label="Seek"
        style={{ filter: "drop-shadow(0 10px 18px rgba(0,0,0,0.30))" }}
      />
    </div>
  );
}
