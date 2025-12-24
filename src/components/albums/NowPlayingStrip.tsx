// src/components/albums/NowPlayingStrip.tsx
import type { NowPlayingData } from "../../types/nowPlaying";

export function NowPlayingStrip(props: { nowPlaying: NowPlayingData }) {
  const { nowPlaying } = props;

  return (
    <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 overflow-hidden rounded-xl border border-white/10 bg-white/5">
          <img
            src={nowPlaying.artwork.url}
            alt={nowPlaying.artwork.alt}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[11px] tracking-widest text-white/45">NOW PLAYING</p>
          <p className="truncate text-sm font-semibold text-white/85">
            {nowPlaying.track.title}
          </p>
          <p className="truncate text-xs text-white/55">
            {nowPlaying.track.artist} • {nowPlaying.track.album}
          </p>
        </div>

        <div className="max-w-[110px] truncate text-[11px] text-white/40">
          {nowPlaying.deviceName}
        </div>
      </div>
    </div>
  );
}
