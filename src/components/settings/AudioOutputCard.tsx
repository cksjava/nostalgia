import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleNotch,
  faPlugCircleBolt,
  faRotateRight,
  faFloppyDisk,
  faTriangleExclamation,
  faCheck,
  faPowerOff,
  faVolumeHigh,
} from "@fortawesome/free-solid-svg-icons";
import {
  settingsService,
  type AudioDevice,
  type MpvOpts,
} from "../../api/services/settingsService";
import type { Toast } from "./types";

function friendlySourceLabel(source: string) {
  if (source === "dummy") return "Dummy (dev)";
  if (source === "aplay -L") return "ALSA (aplay -L)";
  if (source === "aplay -l") return "ALSA (aplay -l)";
  return source || "Unknown";
}

export function AudioOutputCard(props: { onToast: (t: Toast) => void }) {
  const { onToast } = props;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [restarting, setRestarting] = useState(false);
  const [testing, setTesting] = useState(false);

  const [source, setSource] = useState<string>("");
  const [devices, setDevices] = useState<AudioDevice[]>([]);
  const [opts, setOpts] = useState<MpvOpts | null>(null);

  const [selected, setSelected] = useState<string>("");

  const load = async () => {
    setLoading(true);
    try {
      const { devices: devs, opts: mpvOpts } = await settingsService.refreshDevicesAndOpts();
      setSource(devs.source);
      setDevices(devs.devices || []);
      setOpts(mpvOpts);

      const current = mpvOpts?.audioDevice || "";
      setSelected(current);
    } catch (e: any) {
      onToast({
        kind: "err",
        message: e?.response?.data?.error ?? e?.message ?? "Failed to load audio devices.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentDeviceId = opts?.audioDevice || "";
  const isDirty = selected && selected !== currentDeviceId;

  const selectedLabel = useMemo(() => {
    const found = devices.find((d) => d.id === selected);
    return found?.label || selected || "";
  }, [devices, selected]);

  const onSave = async () => {
    if (!selected) return;

    setSaving(true);
    try {
      const res = await settingsService.setDefaultAudioDevice(selected);

      setOpts((prev) => ({
        ...(prev || { ao: "alsa", audioDevice: selected }),
        audioDevice: res.saved.audioDevice,
        ao: res.saved.ao,
      }));

      onToast({
        kind: "ok",
        message: "Default device saved to mpvopts.json.",
      });
    } catch (e: any) {
      onToast({
        kind: "err",
        message:
          e?.response?.data?.message ??
          e?.response?.data?.error ??
          e?.message ??
          "Failed to save audio device.",
      });
    } finally {
      setSaving(false);
    }
  };

  const onRestartMpv = async () => {
    setRestarting(true);
    try {
      await settingsService.restartMpv();
      onToast({ kind: "ok", message: "MPV restarted." });
    } catch (e: any) {
      onToast({
        kind: "err",
        message: e?.response?.data?.error ?? e?.message ?? "Failed to restart MPV.",
      });
    } finally {
      setRestarting(false);
    }
  };

  const onTestPlayback = async () => {
    setTesting(true);
    try {
      await settingsService.testTone({ freq: 440, seconds: 2, volume: 90 });
      onToast({ kind: "ok", message: "Test tone played." });
    } catch (e: any) {
      onToast({
        kind: "err",
        message:
          e?.response?.data?.error ??
          e?.response?.data?.message ??
          e?.message ??
          "Test tone failed.",
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">Audio output</p>
          <p className="mt-1 text-xs text-white/55">
            Choose the ALSA output device used by MPV and apply instantly.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void load()}
          className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white disabled:opacity-60"
          disabled={loading || saving || restarting || testing}
          title="Reload devices"
        >
          <FontAwesomeIcon icon={loading ? faCircleNotch : faRotateRight} spin={loading} />
          <span className="ml-2">Reload</span>
        </button>
      </div>

      <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2 text-xs text-white/55">
            <FontAwesomeIcon icon={faPlugCircleBolt} className="text-white/45" />
            <span>Source: {friendlySourceLabel(source)}</span>
          </div>

          {opts?.audioDevice ? (
            <div className="inline-flex items-center gap-2 text-xs text-white/55">
              <FontAwesomeIcon icon={faCheck} className="text-white/45" />
              <span className="font-mono text-white/60">Current: {opts.audioDevice}</span>
            </div>
          ) : null}
        </div>

        {loading ? (
          <div className="mt-3 flex items-center gap-2 text-sm text-white/70">
            <FontAwesomeIcon icon={faCircleNotch} spin className="text-white/60" />
            Loading audio devices…
          </div>
        ) : devices.length === 0 ? (
          <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white/60">
            <FontAwesomeIcon icon={faTriangleExclamation} className="mr-2 text-white/45" />
            No devices returned.
          </div>
        ) : (
          <div className="mt-3 grid gap-3">
            <label className="text-xs font-semibold text-white/70">Default device</label>

            <div className="flex items-center gap-2">
              <select
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white/90 outline-none"
                disabled={saving || restarting || testing}
              >
                <option value="" disabled>
                  Select a device…
                </option>
                {devices.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => void onSave()}
                disabled={!isDirty || saving || restarting || testing}
                className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/15 disabled:opacity-60"
                title="Save default device"
              >
                <FontAwesomeIcon icon={saving ? faCircleNotch : faFloppyDisk} spin={saving} />
                Save
              </button>
            </div>

            <div className="text-[11px] text-white/40">
              Selected: <span className="font-mono text-white/55">{selectedLabel || "(none)"}</span>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => void onRestartMpv()}
                disabled={restarting || saving || loading || testing}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/15 disabled:opacity-60"
                title="Restart MPV to apply changes immediately"
              >
                <FontAwesomeIcon icon={restarting ? faCircleNotch : faPowerOff} spin={restarting} />
                Restart MPV
              </button>

              <button
                type="button"
                onClick={() => void onTestPlayback()}
                disabled={testing || saving || loading || restarting}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/85 hover:bg-white/10 hover:text-white disabled:opacity-60"
                title="Play a short test tone"
              >
                <FontAwesomeIcon icon={testing ? faCircleNotch : faVolumeHigh} spin={testing} />
                Test playback
              </button>
            </div>

            <div className="text-[11px] text-white/35">
              Tip: Save → Restart MPV → Test playback.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
