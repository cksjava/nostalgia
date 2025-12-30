// src/components/settings/ScanCard.tsx
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch, faRotateRight, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";

export function ScanCard(props: {
  roots: string[];
  exts: string[];
  dryRun: boolean;
  setDryRun: (v: boolean) => void;
  removeMissing: boolean;
  setRemoveMissing: (v: boolean) => void;
  scanning: boolean;
  onScan: () => void;
}) {
  const {
    roots,
    exts,
    dryRun,
    setDryRun,
    removeMissing,
    setRemoveMissing,
    scanning,
    onScan,
  } = props;

  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">Scan library</p>
          <p className="mt-1 text-xs text-white/55">
            Scans configured folders using configured extensions.
          </p>
        </div>
      </div>

      <div className="mt-3 grid gap-2">
        <label className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
          <div className="min-w-0">
            <p className="text-sm text-white/90">Remove missing tracks</p>
            <p className="mt-0.5 text-xs text-white/45">
              Deletes DB entries whose files no longer exist.
            </p>
          </div>
          <input
            type="checkbox"
            checked={removeMissing}
            onChange={(e) => setRemoveMissing(e.target.checked)}
            className="h-5 w-5 accent-white"
          />
        </label>

        <label className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
          <div className="min-w-0">
            <p className="text-sm text-white/90">Dry run</p>
            <p className="mt-0.5 text-xs text-white/45">
              Doesn’t write to DB; useful for testing paths.
            </p>
          </div>
          <input
            type="checkbox"
            checked={dryRun}
            onChange={(e) => setDryRun(e.target.checked)}
            className="h-5 w-5 accent-white"
          />
        </label>
      </div>

      <div className="mt-3 flex gap-3">
        <button
          type="button"
          onClick={onScan}
          disabled={scanning}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/15 disabled:opacity-60"
        >
          <FontAwesomeIcon icon={scanning ? faCircleNotch : faRotateRight} spin={scanning} />
          {scanning ? "Scanning…" : "Scan now"}
        </button>
      </div>

      {(roots.length === 0 || exts.length === 0) && (
        <div className="mt-2 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/55">
          <FontAwesomeIcon icon={faTriangleExclamation} className="mr-2 text-white/45" />
          Add at least one folder and one extension before scanning.
        </div>
      )}
    </div>
  );
}
