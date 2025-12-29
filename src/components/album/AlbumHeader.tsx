import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faEllipsisVertical,
  faBars,
} from "@fortawesome/free-solid-svg-icons";

export function AlbumHeader(props: {
  title: string;
  onBack: () => void;
  onMore?: () => void;

  // ✅ NEW
  onOpenSidebar: () => void;
}) {
  const { title, onBack, onMore, onOpenSidebar } = props;

  return (
    <header className="mx-auto flex w-full max-w-md items-center justify-between px-4 pt-6">
      {/* Left controls: hamburger + back */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="rounded-full p-2 text-white/75 hover:bg-white/10 hover:text-white"
          aria-label="Open menu"
          title="Menu"
        >
          <FontAwesomeIcon icon={faBars} />
        </button>

        <button
          type="button"
          onClick={onBack}
          className="rounded-full p-2 text-white/75 hover:bg-white/10 hover:text-white"
          aria-label="Back"
          title="Back"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
      </div>

      <p className="max-w-[60%] truncate text-sm font-semibold tracking-widest text-white/80">
        {title}
      </p>

      <button
        type="button"
        onClick={onMore}
        className="rounded-full p-2 text-white/75 hover:bg-white/10 hover:text-white"
        aria-label="More"
        title="More"
      >
        <FontAwesomeIcon icon={faEllipsisVertical} />
      </button>
    </header>
  );
}
