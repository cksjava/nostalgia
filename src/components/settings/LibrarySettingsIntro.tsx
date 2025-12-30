// src/components/settings/LibrarySettingsIntro.tsx
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleNotch,
  faRotateRight,
  faWandMagicSparkles,
} from "@fortawesome/free-solid-svg-icons";

export function LibrarySettingsIntro(props: {
  loading: boolean;
  savingExts: boolean;
  onReload: () => void;
  onDefaults: () => void;
}) {
  const { loading, savingExts, onReload, onDefaults } = props;

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <p className="truncate text-base font-semibold text-white">Library settings</p>
      <p className="mt-1 text-xs text-white/55">
        Configure scan folders and file extensions, then trigger a scan.
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onReload}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/15"
          disabled={loading}
          title="Reload settings"
        >
          <FontAwesomeIcon icon={loading ? faCircleNotch : faRotateRight} spin={loading} />
          Reload
        </button>

        <button
          type="button"
          onClick={onDefaults}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/80 hover:bg-white/10 hover:text-white"
          disabled={savingExts}
          title="Reset extensions to common defaults"
        >
          <FontAwesomeIcon icon={faWandMagicSparkles} />
          Defaults
        </button>
      </div>
    </div>
  );
}
