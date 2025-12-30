// src/components/settings/SettingsHeader.tsx
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faBars, faGear } from "@fortawesome/free-solid-svg-icons";

export function SettingsHeader(props: {
  onBack: () => void;
  onOpenMenu: () => void;
}) {
  const { onBack, onOpenMenu } = props;

  return (
    <header className="mx-auto flex w-full max-w-md items-center justify-between px-4 pt-6">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          className="rounded-full p-2 text-white/75 hover:bg-white/10 hover:text-white"
          aria-label="Back"
          title="Back"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>

        <button
          type="button"
          onClick={onOpenMenu}
          className="rounded-full p-2 text-white/75 hover:bg-white/10 hover:text-white"
          aria-label="Menu"
          title="Menu"
        >
          <FontAwesomeIcon icon={faBars} />
        </button>
      </div>

      <div className="flex min-w-0 items-center gap-2 text-white/70">
        <FontAwesomeIcon icon={faGear} className="shrink-0 text-white/60" />
        <span className="truncate text-sm tracking-widest">SETTINGS</span>
      </div>

      <div className="w-8" />
    </header>
  );
}
