// src/api/services/playerService.ts
import { axiosClient } from "../axiosService";

export type PlayerPausePayload = { paused: boolean };
export type PlayerSeekPayload = { positionSec: number };
export type PlayerSetVolumePayload = { volume: number }; // 0..100

export const playerService = {
  /**
   * Pause / resume playback
   * Backend: POST /player/pause
   */
  async pause(paused: boolean): Promise<{ ok: true }> {
    const res = await axiosClient.post<{ ok: true }>("/player/pause", { paused } as PlayerPausePayload);
    return res.data;
  },

  /**
   * Seek to absolute position (seconds)
   * Backend: POST /player/seek
   */
  async seek(positionSec: number): Promise<{ ok: true }> {
    const res = await axiosClient.post<{ ok: true }>("/player/seek", { positionSec } as PlayerSeekPayload);
    return res.data;
  },

  /**
   * Set volume (0..100)
   * Backend: POST /player/set-volume
   */
  async setVolume(volume: number): Promise<{ ok: true }> {
    const vol = Math.max(0, Math.min(100, Number(volume) || 0));
    const res = await axiosClient.post<{ ok: true }>("/player/set-volume", { volume: vol } as PlayerSetVolumePayload);
    return res.data;
  },
};
