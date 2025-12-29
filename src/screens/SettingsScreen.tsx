// src/screens/SettingsScreen.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faBars,
  faGear,
  faFolderOpen,
  faPlus,
  faTrash,
  faRotateRight,
  faWandMagicSparkles,
  faCheck,
  faTriangleExclamation,
  faCircleNotch,
} from "@fortawesome/free-solid-svg-icons";

import { SidebarDrawer } from "../components/common/SidebarDrawer";

// NEW services
import { settingsService } from "../api/services/settingsService";
import { libraryService } from "../api/services/libraryService";

const FOLDERS_KEY = "music.folders";
const EXTS_KEY = "music.extensions";

function csvToArray(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return String(raw)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function arrayToCsv(arr: string[]): string {
  return arr.map((s) => String(s).trim()).filter(Boolean).join(",");
}

function normalizeRoot(input: string) {
  const s = input.trim();
  if (!s) return "";
  return s.replace(/[\/]{2,}/g, "/");
}

function normalizeExt(input: string) {
  const s = input.trim().toLowerCase();
  if (!s) return "";
  return s.startsWith(".") ? s.slice(1) : s;
}

function uniqSorted(arr: string[]) {
  const set = new Set(arr.map((x) => x.trim()).filter(Boolean));
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

export default function SettingsScreen() {
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Settings data
  const [roots, setRoots] = useState<string[]>([]);
  const [exts, setExts] = useState<string[]>([]);

  // Inputs
  const [newRoot, setNewRoot] = useState("");
  const [newExt, setNewExt] = useState("");

  // Scan options
  const [dryRun, setDryRun] = useState(false);
  const [removeMissing, setRemoveMissing] = useState(true);

  // UI state
  const [loading, setLoading] = useState(true);
  const [savingRoots, setSavingRoots] = useState(false);
  const [savingExts, setSavingExts] = useState(false);
  const [scanning, setScanning] = useState(false);

  const [toast, setToast] = useState<{
    kind: "ok" | "warn" | "err";
    message: string;
  } | null>(null);

  // Close sidebar on Escape (consistent behavior)
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

  const bgStyle: React.CSSProperties = {
    backgroundImage: `
      radial-gradient(900px 600px at 18% 20%, rgba(255, 110, 90, 0.45), transparent 60%),
      radial-gradient(900px 600px at 85% 25%, rgba(110, 160, 255, 0.45), transparent 55%),
      radial-gradient(900px 700px at 70% 85%, rgba(190, 120, 255, 0.35), transparent 60%),
      linear-gradient(135deg, rgba(10, 12, 18, 0.92), rgba(8, 10, 16, 0.92))
    `,
  };

  // Debug display (now CSV, not JSON)
  const rootsCsv = useMemo(() => arrayToCsv(roots), [roots]);
  const extsCsv = useMemo(() => arrayToCsv(exts), [exts]);

  const load = async () => {
    setLoading(true);
    try {
      const [foldersSettled, extsSettled] = await Promise.allSettled([
        settingsService.getByName(FOLDERS_KEY),
        settingsService.getByName(EXTS_KEY),
      ]);

      const foldersRaw =
        foldersSettled.status === "fulfilled" ? foldersSettled.value.value : null;
      const extsRaw = extsSettled.status === "fulfilled" ? extsSettled.value.value : null;

      const loadedRoots = uniqSorted(csvToArray(foldersRaw).map(normalizeRoot).filter(Boolean));

      // Reasonable defaults if empty
      const defaultExts = ["flac", "mp3", "m4a", "aac", "wav", "ogg", "opus"];
      const loadedExts = uniqSorted(
        (csvToArray(extsRaw).length ? csvToArray(extsRaw) : defaultExts)
          .map(normalizeExt)
          .filter(Boolean)
      );

      setRoots(loadedRoots);
      setExts(loadedExts);
    } catch (e: any) {
      setToast({
        kind: "err",
        message: e?.response?.data?.error ?? e?.message ?? "Failed to load settings.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Folder actions (use backend endpoints) ----

  const onAddRoot = async () => {
    const r = normalizeRoot(newRoot);
    if (!r) return;
    setNewRoot("");

    // Optimistic update
    const next = uniqSorted([...roots, r]);
    setRoots(next);

    setSavingRoots(true);
    try {
      await settingsService.addMusicFolder(r);
      setToast({ kind: "ok", message: "Folder added." });
    } catch (e: any) {
      // rollback
      setRoots(roots);
      setToast({
        kind: "err",
        message: e?.response?.data?.error ?? e?.message ?? "Failed to add folder.",
      });
    } finally {
      setSavingRoots(false);
    }
  };

  const onRemoveRoot = async (root: string) => {
    const next = roots.filter((r) => r !== root);
    setRoots(next);

    setSavingRoots(true);
    try {
      await settingsService.removeMusicFolder(root);
      setToast({ kind: "ok", message: "Folder removed." });
    } catch (e: any) {
      // rollback
      setRoots(roots);
      setToast({
        kind: "err",
        message: e?.response?.data?.error ?? e?.message ?? "Failed to remove folder.",
      });
    } finally {
      setSavingRoots(false);
    }
  };

  // ---- Extension actions (use backend endpoints) ----

  const onAddExt = async () => {
    const e = normalizeExt(newExt);
    if (!e) return;
    setNewExt("");

    const next = uniqSorted([...exts, e]);
    setExts(next);

    setSavingExts(true);
    try {
      await settingsService.addMusicExtension(e);
      setToast({ kind: "ok", message: "Extension added." });
    } catch (err: any) {
      // rollback
      setExts(exts);
      setToast({
        kind: "err",
        message: err?.response?.data?.error ?? err?.message ?? "Failed to add extension.",
      });
    } finally {
      setSavingExts(false);
    }
  };

  const onRemoveExt = async (ext: string) => {
    const next = exts.filter((x) => x !== ext);
    setExts(next);

    setSavingExts(true);
    try {
      await settingsService.removeMusicExtension(ext);
      setToast({ kind: "ok", message: "Extension removed." });
    } catch (err: any) {
      // rollback
      setExts(exts);
      setToast({
        kind: "err",
        message: err?.response?.data?.error ?? err?.message ?? "Failed to remove extension.",
      });
    } finally {
      setSavingExts(false);
    }
  };

  const onResetExtsToDefaults = async () => {
    const defaults = ["flac", "mp3", "m4a", "aac", "wav", "ogg", "opus"];
    const normalized = uniqSorted(defaults.map(normalizeExt).filter(Boolean));
    setExts(normalized);

    setSavingExts(true);
    try {
      // since backend supports add/remove but not "replace list",
      // easiest is to upsert the raw setting value once:
      await settingsService.upsert(EXTS_KEY, arrayToCsv(normalized));
      setToast({ kind: "ok", message: "Extensions reset to defaults." });
    } catch (e: any) {
      setToast({
        kind: "err",
        message: e?.response?.data?.error ?? e?.message ?? "Failed to reset extensions.",
      });
      // reload to get server truth
      await load();
    } finally {
      setSavingExts(false);
    }
  };

  const onScan = async () => {
    if (roots.length === 0) {
      setToast({ kind: "warn", message: "Add at least one scan folder first." });
      return;
    }
    if (exts.length === 0) {
      setToast({ kind: "warn", message: "Add at least one extension first." });
      return;
    }

    setScanning(true);
    try {
      await libraryService.scan({ dryRun, removeMissing });
      setToast({ kind: "ok", message: dryRun ? "Dry-run scan completed." : "Scan completed." });
    } catch (e: any) {
      setToast({
        kind: "err",
        message: e?.response?.data?.error ?? e?.message ?? "Scan failed.",
      });
    } finally {
      setScanning(false);
    }
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

  return (
    <div className="min-h-screen w-full" style={bgStyle}>
      <div className="min-h-screen w-full backdrop-blur-2xl">
        {/* Top bar with Back + Menu */}
        <header className="mx-auto flex w-full max-w-md items-center justify-between px-4 pt-6">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="rounded-full p-2 text-white/75 hover:bg-white/10 hover:text-white"
              aria-label="Back"
              title="Back"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
            </button>

            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
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

        <main className="mx-auto w-full max-w-md px-4 pb-10 pt-4">
          <section className="rounded-[1.75rem] border border-white/10 bg-black/25 shadow-2xl shadow-black/40 backdrop-blur-2xl">
            <div className="flex h-[78vh] flex-col p-4">
              {/* Fixed top container */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="truncate text-base font-semibold text-white">Library settings</p>
                <p className="mt-1 text-xs text-white/55">
                  Configure scan folders and file extensions, then trigger a scan.
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void load()}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/15"
                    disabled={loading}
                    title="Reload settings"
                  >
                    <FontAwesomeIcon icon={loading ? faCircleNotch : faRotateRight} spin={loading} />
                    Reload
                  </button>

                  <button
                    type="button"
                    onClick={() => void onResetExtsToDefaults()}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/80 hover:bg-white/10 hover:text-white"
                    disabled={savingExts}
                    title="Reset extensions to common defaults"
                  >
                    <FontAwesomeIcon icon={faWandMagicSparkles} />
                    Defaults
                  </button>
                </div>
              </div>

              {/* Scrollable content container */}
              <div className="mt-4 min-h-0 flex-1">
                <div className="h-full overflow-hidden rounded-xl border border-white/10 bg-white/5">
                  <div className="h-full overflow-auto p-3">
                    {loading ? (
                      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/70">
                        <FontAwesomeIcon icon={faCircleNotch} spin className="text-white/60" />
                        Loading settings…
                      </div>
                    ) : (
                      <>
                        {/* Scan folders */}
                        <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-white">
                                Scan folders
                              </p>
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
                                if (e.key === "Enter") void onAddRoot();
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => void onAddRoot()}
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
                              <div className="bg-white/5 p-3 text-sm text-white/60">
                                No folders configured yet.
                              </div>
                            ) : (
                              <ul className="divide-y divide-white/10">
                                {roots.map((r) => (
                                  <li
                                    key={r}
                                    className="flex items-center justify-between gap-3 bg-white/5 px-3 py-2"
                                  >
                                    <span className="min-w-0 truncate font-mono text-xs text-white/85">
                                      {r}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => void onRemoveRoot(r)}
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

                          {/* Debug: show CSV stored */}
                          <div className="mt-2 text-[11px] text-white/35">
                            Stored as CSV:{" "}
                            <span className="font-mono text-white/45">{rootsCsv || "(empty)"}</span>
                          </div>
                        </div>

                        {/* Extensions */}
                        <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3">
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-white">
                                File extensions
                              </p>
                              <p className="mt-1 text-xs text-white/55">
                                Add without dots (example:{" "}
                                <span className="font-mono text-white/70">flac</span>,{" "}
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
                                if (e.key === "Enter") void onAddExt();
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => void onAddExt()}
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
                                    onClick={() => void onRemoveExt(e)}
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

                          {/* Debug: show CSV stored */}
                          <div className="mt-2 text-[11px] text-white/35">
                            Stored as CSV:{" "}
                            <span className="font-mono text-white/45">{extsCsv || "(empty)"}</span>
                          </div>
                        </div>

                        {/* Scan */}
                        <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3">
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-white">
                                Scan library
                              </p>
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
                              onClick={() => void onScan()}
                              disabled={scanning}
                              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/15 disabled:opacity-60"
                            >
                              <FontAwesomeIcon
                                icon={scanning ? faCircleNotch : faRotateRight}
                                spin={scanning}
                              />
                              {scanning ? "Scanning…" : "Scan now"}
                            </button>
                          </div>

                          {(roots.length === 0 || exts.length === 0) && (
                            <div className="mt-2 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/55">
                              <FontAwesomeIcon
                                icon={faTriangleExclamation}
                                className="mr-2 text-white/45"
                              />
                              Add at least one folder and one extension before scanning.
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Toast */}
              {toast && (
                <div className="mt-3">
                  <div
                    className={`flex items-start gap-2 rounded-xl border px-3 py-2 text-sm ${toastStyle}`}
                  >
                    <FontAwesomeIcon icon={toastIcon} className="mt-0.5 shrink-0" />
                    <span className="leading-snug">{toast.message}</span>
                  </div>
                </div>
              )}
            </div>
          </section>
        </main>

        <SidebarDrawer open={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      </div>
    </div>
  );
}
