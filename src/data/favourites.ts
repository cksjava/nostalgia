import type { AlbumTrack } from "../types/nowPlaying";

export type FavouriteTrack = AlbumTrack & {
  artist: string;
  album?: string;
};

export const favouriteTracks: FavouriteTrack[] = [
  { no: 1, title: "Dreams", artist: "Fleetwood Mac", album: "Rumours", durationSec: 254 },
  { no: 2, title: "Baba O'Riley", artist: "The Who", album: "Who's Next", durationSec: 301 },
  { no: 3, title: "Time", artist: "Pink Floyd", album: "The Dark Side of the Moon", durationSec: 413 },
  { no: 4, title: "Hotel California", artist: "Eagles", album: "Hotel California", durationSec: 391 },
  { no: 5, title: "Africa", artist: "Toto", album: "Toto IV", durationSec: 296 },
  { no: 6, title: "Sultans of Swing", artist: "Dire Straits", album: "Dire Straits", durationSec: 347 },
  { no: 7, title: "Billie Jean", artist: "Michael Jackson", album: "Thriller", durationSec: 294 },
  { no: 8, title: "Take Five", artist: "The Dave Brubeck Quartet", album: "Time Out", durationSec: 324 },
  { no: 9, title: "Clair de Lune", artist: "Claude Debussy", album: "Suite bergamasque", durationSec: 302 },
  { no: 10, title: "Yesterday", artist: "The Beatles", album: "Help!", durationSec: 125 },
];
