import { useEffect } from "react";

export function useExclusiveOverlays(params: {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (v: boolean) => void;
  isTrackListOpen: boolean;
  setIsTrackListOpen: (v: boolean) => void;
}) {
  const { isSidebarOpen, setIsSidebarOpen, isTrackListOpen, setIsTrackListOpen } = params;

  useEffect(() => {
    if (isSidebarOpen) setIsTrackListOpen(false);
  }, [isSidebarOpen, setIsTrackListOpen]);

  useEffect(() => {
    if (isTrackListOpen) setIsSidebarOpen(false);
  }, [isTrackListOpen, setIsSidebarOpen]);

  useEffect(() => {
    if (!isSidebarOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsSidebarOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isSidebarOpen, setIsSidebarOpen]);

  useEffect(() => {
    if (!isTrackListOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsTrackListOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isTrackListOpen, setIsTrackListOpen]);
}
