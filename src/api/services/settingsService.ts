import { axiosClient } from "../axiosService";
import type { Setting } from "../types/models";

export const settingsService = {
  async getAll(): Promise<Setting[]> {
    const res = await axiosClient.get<Setting[]>("/settings");
    return res.data;
  },

  async getByName(name: string): Promise<Setting> {
    const res = await axiosClient.get<Setting>(`/settings/${encodeURIComponent(name)}`);
    return res.data;
  },

  async upsert(name: string, value: string | null): Promise<Setting> {
    const res = await axiosClient.put<Setting>(`/settings/${encodeURIComponent(name)}`, { value });
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
    const res = await axiosClient.post<Setting>("/settings/music/folders/add", { folder });
    return res.data;
  },

  async removeMusicFolder(folder: string): Promise<Setting> {
    const res = await axiosClient.post<Setting>("/settings/music/folders/remove", { folder });
    return res.data;
  },

  async addMusicExtension(extension: string): Promise<Setting> {
    const res = await axiosClient.post<Setting>("/settings/music/extensions/add", { extension });
    return res.data;
  },

  async removeMusicExtension(extension: string): Promise<Setting> {
    const res = await axiosClient.post<Setting>("/settings/music/extensions/remove", { extension });
    return res.data;
  },
};
