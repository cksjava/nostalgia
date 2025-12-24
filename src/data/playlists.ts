export type Playlist = {
  id: string;
  name: string;
  createdAt: string; // ISO date string
  trackCount: number;
};

export const playlists: Playlist[] = [
  { id: "p1", name: "Morning Drive", createdAt: "2025-11-12", trackCount: 42 },
  { id: "p2", name: "Focus / Deep Work (No Vocals)", createdAt: "2025-10-03", trackCount: 68 },
  { id: "p3", name: "Old Bollywood Classics – High Energy", createdAt: "2025-08-19", trackCount: 55 },
  { id: "p4", name: "Chill Night", createdAt: "2025-12-01", trackCount: 23 },
  { id: "p5", name: "Test Playlist With a Very Very Long Name That Should Ellipsize Nicely", createdAt: "2025-12-18", trackCount: 9 },
];
