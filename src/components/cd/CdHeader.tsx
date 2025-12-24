import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faCompactDisc } from "@fortawesome/free-solid-svg-icons";

export function CdHeader(props: {
  onOpenSidebar: () => void;
}) {
  const { onOpenSidebar } = props;

  return (
    <header className="mx-auto flex w-full max-w-md items-center justify-between px-4 pt-6">
      {/* Hamburger */}
      <button
        type="button"
        onClick={onOpenSidebar}
        className="rounded-full p-2 text-white/75 hover:bg-white/10 hover:text-white"
        aria-label="Menu"
        title="Menu"
      >
        <FontAwesomeIcon icon={faBars} />
      </button>

      {/* Title */}
      <div className="flex items-center gap-2 text-white/70">
        <FontAwesomeIcon icon={faCompactDisc} className="text-white/60" />
        <span className="text-sm tracking-widest">CD AUDIO</span>
      </div>

      {/* Spacer for symmetry */}
      <div className="w-8" />
    </header>
  );
}
