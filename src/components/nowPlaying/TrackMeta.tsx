export function TrackMeta(props: {
  title: string;
  artist: string;
  album: string;
  isExplicit?: boolean;
}) {
  const { title, artist, album, isExplicit } = props;

  return (
    <div className="min-w-0">
      <div className="flex items-center gap-2">
        <h1 className="truncate text-2xl font-bold tracking-tight text-white">{title}</h1>
        {isExplicit ? (
          <span className="rounded-md bg-white/15 px-1.5 py-0.5 text-[10px] font-semibold text-white/80">
            E
          </span>
        ) : null}
      </div>
      <p className="truncate text-base font-medium text-white/80">{artist}</p>
      <p className="truncate text-sm text-white/55">Album: {album}</p>
    </div>
  );
}
