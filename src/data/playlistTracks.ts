import type { AlbumTrack } from "../types/nowPlaying";

export type PlaylistTrack = AlbumTrack & {
  artist: string;
  album?: string;
};

export const playlistTracks: Record<string, PlaylistTrack[]> = {
  p1: [
    { no: 1, title: "Sunrise Avenue", artist: "Various Artists", durationSec: 214, album: "Morning Drive" },
    { no: 2, title: "Highway Lines", artist: "Neon City", durationSec: 189, album: "Neon City" },
    { no: 3, title: "Coffee & Code", artist: "LoFi Bureau", durationSec: 245, album: "Focus" },
    { no: 4, title: "Signal Drift", artist: "Synth Lab", durationSec: 203, album: "Flow State" },
    { no: 5, title: "Blue Hour", artist: "Ambient Works", durationSec: 268, album: "Dusk" },
    { no: 6, title: "Citylight Run", artist: "Night Arcade", durationSec: 231, album: "Arcade Nights" },
    { no: 7, title: "Calm Current", artist: "Ocean Tones", durationSec: 197, album: "Coastline" },
    { no: 8, title: "Quiet Momentum", artist: "Focus FM", durationSec: 256, album: "Momentum" },
    { no: 9, title: "Warm Static", artist: "Tape Machine", durationSec: 221, album: "Cassette Days" },
    { no: 10, title: "Late Night Merge", artist: "Codewave", durationSec: 242, album: "Merge" },
    { no: 11, title: "Soft Horizon", artist: "Skyline Echo", durationSec: 205, album: "Horizon" },
    { no: 12, title: "Saffron Streets", artist: "Indie Atlas", durationSec: 234, album: "Atlas" },
    { no: 13, title: "Monsoon Pulse", artist: "Rainroom", durationSec: 219, album: "Monsoon" },
    { no: 14, title: "Minimal Morning", artist: "LoFi Bureau", durationSec: 188, album: "Focus" },
    { no: 15, title: "Gradient Drive", artist: "Neon City", durationSec: 260, album: "Neon City" },
    { no: 16, title: "Sidechain Sunshine", artist: "Synth Lab", durationSec: 244, album: "Compression" },
    { no: 17, title: "Parallel Lines", artist: "Night Arcade", durationSec: 212, album: "Arcade Nights" },
    { no: 18, title: "Coffee Refill", artist: "Codewave", durationSec: 173, album: "Merge" },
    { no: 19, title: "Long Road Home", artist: "Various Artists", durationSec: 281, album: "Roadmix" },
    { no: 20, title: "Window Seat", artist: "Ocean Tones", durationSec: 207, album: "Coastline" },
    { no: 21, title: "Quiet Engine", artist: "Tape Machine", durationSec: 226, album: "Cassette Days" },
    { no: 22, title: "Afterglow", artist: "Skyline Echo", durationSec: 238, album: "Horizon" },
    { no: 23, title: "Signal Boost", artist: "Focus FM", durationSec: 201, album: "Momentum" },
    { no: 24, title: "Last Exit", artist: "Indie Atlas", durationSec: 257, album: "Atlas" },
    { no: 25, title: "Sunset Loop", artist: "Rainroom", durationSec: 263, album: "Monsoon" },
  ],
  p2: [
    { no: 1, title: "Deep Focus I", artist: "Ambient Works", durationSec: 310, album: "Deep Work" },
    { no: 2, title: "No Vocals Please", artist: "Synth Lab", durationSec: 268, album: "Flow State" },
  ],
  p3: [
    { no: 1, title: "Classic Hit 1", artist: "Legend Artist", durationSec: 232 },
    { no: 2, title: "Classic Hit 2", artist: "Legend Artist", durationSec: 198 },
  ],
};
