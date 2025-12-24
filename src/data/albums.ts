export type Album = {
  id: string;
  title: string;
  artists: string[];
  year?: number;
  trackCount?: number;
  artworkUrl: string; // placeholder.co
};

const cover = (label: string) =>
  `https://placehold.co/800x800/png?text=${encodeURIComponent(label)}`;

export const albums: Album[] = [
  {
    id: "rumours",
    title: "Rumours",
    artists: ["Fleetwood Mac"],
    year: 1977,
    trackCount: 11,
    artworkUrl: cover("Rumours"),
  },
  {
    id: "abbey-road",
    title: "Abbey Road",
    artists: ["The Beatles"],
    year: 1969,
    trackCount: 17,
    artworkUrl: cover("Abbey Road"),
  },
  {
    id: "random-access-memories",
    title: "Random Access Memories",
    artists: ["Daft Punk"],
    year: 2013,
    trackCount: 13,
    artworkUrl: cover("RAM"),
  },
  {
    id: "back-to-black",
    title: "Back to Black",
    artists: ["Amy Winehouse"],
    year: 2006,
    trackCount: 11,
    artworkUrl: cover("Back to Black"),
  },
  {
    id: "thriller",
    title: "Thriller",
    artists: ["Michael Jackson"],
    year: 1982,
    trackCount: 9,
    artworkUrl: cover("Thriller"),
  },
  {
    id: "dark-side",
    title: "The Dark Side of the Moon",
    artists: ["Pink Floyd"],
    year: 1973,
    trackCount: 10,
    artworkUrl: cover("Dark Side"),
  },
];
