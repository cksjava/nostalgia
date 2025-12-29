import { axiosClient } from "../axiosService";
import type { Track, PlaylistTrack } from "../types/models";

export const tracksService = {
  async search(params?: {
    search?: string;
    limit?: number;
    offset?: number;

    // NEW:
    favourite?: 0 | 1;
    withAlbum?: 0 | 1;
  }): Promise<Track[]> {
    const res = await axiosClient.get<Track[]>("/tracks", { params });
    return res.data;
  },

  async getById(
    id: string,
    opts?: { withAlbum?: boolean; withPlaylists?: boolean }
  ): Promise<Track> {
    const res = await axiosClient.get<Track>(`/tracks/${id}`, {
      params: {
        withAlbum: opts?.withAlbum ? 1 : 0,
        withPlaylists: opts?.withPlaylists ? 1 : 0,
      },
    });
    return res.data;
  },

  async create(payload: Partial<Track> & { title: string; filePath: string }): Promise<Track> {
    const res = await axiosClient.post<Track>("/tracks", payload);
    return res.data;
  },

  async update(id: string, patch: Partial<Track>): Promise<Track> {
    const res = await axiosClient.put<Track>(`/tracks/${id}`, patch);
    return res.data;
  },

  async remove(id: string): Promise<{ ok: true }> {
    const res = await axiosClient.delete<{ ok: true }>(`/tracks/${id}`);
    return res.data;
  },

  async setFavourite(id: string, isFavourite: boolean): Promise<Track> {
    const res = await axiosClient.post<Track>(`/tracks/${id}/favourite`, { isFavourite });
    return res.data;
  },

  async addToPlaylist(
    id: string,
    playlistId: string,
    opts?: { position?: number | null }
  ): Promise<PlaylistTrack> {
    const res = await axiosClient.post<PlaylistTrack>(
      `/tracks/${id}/playlists/${playlistId}/add`,
      { position: opts?.position ?? null }
    );
    return res.data;
  },

  async removeFromPlaylist(id: string, playlistId: string): Promise<{ deleted: number }> {
    const res = await axiosClient.post<{ deleted: number }>(
      `/tracks/${id}/playlists/${playlistId}/remove`
    );
    return res.data;
  },

  async play(id: string, opts?: { positionSec?: number }): Promise<{ ok: true }> {
    const res = await axiosClient.post<{ ok: true }>(`/tracks/${id}/play`, {
      positionSec: opts?.positionSec ?? 0,
    });
    return res.data;
  },

};
