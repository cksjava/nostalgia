import { axiosClient } from "../axiosService";
import type { Playlist } from "../types/models";

export const playlistsService = {
  async list(): Promise<Playlist[]> {
    const res = await axiosClient.get<Playlist[]>("/playlists");
    return res.data;
  },

  async getById(id: string, opts?: { withTracks?: boolean }): Promise<any> {
    // If you want strictly typed playlist-with-tracks response, we can define that type next.
    const res = await axiosClient.get<any>(`/playlists/${id}`, {
      params: { withTracks: opts?.withTracks ? 1 : 0 },
    });
    return res.data;
  },

  async create(payload: { name: string; description?: string | null }): Promise<Playlist> {
    const res = await axiosClient.post<Playlist>("/playlists", payload);
    return res.data;
  },

  async update(id: string, patch: Partial<Playlist>): Promise<Playlist> {
    const res = await axiosClient.put<Playlist>(`/playlists/${id}`, patch);
    return res.data;
  },

  async remove(id: string): Promise<{ ok: true }> {
    const res = await axiosClient.delete<{ ok: true }>(`/playlists/${id}`);
    return res.data;
  },

  async addTracks(
    id: string,
    trackIds: string[],
    opts?: { startPosition?: number | null }
  ): Promise<{ ok: true }> {
    const res = await axiosClient.post<{ ok: true }>(`/playlists/${id}/tracks/add`, {
      trackIds,
      startPosition: opts?.startPosition ?? null,
    });
    return res.data;
  },

  async removeTracks(id: string, trackIds: string[]): Promise<{ deleted: number }> {
    const res = await axiosClient.post<{ deleted: number }>(`/playlists/${id}/tracks/remove`, {
      trackIds,
    });
    return res.data;
  },
};
