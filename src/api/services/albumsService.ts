import { axiosClient } from "../axiosService";
import type { Album } from "../types/models";

export const albumsService = {
  async search(params?: { search?: string; limit?: number; offset?: number }): Promise<Album[]> {
    const res = await axiosClient.get<Album[]>("/albums", { params });
    return res.data;
  },

  async getById(id: string, opts?: { withTracks?: boolean }): Promise<Album> {
    const res = await axiosClient.get<Album>(`/albums/${id}`, {
      params: { withTracks: opts?.withTracks ? 1 : 0 },
    });
    return res.data;
  },

  async create(payload: Partial<Album> & { title: string }): Promise<Album> {
    const res = await axiosClient.post<Album>("/albums", payload);
    return res.data;
  },

  async update(id: string, patch: Partial<Album>): Promise<Album> {
    const res = await axiosClient.put<Album>(`/albums/${id}`, patch);
    return res.data;
  },

  async remove(id: string): Promise<{ ok: true }> {
    const res = await axiosClient.delete<{ ok: true }>(`/albums/${id}`);
    return res.data;
  },
};
