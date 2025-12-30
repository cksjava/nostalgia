// src/components/settings/ScanFoldersCard.tsx
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolderOpen, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";

export function ScanFoldersCard(props: {
  roots: string[];
  newRoot: string;
  setNewRoot: (v: string) => void;
  savingRoots: boolean;
  onAddRoot: () => void;
  onRemoveRoot: (root: string) => void;
  rootsCsv: string;
}) {
  const { roots, newRoot, setNewRoot, savingRoots, onAddRoot, onRemoveRoot, rootsCsv } =
    props;

  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">Scan folders</p>
          <p className="mt-1 text-xs text-white/55">
            Absolute directories on the Pi (example:{" "}
            <span className="font-mono text-white/70">/mnt/music</span>)
          </p>
        </div>

        <div className="shrink-0 text-xs text-white/50">
          {savingRoots ? "Saving…" : `${roots.length} items`}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
        <FontAwesomeIcon icon={faFolderOpen} className="text-white/45" />
        <input
          value={newRoot}
          onChange={(e) => setNewRoot(e.target.value)}
          placeholder="/mnt/music"
          className="w-full bg-transparent text-sm text-white/90 outline-none placeholder:text-white/40"
          onKeyDown={(e) => {
            if (e.key === "Enter") onAddRoot();
          }}
        />
        <button
          type="button"
          onClick={onAddRoot}
          className="rounded-lg border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/15"
          title="Add folder"
          disabled={savingRoots}
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Add
        </button>
      </div>

      <div className="mt-3 overflow-hidden rounded-xl border border-white/10">
        {roots.length === 0 ? (
          <div className="bg-white/5 p-3 text-sm text-white/60">No folders configured yet.</div>
        ) : (
          <ul className="divide-y divide-white/10">
            {roots.map((r) => (
              <li
                key={r}
                className="flex items-center justify-between gap-3 bg-white/5 px-3 py-2"
              >
                <span className="min-w-0 truncate font-mono text-xs text-white/85">{r}</span>
                <button
                  type="button"
                  onClick={() => onRemoveRoot(r)}
                  className="shrink-0 rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white"
                  aria-label={`Remove folder ${r}`}
                  title="Remove"
                  disabled={savingRoots}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-2 text-[11px] text-white/35">
        Stored as CSV:{" "}
        <span className="font-mono text-white/45">{rootsCsv || "(empty)"}</span>
      </div>
    </div>
  );
}
