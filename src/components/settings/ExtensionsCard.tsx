// src/components/settings/ExtensionsCard.tsx
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";

export function ExtensionsCard(props: {
  exts: string[];
  newExt: string;
  setNewExt: (v: string) => void;
  savingExts: boolean;
  onAddExt: () => void;
  onRemoveExt: (ext: string) => void;
  extsCsv: string;
}) {
  const { exts, newExt, setNewExt, savingExts, onAddExt, onRemoveExt, extsCsv } = props;

  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">File extensions</p>
          <p className="mt-1 text-xs text-white/55">
            Add without dots (example: <span className="font-mono text-white/70">flac</span>,{" "}
            <span className="font-mono text-white/70">mp3</span>)
          </p>
        </div>

        <div className="shrink-0 text-xs text-white/50">
          {savingExts ? "Saving…" : `${exts.length} items`}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
        <span className="text-white/45">.</span>
        <input
          value={newExt}
          onChange={(e) => setNewExt(e.target.value)}
          placeholder="flac"
          className="w-full bg-transparent text-sm text-white/90 outline-none placeholder:text-white/40"
          onKeyDown={(e) => {
            if (e.key === "Enter") onAddExt();
          }}
        />
        <button
          type="button"
          onClick={onAddExt}
          className="rounded-lg border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/15"
          title="Add extension"
          disabled={savingExts}
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Add
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {exts.length === 0 ? (
          <div className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/60">
            No extensions configured yet.
          </div>
        ) : (
          exts.map((e) => (
            <span
              key={e}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/85"
            >
              <span className="font-mono">.{e}</span>
              <button
                type="button"
                onClick={() => onRemoveExt(e)}
                className="rounded-full p-1 text-white/60 hover:bg-white/10 hover:text-white"
                aria-label={`Remove extension ${e}`}
                title="Remove"
                disabled={savingExts}
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </span>
          ))
        )}
      </div>

      <div className="mt-2 text-[11px] text-white/35">
        Stored as CSV: <span className="font-mono text-white/45">{extsCsv || "(empty)"}</span>
      </div>
    </div>
  );
}
