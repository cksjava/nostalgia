// src/screens/PlaylistDetailsScreen.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faCircleNotch,
  faMagnifyingGlass,
  faPlus,
  faTrash,
  faTriangleExclamation,
  faCheck,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

import { playlistsService } from "../api/services/playlistsService";
import { tracksService } from "../api/services/tracksService";
import type { Track as TrackDto, Playlist as PlaylistDto } from "../api/types/models";

import { PlaylistTrackRow } from "../components/playlists/PlaylistTrackRow";
import { ConfirmModal } from "../components/common/ConfirmModal";

type PlaylistDetails = PlaylistDto & { tracks?: TrackDto[] };

function toStr(v: any, fallback = "—") {
  const s = String(v ?? "");
  return s.trim() ? s : fallback;
}

export default function PlaylistDetailsScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [playlist, setPlaylist] = useState<PlaylistDetails | null>(null);
  const [tracks, setTracks] = useState<TrackDto[]>([]);

  const [toast, setToast] = useState<{ kind: "ok" | "warn" | "err"; message: string } | null>(
    null
  );

  // Add tracks modal + search
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [trackQuery, setTrackQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<TrackDto[]>([]);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Delete confirmation modal state
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  // Auto-hide toast
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(t);
  }, [toast]);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const dto = (await playlistsService.getById(id, {
        withTracks: true,
      })) as PlaylistDetails;

      setPlaylist(dto);
      setTracks(Array.isArray((dto as any)?.tracks) ? ((dto as any).tracks as TrackDto[]) : []);
    } catch (e: any) {
      setToast({
        kind: "err",
        message: e?.response?.data?.error ?? e?.message ?? "Failed to load playlist.",
      });
      setPlaylist(null);
      setTracks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [id]);

  const openAdd = () => {
    setIsAddOpen(true);
    setTrackQuery("");
    setSearchResults([]);
  };

  const closeAdd = () => {
    if (searching) return;
    setIsAddOpen(false);
    setTrackQuery("");
    setSearchResults([]);
  };

  useEffect(() => {
    if (!isAddOpen) return;
    const t = window.setTimeout(() => searchInputRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [isAddOpen]);

  useEffect(() => {
    if (!isAddOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAdd();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isAddOpen, searching]);

  const doSearch = async () => {
    const q = trackQuery.trim();
    if (!q) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const rows = await (tracksService as any).search(q, { limit: 50, offset: 0 });
      setSearchResults(Array.isArray(rows) ? rows : []);
    } catch (e: any) {
      setToast({
        kind: "err",
        message: e?.response?.data?.error ?? e?.message ?? "Track search failed.",
      });
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const currentIds = useMemo(() => new Set(tracks.map((t: any) => String(t.id))), [tracks]);

  const addTrackToPlaylist = async (trackId: string) => {
    if (!id) return;
    try {
      await playlistsService.addTracks(id, [trackId]);
      setToast({ kind: "ok", message: "Added to playlist." });
      await load();
    } catch (e: any) {
      setToast({
        kind: "err",
        message: e?.response?.data?.error ?? e?.message ?? "Failed to add track.",
      });
    }
  };

  const removeTrackFromPlaylist = async (trackId: string) => {
    if (!id) return;
    try {
      await playlistsService.removeTracks(id, [trackId]);
      setToast({ kind: "ok", message: "Removed from playlist." });
      await load();
    } catch (e: any) {
      setToast({
        kind: "err",
        message: e?.response?.data?.error ?? e?.message ?? "Failed to remove track.",
      });
    }
  };

  const deletePlaylist = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await playlistsService.remove(id);
      setToast({ kind: "ok", message: "Playlist deleted." });
      navigate("/playlists");
    } catch (e: any) {
      setToast({
        kind: "err",
        message: e?.response?.data?.error ?? e?.message ?? "Failed to delete playlist.",
      });
    } finally {
      setDeleting(false);
      setConfirmDeleteOpen(false);
    }
  };

  const bgStyle: React.CSSProperties = {
    backgroundImage: `
      radial-gradient(900px 600px at 18% 20%, rgba(255, 110, 90, 0.45), transparent 60%),
      radial-gradient(900px 600px at 85% 25%, rgba(110, 160, 255, 0.45), transparent 55%),
      radial-gradient(900px 700px at 70% 85%, rgba(190, 120, 255, 0.35), transparent 60%),
      linear-gradient(135deg, rgba(10, 12, 18, 0.92), rgba(8, 10, 16, 0.92))
    `,
  };

  const title = toStr((playlist as any)?.name, "Playlist");

  return (
    <div className="min-h-screen w-full" style={bgStyle}>
      <div className="min-h-screen w-full backdrop-blur-2xl">
        {/* Layout container: prevent page scrolling */}
        <div className="mx-auto flex h-screen w-full max-w-md flex-col">
          {/* Fixed top header */}
          <header className="px-4 pt-6">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigate("/playlists")}
                className="rounded-full p-2 text-white/75 hover:bg-white/10 hover:text-white"
                aria-label="Back"
                title="Back"
              >
                <FontAwesomeIcon icon={faArrowLeft} />
              </button>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={openAdd}
                  className="rounded-full p-2 text-white/75 hover:bg-white/10 hover:text-white"
                  aria-label="Add tracks"
                  title="Add tracks"
                >
                  <FontAwesomeIcon icon={faPlus} />
                </button>

                <button
                  type="button"
                  onClick={() => setConfirmDeleteOpen(true)}
                  className="rounded-full p-2 text-white/65 hover:bg-white/10 hover:text-white"
                  aria-label="Delete playlist"
                  title="Delete playlist"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            </div>
          </header>

          {/* Card: fixed title area + internal scroll list */}
          <main className="flex-1 px-4 pb-6 pt-4 min-h-0">
            <section className="flex h-full flex-col rounded-[1.75rem] border border-white/10 bg-black/25 shadow-2xl shadow-black/40 backdrop-blur-2xl">
              {/* Neat playlist title area */}
              <div className="p-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="min-w-0">
                    <div className="truncate text-lg font-semibold text-white">{title}</div>
                    <div className="mt-1 text-sm text-white/60">
                      {loading ? "Loading…" : `${tracks.length} track${tracks.length === 1 ? "" : "s"}`}
                    </div>
                  </div>
                </div>

                <div className="mt-4 h-px w-full bg-white/10" />
              </div>

              {/* Internal scroll area */}
              <div className="flex min-h-0 flex-1 flex-col px-4 pb-4">
                <div className="min-h-0 flex-1 overflow-y-auto rounded-xl border border-white/10 bg-white/5">
                  {loading ? (
                    <div className="flex items-center justify-center gap-2 p-4 text-sm text-white/60">
                      <FontAwesomeIcon icon={faCircleNotch} spin />
                      Loading tracks…
                    </div>
                  ) : tracks.length === 0 ? (
                    <div className="p-4 text-center text-sm text-white/60">
                      No tracks yet. Tap <span className="text-white/80">+</span> to add.
                    </div>
                  ) : (
                    tracks.map((t: any, idx) => (
                      <PlaylistTrackRow
                        key={String(t.id)}
                        track={{
                          id: String(t.id),
                          no: idx + 1,
                          title: toStr(t.title, "Untitled"),
                          artist: toStr(t.trackArtist, "Unknown Artist"),
                          album: toStr(t.album?.title, ""),
                          durationSec: Number(t.durationSec || 0) || 0,
                        }}
                        showDivider={idx !== tracks.length - 1}
                        onPlay={(trackNo) => {
                          const chosen = tracks[trackNo - 1];
                          if (chosen?.id) navigate(`/now-playing/${chosen.id}`);
                        }}
                        onRemove={() => void removeTrackFromPlaylist(String(t.id))}
                      />
                    ))
                  )}
                </div>

                {/* Toast stays within page but below list */}
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

          {/* Add tracks modal */}
          {isAddOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4" role="dialog" aria-modal="true">
              <button
                type="button"
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={closeAdd}
                aria-label="Close"
                disabled={searching}
              />

              <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-black/70 shadow-2xl shadow-black/60 backdrop-blur-2xl">
                <div className="flex items-center justify-between p-5">
                  <div>
                    <div className="text-sm font-semibold text-white">Add tracks</div>
                    <div className="mt-1 text-xs text-white/55">Search and add to this playlist.</div>
                  </div>

                  <button
                    type="button"
                    onClick={closeAdd}
                    disabled={searching}
                    className="rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-50"
                    aria-label="Close"
                    title="Close"
                  >
                    <FontAwesomeIcon icon={faXmark} />
                  </button>
                </div>

                <div className="px-5 pb-5">
                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                    <FontAwesomeIcon icon={faMagnifyingGlass} className="text-white/45" />
                    <input
                      ref={searchInputRef}
                      value={trackQuery}
                      onChange={(e) => setTrackQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") void doSearch();
                      }}
                      placeholder="Search tracks…"
                      className="w-full bg-transparent text-sm text-white/90 outline-none placeholder:text-white/40"
                      disabled={searching}
                    />
                    <button
                      type="button"
                      onClick={() => void doSearch()}
                      className="rounded-full px-3 py-1.5 text-xs text-white/75 hover:bg-white/10 hover:text-white"
                      disabled={searching}
                    >
                      {searching ? (
                        <span className="inline-flex items-center gap-2">
                          <FontAwesomeIcon icon={faCircleNotch} spin />
                          Searching…
                        </span>
                      ) : (
                        "Search"
                      )}
                    </button>
                  </div>

                  <div className="mt-4 max-h-[360px] overflow-y-auto rounded-xl border border-white/10 bg-white/5">
                    {searchResults.length === 0 ? (
                      <div className="p-4 text-center text-sm text-white/60">
                        {trackQuery.trim() ? "No results." : "Type to search."}
                      </div>
                    ) : (
                      searchResults.map((t: any) => {
                        const tid = String(t.id);
                        const already = currentIds.has(tid);
                        return (
                          <div key={tid} className="flex items-center justify-between gap-3 px-3 py-3">
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm font-semibold text-white/90">
                                {toStr(t.title, "Untitled")}
                              </div>
                              <div className="truncate text-xs text-white/55">
                                {toStr(t.trackArtist, "Unknown Artist")}
                                {t.album?.title ? ` • ${t.album.title}` : ""}
                              </div>
                            </div>

                            <button
                              type="button"
                              disabled={already}
                              onClick={() => void addTrackToPlaylist(tid)}
                              className={[
                                "shrink-0 rounded-full border px-3 py-1.5 text-xs transition",
                                already
                                  ? "border-white/10 bg-white/5 text-white/40"
                                  : "border-white/20 bg-white/10 text-white/80 hover:bg-white/15 hover:text-white",
                              ].join(" ")}
                              title={already ? "Already in playlist" : "Add"}
                            >
                              {already ? "Added" : "Add"}
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Delete confirmation modal */}
          <ConfirmModal
            open={confirmDeleteOpen}
            title="Delete playlist?"
            message={
              playlist?.name
                ? `“${playlist.name}” will be permanently deleted. This cannot be undone.`
                : "This cannot be undone."
            }
            confirmText="Delete"
            cancelText="Cancel"
            danger
            busy={deleting}
            onClose={() => {
              if (!deleting) setConfirmDeleteOpen(false);
            }}
            onConfirm={() => void deletePlaylist()}
          />
        </div>
      </div>
    </div>
  );
}
