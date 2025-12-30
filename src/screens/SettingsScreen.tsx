// src/screens/SettingsScreen.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { SidebarDrawer } from "../components/common/SidebarDrawer";
import { settingsService } from "../api/services/settingsService";
import { libraryService } from "../api/services/libraryService";

import { SettingsHeader } from "../components/settings/SettingsHeader";
import { LibrarySettingsIntro } from "../components/settings/LibrarySettingsIntro";
import { ScanFoldersCard } from "../components/settings/ScanFoldersCard";
import { ExtensionsCard } from "../components/settings/ExtensionsCard";
import { ScanCard } from "../components/settings/ScanCard";
import { AudioOutputCard } from "../components/settings/AudioOutputCard";
import { SettingsToast } from "../components/settings/SettingsToast";

import type { Toast } from "../components/settings/types";
import { arrayToCsv, csvToArray, normalizeExt, normalizeRoot, uniqSorted } from "../components/settings/utils";

const FOLDERS_KEY = "music.folders";
const EXTS_KEY = "music.extensions";

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

  const [toast, setToast] = useState<Toast>(null);

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

  const bgStyle: React.CSSProperties = {
    backgroundImage: `
      radial-gradient(900px 600px at 18% 20%, rgba(255, 110, 90, 0.45), transparent 60%),
      radial-gradient(900px 600px at 85% 25%, rgba(110, 160, 255, 0.45), transparent 55%),
      radial-gradient(900px 700px at 70% 85%, rgba(190, 120, 255, 0.35), transparent 60%),
      linear-gradient(135deg, rgba(10, 12, 18, 0.92), rgba(8, 10, 16, 0.92))
    `,
  };

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
      const extsRaw =
        extsSettled.status === "fulfilled" ? extsSettled.value.value : null;

      const loadedRoots = uniqSorted(csvToArray(foldersRaw).map(normalizeRoot).filter(Boolean));

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

  // ---- Folder actions ----
  const onAddRoot = async () => {
    const r = normalizeRoot(newRoot);
    if (!r) return;
    setNewRoot("");

    const prev = roots;
    const next = uniqSorted([...prev, r]);
    setRoots(next);

    setSavingRoots(true);
    try {
      await settingsService.addMusicFolder(r);
      setToast({ kind: "ok", message: "Folder added." });
    } catch (e: any) {
      setRoots(prev);
      setToast({
        kind: "err",
        message: e?.response?.data?.error ?? e?.message ?? "Failed to add folder.",
      });
    } finally {
      setSavingRoots(false);
    }
  };

  const onRemoveRoot = async (root: string) => {
    const prev = roots;
    const next = prev.filter((r) => r !== root);
    setRoots(next);

    setSavingRoots(true);
    try {
      await settingsService.removeMusicFolder(root);
      setToast({ kind: "ok", message: "Folder removed." });
    } catch (e: any) {
      setRoots(prev);
      setToast({
        kind: "err",
        message: e?.response?.data?.error ?? e?.message ?? "Failed to remove folder.",
      });
    } finally {
      setSavingRoots(false);
    }
  };

  // ---- Extension actions ----
  const onAddExt = async () => {
    const e = normalizeExt(newExt);
    if (!e) return;
    setNewExt("");

    const prev = exts;
    const next = uniqSorted([...prev, e]);
    setExts(next);

    setSavingExts(true);
    try {
      await settingsService.addMusicExtension(e);
      setToast({ kind: "ok", message: "Extension added." });
    } catch (err: any) {
      setExts(prev);
      setToast({
        kind: "err",
        message: err?.response?.data?.error ?? err?.message ?? "Failed to add extension.",
      });
    } finally {
      setSavingExts(false);
    }
  };

  const onRemoveExt = async (ext: string) => {
    const prev = exts;
    const next = prev.filter((x) => x !== ext);
    setExts(next);

    setSavingExts(true);
    try {
      await settingsService.removeMusicExtension(ext);
      setToast({ kind: "ok", message: "Extension removed." });
    } catch (err: any) {
      setExts(prev);
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
      await settingsService.upsert(EXTS_KEY, arrayToCsv(normalized));
      setToast({ kind: "ok", message: "Extensions reset to defaults." });
    } catch (e: any) {
      setToast({
        kind: "err",
        message: e?.response?.data?.error ?? e?.message ?? "Failed to reset extensions.",
      });
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

  return (
    <div className="min-h-screen w-full" style={bgStyle}>
      <div className="min-h-screen w-full backdrop-blur-2xl">
        <SettingsHeader
          onBack={() => navigate("/")}
          onOpenMenu={() => setIsSidebarOpen(true)}
        />

        <main className="mx-auto w-full max-w-md px-4 pb-10 pt-4">
          <section className="rounded-[1.75rem] border border-white/10 bg-black/25 shadow-2xl shadow-black/40 backdrop-blur-2xl">
            <div className="flex h-[78vh] flex-col p-4">
              <LibrarySettingsIntro
                loading={loading}
                savingExts={savingExts}
                onReload={() => void load()}
                onDefaults={() => void onResetExtsToDefaults()}
              />

              <div className="mt-4 min-h-0 flex-1">
                <div className="h-full overflow-hidden rounded-xl border border-white/10 bg-white/5">
                  <div className="h-full overflow-auto p-3">
                    {loading ? (
                      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/70">
                        Loading settings…
                      </div>
                    ) : (
                      <>
                        {/* NEW: Audio output card */}
                        <AudioOutputCard onToast={setToast} />

                        <div className="mt-4">
                          <ScanFoldersCard
                            roots={roots}
                            newRoot={newRoot}
                            setNewRoot={setNewRoot}
                            savingRoots={savingRoots}
                            onAddRoot={onAddRoot}
                            onRemoveRoot={onRemoveRoot}
                            rootsCsv={rootsCsv}
                          />
                        </div>

                        <div className="mt-4">
                          <ExtensionsCard
                            exts={exts}
                            newExt={newExt}
                            setNewExt={setNewExt}
                            savingExts={savingExts}
                            onAddExt={onAddExt}
                            onRemoveExt={onRemoveExt}
                            extsCsv={extsCsv}
                          />
                        </div>

                        <div className="mt-4">
                          <ScanCard
                            roots={roots}
                            exts={exts}
                            dryRun={dryRun}
                            setDryRun={setDryRun}
                            removeMissing={removeMissing}
                            setRemoveMissing={setRemoveMissing}
                            scanning={scanning}
                            onScan={onScan}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <SettingsToast toast={toast} />
            </div>
          </section>
        </main>

        <SidebarDrawer open={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      </div>
    </div>
  );
}
