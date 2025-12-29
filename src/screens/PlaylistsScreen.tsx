import React, { useEffect, useMemo, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faListUl,
  faMagnifyingGlass,
  faCircleNotch,
  faTriangleExclamation,
  faCheck,
  faPlus,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

import { SidebarDrawer } from "../components/common/SidebarDrawer";
import { PlaylistRow, type PlaylistRowUI } from "../components/playlists/PlaylistRow";
import { ConfirmModal } from "../components/common/ConfirmModal";
import { useNavigate } from "react-router-dom";

import { playlistsService } from "../api/services/playlistsService";
import type { Playlist } from "../api/types/models";

function toIso(v: any): string {
  if (!v) return new Date().toISOString();
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return new Date().toISOString();
  return d.toISOString();
}

function mapPlaylistToRowUI(p: Playlist): PlaylistRowUI {
  return {
    id: String((p as any).id),
    name: String((p as any).name ?? "Untitled"),
    createdAt: toIso((p as any).createdAt),
    trackCount: Number.isFinite(Number((p as any).trackCount)) ? Number((p as any).trackCount) : 0,
  };
}

export default function PlaylistsScreen() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const [playlists, setPlaylists] = useState<PlaylistRowUI[]>([]);
  const [loading, setLoading] = useState(true);

  const [toast, setToast] = useState<{
    kind: "ok" | "warn" | "err";
    message: string;
  } | null>(null);

  // Create playlist modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const createInputRef = useRef<HTMLInputElement | null>(null);

  // Delete confirmation modal
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState<string>("");
  const [deleting, setDeleting] = useState(false);

  // Close sidebar on Escape
  useEffect(() => {
    if (!isSidebarOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsSidebarOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isSidebarOpen]);

  // Auto-hide toast
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(t);
  }, [toast]);

  const load = async () => {
    setLoading(true);
    try {
      const rows = await playlistsService.list();
      setPlaylists(rows.map(mapPlaylistToRowUI));
    } catch (e: any) {
      setToast({
        kind: "err",
        message: e?.response?.data?.error ?? e?.message ?? "Failed to load playlists.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return playlists;
    return playlists.filter((p) => p.name.toLowerCase().includes(q));
  }, [query, playlists]);

  const bgStyle: React.CSSProperties = {
    backgroundImage: `
      radial-gradient(900px 600px at 18% 20%, rgba(255, 110, 90, 0.45), transparent 60%),
      radial-gradient(900px 600px at 85% 25%, rgba(110, 160, 255, 0.45), transparent 55%),
      radial-gradient(900px 700px at 70% 85%, rgba(190, 120, 255, 0.35), transparent 60%),
      linear-gradient(135deg, rgba(10, 12, 18, 0.92), rgba(8, 10, 16, 0.92))
    `,
  };

  const toastIcon =
    toast?.kind === "ok"
      ? faCheck
      : toast?.kind === "warn"
      ? faTriangleExclamation
      : faTriangleExclamation;

  const toastStyle =
    toast?.kind === "ok"
      ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-100"
      : toast?.kind === "warn"
      ? "border-amber-400/20 bg-amber-500/10 text-amber-100"
      : "border-rose-400/20 bg-rose-500/10 text-rose-100";

  const openCreate = () => {
    setNewName("");
    setIsCreateOpen(true);
  };

  const closeCreate = () => {
    if (creating) return;
    setIsCreateOpen(false);
    setNewName("");
  };

  // Focus input when modal opens
  useEffect(() => {
    if (!isCreateOpen) return;
    const t = window.setTimeout(() => createInputRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [isCreateOpen]);

  // Close create modal on Escape
  useEffect(() => {
    if (!isCreateOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCreate();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isCreateOpen, creating]);

  const onCreate = async () => {
    const name = newName.trim();
    if (!name) {
      setToast({ kind: "warn", message: "Please enter a playlist name." });
      createInputRef.current?.focus();
      return;
    }

    setCreating(true);
    try {
      const created = await playlistsService.create({ name, description: null });
      const ui = mapPlaylistToRowUI(created as any);
      setPlaylists((prev) => [ui, ...prev]);
      setToast({ kind: "ok", message: "Playlist created." });
      setIsCreateOpen(false);
      setNewName("");
    } catch (e: any) {
      setToast({
        kind: "err",
        message: e?.response?.data?.error ?? e?.message ?? "Failed to create playlist.",
      });
    } finally {
      setCreating(false);
    }
  };

  const askDelete = (p: PlaylistRowUI) => {
    setDeleteId(p.id);
    setDeleteName(p.name);
  };

  const cancelDelete = () => {
    if (deleting) return;
    setDeleteId(null);
    setDeleteName("");
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await playlistsService.remove(deleteId);
      setPlaylists((prev) => prev.filter((x) => x.id !== deleteId));
      setToast({ kind: "ok", message: "Playlist deleted." });
      setDeleteId(null);
      setDeleteName("");
    } catch (e: any) {
      setToast({
        kind: "err",
        message: e?.response?.data?.error ?? e?.message ?? "Failed to delete playlist.",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen w-full" style={bgStyle}>
      <div className="min-h-screen w-full backdrop-blur-2xl">
        <div className="mx-auto flex min-h-screen w-full max-w-md flex-col">
          {/* Top bar */}
          <header className="px-4 pt-6">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="rounded-full p-2 text-white/75 hover:bg-white/10 hover:text-white"
                aria-label="Menu"
                title="Menu"
              >
                <FontAwesomeIcon icon={faBars} />
              </button>

              <div className="flex items-center gap-2 text-white/70">
                <FontAwesomeIcon icon={faListUl} className="text-white/60" />
                <span className="text-sm tracking-widest">PLAYLISTS</span>
              </div>

              <button
                type="button"
                onClick={openCreate}
                className="rounded-full p-2 text-white/75 hover:bg-white/10 hover:text-white"
                aria-label="Create playlist"
                title="Create playlist"
              >
                <FontAwesomeIcon icon={faPlus} />
              </button>
            </div>
          </header>

          <main className="flex-1 px-4 pb-10 pt-4">
            <section className="flex h-full flex-col rounded-[1.75rem] border border-white/10 bg-black/25 shadow-2xl shadow-black/40 backdrop-blur-2xl">
              {/* Top portion */}
              <div className="p-4">
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                  <FontAwesomeIcon icon={faMagnifyingGlass} className="text-white/45" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search playlists…"
                    className="w-full bg-transparent text-sm text-white/90 outline-none placeholder:text-white/40"
                  />
                </div>

                <div className="mt-4 h-px w-full bg-white/10" />
              </div>

              {/* Scrollable list only */}
              <div className="flex-1 px-4 pb-4">
                <div className="h-full overflow-y-auto rounded-xl border border-white/10 bg-white/5">
                  {loading ? (
                    <div className="flex items-center justify-center gap-2 p-4 text-sm text-white/60">
                      <FontAwesomeIcon icon={faCircleNotch} spin className="text-white/60" />
                      Loading playlists…
                    </div>
                  ) : filtered.length === 0 ? (
                    <div className="p-4 text-center text-sm text-white/60">No playlists found.</div>
                  ) : (
                    filtered.map((p, idx) => (
                      <PlaylistRow
                        key={p.id}
                        playlist={p}
                        showDivider={idx !== filtered.length - 1}
                        onClick={() => navigate(`/playlists/${p.id}`)}
                        onDelete={() => askDelete(p)}
                      />
                    ))
                  )}
                </div>

                {toast && (
                  <div className="mt-3">
                    <div className={`flex items-start gap-2 rounded-xl border px-3 py-2 text-sm ${toastStyle}`}>
                      <FontAwesomeIcon icon={toastIcon} className="mt-0.5 shrink-0" />
                      <span className="leading-snug">{toast.message}</span>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </main>
        </div>

        {/* Create Playlist Modal */}
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4" role="dialog" aria-modal="true">
            <button
              type="button"
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={closeCreate}
              aria-label="Close"
              disabled={creating}
            />

            <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-black/70 shadow-2xl shadow-black/60 backdrop-blur-2xl">
              <div className="flex items-center justify-between p-5">
                <div>
                  <div className="text-sm font-semibold text-white">New playlist</div>
                  <div className="mt-1 text-xs text-white/55">Give it a name.</div>
                </div>

                <button
                  type="button"
                  onClick={closeCreate}
                  disabled={creating}
                  className="rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-50"
                  aria-label="Close"
                  title="Close"
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </div>

              <div className="px-5 pb-5">
                <label className="block text-xs text-white/60">Playlist name</label>
                <input
                  ref={createInputRef}
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void onCreate();
                  }}
                  placeholder="e.g., Road trip"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 outline-none placeholder:text-white/35 focus:border-white/20"
                  disabled={creating}
                />

                <div className="mt-4 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={closeCreate}
                    disabled={creating}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={() => void onCreate()}
                    disabled={creating}
                    className="rounded-full border border-white/20 bg-white/15 px-4 py-2 text-sm text-white hover:bg-white/20 disabled:opacity-50"
                  >
                    {creating ? (
                      <span className="inline-flex items-center gap-2">
                        <FontAwesomeIcon icon={faCircleNotch} spin />
                        Creating…
                      </span>
                    ) : (
                      "Create"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ✅ Delete confirmation modal */}
        <ConfirmModal
          open={!!deleteId}
          title="Delete playlist?"
          message={deleteName ? `“${deleteName}” will be permanently deleted. This cannot be undone.` : "This cannot be undone."}
          confirmText="Delete"
          cancelText="Cancel"
          danger
          busy={deleting}
          onClose={cancelDelete}
          onConfirm={() => void confirmDelete()}
        />

        <SidebarDrawer open={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      </div>
    </div>
  );
}
