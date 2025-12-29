export type Setting = {
  id: string;
  name: string;
  value: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Album = {
  id: string;
  title: string;
  albumArtist: string | null;
  albumArtists: string | null; // JSON string or CSV; backend stores TEXT
  year: number | null;
  genre: string | null;
  sourcePath: string | null;
  coverArtPath: string | null;
  trackCount: number | undefined;
  createdAt: string;
  updatedAt: string;
};

export type Track = {
  id: string;
  albumId: string | null;

  title: string;
  trackArtist: string | null;
  trackArtists: string | null; // JSON string or CSV
  albumArtist: string | null;

  trackNo: number | null;
  trackTotal: number | null;
  discNo: number | null;
  discTotal: number | null;

  year: number | null;
  genre: string | null;

  durationSec: number | null;
  sampleRate: number | null;
  bitDepth: number | null;
  channels: number | null;
  bitrateKbps: number | null;

  filePath: string;
  fileSizeBytes: number | null;
  fileMtimeMs: number | null;

  isFavourite: boolean;

  createdAt: string;
  updatedAt: string;

  album: any;
};

export type Playlist = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PlaylistTrack = {
  id: string;
  playlistId: string;
  trackId: string;
  position: number | null;
  createdAt: string;
  updatedAt: string;
};

export type ScanReport = {
  folders: string[];
  extensions: string[];
  foundFiles: number;
  createdTracks: number;
  updatedTracks: number;
  skippedUnchanged: number;
  createdAlbums: number;
  updatedAlbums: number;
  removedTracks: number;
  errors: Array<{ file: string; error: string }>;
};

export type AlbumTrack = {
  no: number;
  title: string;
  durationSec?: number;
};

export type FavouriteTrack = AlbumTrack & {
  artist: string;
  album?: string;
};
