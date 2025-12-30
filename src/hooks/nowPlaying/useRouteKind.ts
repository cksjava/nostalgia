import { useMemo } from "react";
import { useLocation } from "react-router-dom";

export type RouteKind = "album" | "playlist" | "favourites" | "unknown";

export function useRouteKind(): RouteKind {
  const location = useLocation();

  return useMemo(() => {
    const p = location.pathname;
    if (p.startsWith("/albums/")) return "album";
    if (p.startsWith("/playlists/")) return "playlist";
    if (p.startsWith("/favourites")) return "favourites";
    return "unknown";
  }, [location.pathname]);
}
