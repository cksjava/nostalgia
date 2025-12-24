import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faShuffle } from "@fortawesome/free-solid-svg-icons";

export function CdControls(props: {
  onPlayAll: () => void;
  onShuffle: () => void;
}) {
  const { onPlayAll, onShuffle } = props;

  return (
    <div className="mt-4 flex gap-3">
      <button
        type="button"
        onClick={onPlayAll}
        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white hover:bg-white/15"
      >
        <FontAwesomeIcon icon={faPlay} />
        Play
      </button>

      <button
        type="button"
        onClick={onShuffle}
        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/80 hover:bg-white/10 hover:text-white"
      >
        <FontAwesomeIcon icon={faShuffle} />
        Shuffle
      </button>
    </div>
  );
}
