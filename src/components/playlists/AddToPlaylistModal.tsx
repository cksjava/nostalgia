import { useEffect, useMemo, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleNotch,
  faMagnifyingGlass,
  faPlus,
  faXmark,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";

import { playlistsService } from "../../api/services/playlistsService";
import type { Playlist } from "../../api/types/models";

type Toast = { kind: "ok" | "warn" | "err"; message: string };

export function AddToPlaylistModal(props: {
  open: boolean;
  onClose: () => void;

  trackId: string;
  trackTitle?: string;

  onToast?: (t: Toast) => void;
}) {
  const { open, onClose, trackId, trackTitle, onToast } = props;

  const [loading, setLoading] = useState(true);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [query, setQuery] = useState("");

  const [addingTo, setAddingTo] = useState<string | null>(null);

  // Create inline
  const [isCreate, setIsCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  const searchRef = useRef<HTMLInputElement | null>(null);
  const createRef = useRef<HTMLInputElement | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const rows = await playlistsService.list();
      setPlaylists(rows || []);
    } catch (e: any) {
      onToast?.({
        kind: "err",
        message: e?.response?.data?.error ?? e?.message ?? "Failed to load playlists.",
      });
      setPlaylists([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    void load();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => searchRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    if (!isCreate) return;
    const t = window.setTimeout(() => createRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [open, isCreate]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return playlists;
    return playlists.filter((p: any) => String(p?.name || "").toLowerCase().includes(q));
  }, [query, playlists]);

  const onPick = async (playlistId: string) => {
    if (!trackId) return;
    setAddingTo(playlistId);
    try {
      await playlistsService.addTracks(playlistId, [trackId]);
      onToast?.({ kind: "ok", message: "Added to playlist." });
      onClose();
    } catch (e: any) {
      onToast?.({
        kind: "err",
        message: e?.response?.data?.error ?? e?.message ?? "Failed to add track to playlist.",
      });
    } finally {
      setAddingTo(null);
    }
  };

  const onCreate = async () => {
    const name = newName.trim();
    if (!name) {
      onToast?.({ kind: "warn", message: "Please enter a playlist name." });
      createRef.current?.focus();
      return;
    }

    setCreating(true);
    try {
      const created = await playlistsService.create({ name, description: null });
      // insert at top
      setPlaylists((prev) => [created, ...prev]);
      setNewName("");
      setIsCreate(false);
      onToast?.({ kind: "ok", message: "Playlist created." });
    } catch (e: any) {
      onToast?.({
        kind: "err",
        message: e?.response?.data?.error ?? e?.message ?? "Failed to create playlist.",
      });
    } finally {
      setCreating(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close"
        disabled={addingTo != null || creating}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-black/70 shadow-2xl shadow-black/60 backdrop-blur-2xl">
        <div className="flex items-center justify-between p-5">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-white">Add to playlist</div>
            <div className="mt-1 truncate text-xs text-white/55">
              {trackTitle ? `“${trackTitle}”` : "Select a playlist"}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={addingTo != null || creating}
            className="rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-50"
            aria-label="Close"
            title="Close"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <div className="px-5 pb-5">
          {/* Search + create */}
          <div className="flex items-center gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
              <FontAwesomeIcon icon={faMagnifyingGlass} className="text-white/45" />
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search playlists…"
                className="w-full bg-transparent text-sm text-white/90 outline-none placeholder:text-white/40"
                disabled={loading || addingTo != null || creating}
              />
            </div>

            <button
              type="button"
              onClick={() => {
                setIsCreate((v) => !v);
                setNewName("");
              }}
              className="shrink-0 rounded-full border border-white/10 bg-white/5 p-2 text-white/70 hover:bg-white/10 hover:text-white"
              title="New playlist"
              aria-label="New playlist"
              disabled={addingTo != null || creating}
            >
              <FontAwesomeIcon icon={faPlus} />
            </button>
          </div>

          {/* Inline create */}
          {isCreate && (
            <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="text-xs text-white/60">New playlist name</div>
              <div className="mt-2 flex items-center gap-2">
                <input
                  ref={createRef}
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void onCreate();
                    if (e.key === "Escape") setIsCreate(false);
                  }}
                  placeholder="e.g., Favourites"
                  className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/90 outline-none placeholder:text-white/35 focus:border-white/20"
                  disabled={creating}
                />
                <button
                  type="button"
                  onClick={() => void onCreate()}
                  disabled={creating}
                  className="rounded-full border border-white/20 bg-white/15 px-3 py-2 text-sm text-white hover:bg-white/20 disabled:opacity-50"
                  title="Create"
                >
                  {creating ? <FontAwesomeIcon icon={faCircleNotch} spin /> : <FontAwesomeIcon icon={faCheck} />}
                </button>
              </div>
            </div>
          )}

          {/* List */}
          <div className="mt-4 max-h-[420px] overflow-y-auto rounded-xl border border-white/10 bg-white/5">
            {loading ? (
              <div className="flex items-center justify-center gap-2 p-4 text-sm text-white/60">
                <FontAwesomeIcon icon={faCircleNotch} spin className="text-white/60" />
                Loading playlists…
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-4 text-center text-sm text-white/60">No playlists found.</div>
            ) : (
              filtered.map((p: any, idx: number) => {
                const pid = String(p.id);
                const name = String(p.name ?? "Untitled");
                const busy = addingTo === pid;

                return (
                  <button
                    key={pid}
                    type="button"
                    onClick={() => void onPick(pid)}
                    disabled={addingTo != null || creating}
                    className={[
                      "flex w-full items-center justify-between gap-3 px-3 py-3 text-left transition hover:bg-white/10",
                      idx !== filtered.length - 1 ? "border-b border-white/10" : "",
                      busy ? "opacity-70" : "",
                    ].join(" ")}
                    title={`Add to ${name}`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-white/90">{name}</div>
                      <div className="text-xs text-white/45">Tap to add</div>
                    </div>

                    <div className="shrink-0 text-xs text-white/55">
                      {busy ? <FontAwesomeIcon icon={faCircleNotch} spin /> : null}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
