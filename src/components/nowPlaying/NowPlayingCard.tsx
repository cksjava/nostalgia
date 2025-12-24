import React from "react";

export function NowPlayingCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/10 shadow-2xl shadow-black/30">
      <div className="p-5">{children}</div>
    </div>
  );
}
