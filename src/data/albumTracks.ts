import type { AlbumTrack } from "../types/nowPlaying";

export type AlbumTracksMap = Record<string, AlbumTrack[]>;

export const albumTracks: AlbumTracksMap = {
  rumours: [
    { no: 1, title: "Second Hand News", durationSec: 163 },
    { no: 2, title: "Dreams", durationSec: 258 },
    { no: 3, title: "Never Going Back Again", durationSec: 134 },
    { no: 4, title: "Don't Stop", durationSec: 191 },
    { no: 5, title: "Go Your Own Way", durationSec: 223 },
    { no: 6, title: "Songbird", durationSec: 200 },
  ],
  "abbey-road": [
    { no: 1, title: "Come Together", durationSec: 259 },
    { no: 2, title: "Something", durationSec: 183 },
    { no: 3, title: "Maxwell's Silver Hammer", durationSec: 207 },
    { no: 4, title: "Oh! Darling", durationSec: 206 },
  ],
  "random-access-memories": [
    { no: 1, title: "Give Life Back to Music", durationSec: 275 },
    { no: 2, title: "Get Lucky", durationSec: 369 },
    { no: 3, title: "Instant Crush", durationSec: 337 },
  ],
};
