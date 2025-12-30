import { axiosClient } from "../axiosService";
import type { Setting } from "../types/models";

/**
 * Audio devices + MPV options types (not stored in Sequelize Setting table)
 */
export type AudioDevice = {
  id: string; // e.g. "alsa/plughw:CARD=IQaudIODAC,DEV=0"
  backend: string; // "alsa"
  label: string; // human-friendly
  raw?: any;
};

export type AudioDevicesResponse = {
  source: "aplay -L" | "aplay -l" | "dummy" | string;
  devices: AudioDevice[];
};

export type MpvOpts = {
  ao: string; // e.g. "alsa"
  audioDevice: string; // e.g. "alsa/default" or "alsa/plughw:..."
  path?: string;
};

export type UpdateMpvOptsPayload = Partial<Pick<MpvOpts, "ao" | "audioDevice">>;

export type TestTonePayload = {
  freq?: number; // default 440
  seconds?: number; // default 2
  volume?: number; // default 90
};

export const settingsService = {
  /**
   * Existing Setting endpoints (Sequelize/SQLite)
   */
  async getAll(): Promise<Setting[]> {
    const res = await axiosClient.get<Setting[]>("/settings");
    return res.data;
  },

  async getByName(name: string): Promise<Setting> {
    const res = await axiosClient.get<Setting>(
      `/settings/${encodeURIComponent(name)}`
    );
    return res.data;
  },

  async upsert(name: string, value: string | null): Promise<Setting> {
    const res = await axiosClient.put<Setting>(
      `/settings/${encodeURIComponent(name)}`,
      { value }
    );
    return res.data;
  },

  async delete(name: string): Promise<{ deleted: number }> {
    const res = await axiosClient.delete<{ deleted: number }>(
      `/settings/${encodeURIComponent(name)}`
    );
    return res.data;
  },

  // Music setting actions
  async addMusicFolder(folder: string): Promise<Setting> {
    const res = await axiosClient.post<Setting>("/settings/music/folders/add", {
      folder,
    });
    return res.data;
  },

  async removeMusicFolder(folder: string): Promise<Setting> {
    const res = await axiosClient.post<Setting>(
      "/settings/music/folders/remove",
      { folder }
    );
    return res.data;
  },

  async addMusicExtension(extension: string): Promise<Setting> {
    const res = await axiosClient.post<Setting>(
      "/settings/music/extensions/add",
      { extension }
    );
    return res.data;
  },

  async removeMusicExtension(extension: string): Promise<Setting> {
    const res = await axiosClient.post<Setting>(
      "/settings/music/extensions/remove",
      { extension }
    );
    return res.data;
  },

  /**
   * New endpoints: ALSA audio devices + MPV opts (mpvopts.json)
   *
   * Backend routes assumed:
   *  - GET  /audio/devices
   *  - GET  /audio/mpvopts
   *  - PUT  /audio/mpvopts   body: { ao?, audioDevice? }
   */

  async getAudioDevices(): Promise<AudioDevicesResponse> {
    const res = await axiosClient.get<AudioDevicesResponse>("/audio/devices");
    return res.data;
  },

  async getMpvOpts(): Promise<MpvOpts> {
    const res = await axiosClient.get<MpvOpts>("/audio/mpvopts");
    return res.data;
  },

  async updateMpvOpts(payload: UpdateMpvOptsPayload): Promise<{
    ok: boolean;
    saved: Pick<MpvOpts, "ao" | "audioDevice">;
    path?: string;
  }> {
    const res = await axiosClient.put<{
      ok: boolean;
      saved: Pick<MpvOpts, "ao" | "audioDevice">;
      path?: string;
    }>("/audio/mpvopts", payload);
    return res.data;
  },

  /**
   * Convenience helpers for components
   */

  async setDefaultAudioDevice(audioDevice: string) {
    return this.updateMpvOpts({ audioDevice });
  },

  async setDefaultAo(ao: string) {
    return this.updateMpvOpts({ ao });
  },

  async refreshDevicesAndOpts(): Promise<{ devices: AudioDevicesResponse; opts: MpvOpts }> {
    const [devices, opts] = await Promise.all([this.getAudioDevices(), this.getMpvOpts()]);
    return { devices, opts };
  },

  async restartMpv(): Promise<{ ok: boolean; state?: any }> {
    const res = await axiosClient.post<{ ok: boolean; state?: any }>("/mpv/restart", {});
    return res.data;
  },

  async testTone(payload: TestTonePayload = {}): Promise<{
    ok: boolean;
    freq: number;
    seconds: number;
    volume: number;
  }> {
    const res = await axiosClient.post<{
      ok: boolean;
      freq: number;
      seconds: number;
      volume: number;
    }>("/mpv/test-tone", payload);
    return res.data;
  },

};
