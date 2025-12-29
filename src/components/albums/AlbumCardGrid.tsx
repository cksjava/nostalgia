import type { AlbumUI } from "../../screens/AlbumsScreen";

export function AlbumCardGrid(props: { album: AlbumUI; onClick?: () => void }) {
  const { album, onClick } = props;

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-full text-left",
        "rounded-2xl border border-white/10 bg-white/5",
        "transition hover:bg-white/10",
      ].join(" ")}
    >
      <div className="p-3">
        {/* Cover */}
        <div className="aspect-square w-full overflow-hidden rounded-xl border border-white/10 bg-white/5">
          <img
            src={album.artworkUrl}
            alt={`${album.title} cover`}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>

        {/* Details */}
        <div className="mt-3">
          <p className="truncate text-base font-semibold text-white">{album.title}</p>
          <p className="truncate text-sm text-white/65">{album.artists.join(", ")}</p>

          <p className="mt-1 text-xs text-white/45">
            {album.year ? `${album.year}` : ""}
            {album.year && album.trackCount ? " • " : ""}
            {album.trackCount ? `${album.trackCount} tracks` : ""}
          </p>
        </div>
      </div>
    </button>
  );
}
