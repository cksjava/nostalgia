import { axiosClient } from "../axiosService";
import type { ScanReport } from "../types/models";

export const libraryService = {
  async scan(opts?: { removeMissing?: boolean; dryRun?: boolean }): Promise<ScanReport> {
    const res = await axiosClient.post<ScanReport>("/library/scan", {
      removeMissing: !!opts?.removeMissing,
      dryRun: !!opts?.dryRun,
    });
    return res.data;
  },
};
