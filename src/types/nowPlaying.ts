export type RepeatMode = "off" | "one" | "all";

export type AlbumTrack = {
  no: number;
  title: string;
  durationSec?: number;
};

export type NowPlayingData = {
  deviceName: string;
  artwork: { url: string; alt: string };
  track: {
    title: string;
    artist: string;
    album: string;
    isExplicit?: boolean;
  };
  album?: {
    title: string;
    artist: string;
    tracks: AlbumTrack[];
    currentTrackNo?: number;
  };
  playback: {
    isPlaying: boolean;
    shuffle: boolean;
    repeatMode: RepeatMode;
    positionSec: number;
    durationSec: number;
    volume: number; // 0..100
  };
};
