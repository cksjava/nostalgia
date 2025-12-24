export function Artwork({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/20">
      <img src={src} alt={alt} className="aspect-square w-full object-cover" loading="lazy" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/30" />
    </div>
  );
}
