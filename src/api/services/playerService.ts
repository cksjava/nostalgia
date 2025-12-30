// src/api/services/playerService.ts
import { axiosClient } from "../axiosService";
import axios from "axios";

export type PlayerPausePayload =
  | { paused: boolean }
  | { toggle: true };

export type PlayerSeekPayload =
  | { positionSec: number }
  | { deltaSec: number };

export type PlayerSetVolumePayload = { volume: number }; // 0..100

export type PlayerState = {
  ok: true;
  paused: boolean | null;
  positionSec: number | null;
  durationSec: number | null;
  volume: number | null;
  path: string | null;
};

export type PlayerResumeResponse = {
  ok: true;
  paused: boolean;
  positionSec: number | null;
  path: string;
};

function clampVolume(volume: number) {
  const vol = Number(volume);
  if (!Number.isFinite(vol)) return 0;
  return Math.max(0, Math.min(100, vol));
}

export const playerService = {
  /**
   * Pause / resume playback
   * Backend: POST /player/pause
   * Returns paused state (backend now returns it)
   */
  async pause(paused: boolean): Promise<{ ok: true; paused: boolean | null }> {
    const res = await axiosClient.post<{ ok: true; paused: boolean | null }>(
      "/player/pause",
      { paused } as PlayerPausePayload
    );
    return res.data;
  },

  /**
   * Toggle pause
   * Backend: POST /player/pause  body: { toggle:true }
   */
  async togglePause(): Promise<{ ok: true; mode: "toggle"; paused: boolean | null }> {
    const res = await axiosClient.post<{ ok: true; mode: "toggle"; paused: boolean | null }>(
      "/player/pause",
      { toggle: true } as PlayerPausePayload
    );
    return res.data;
  },

  /**
   * Resume playback (independent of NowPlaying screen load)
   * Backend: POST /player/resume
   * If mpv has nothing loaded, backend returns 409.
   */
  async resume(): Promise<PlayerResumeResponse> {
    const res = await axiosClient.post<PlayerResumeResponse>("/player/resume", {});
    return res.data;
  },

  /**
   * Helper: try to resume; if mpv has nothing loaded (409), return null.
   * Useful for Play button behavior.
   */
  async tryResume(): Promise<PlayerResumeResponse | null> {
    try {
      return await this.resume();
    } catch (e: any) {
      if (axios.isAxiosError(e) && e.response?.status === 409) return null;
      throw e;
    }
  },

  /**
   * Get mpv state (pause/time-pos/duration/volume/path)
   * Backend: GET /player/state
   */
  async getState(): Promise<PlayerState> {
    const res = await axiosClient.get<PlayerState>("/player/state");
    return res.data;
  },

  /**
   * Seek to absolute position (seconds)
   * Backend: POST /player/seek  body: { positionSec }
   */
  async seek(positionSec: number): Promise<{ ok: true; positionSec: number }> {
    const pos = Number(positionSec);
    const res = await axiosClient.post<{ ok: true; positionSec: number }>(
      "/player/seek",
      { positionSec: pos } as PlayerSeekPayload
    );
    return res.data;
  },

  /**
   * Relative seek (+/- seconds)
   * Backend: POST /player/seek  body: { deltaSec }
   */
  async seekBy(deltaSec: number): Promise<{ ok: true; deltaSec: number }> {
    const d = Number(deltaSec);
    const res = await axiosClient.post<{ ok: true; deltaSec: number }>(
      "/player/seek",
      { deltaSec: d } as PlayerSeekPayload
    );
    return res.data;
  },

  /**
   * Set volume (0..100)
   * Backend: POST /player/set-volume
   * Backend now returns actual volume too (we accept either).
   */
  async setVolume(volume: number): Promise<{ ok: true; volume?: number }> {
    const vol = clampVolume(volume);
    const res = await axiosClient.post<{ ok: true; volume?: number }>(
      "/player/set-volume",
      { volume: vol } as PlayerSetVolumePayload
    );
    return res.data;
  },
};
