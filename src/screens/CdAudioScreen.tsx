import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// import { cdTracks } from "../data/cdTracks";
import { SidebarDrawer } from "../components/common/SidebarDrawer";

import { CdHeader } from "../components/cd/CdHeader";
import { CdControls } from "../components/cd/CdControls";
// import { CdTrackRow } from "../components/cd/CdTrackRow";

export default function CdAudioScreen() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const bgStyle: React.CSSProperties = {
    backgroundImage: `
      radial-gradient(900px 600px at 18% 20%, rgba(255, 110, 90, 0.45), transparent 60%),
      radial-gradient(900px 600px at 85% 25%, rgba(110, 160, 255, 0.45), transparent 55%),
      radial-gradient(900px 700px at 70% 85%, rgba(190, 120, 255, 0.35), transparent 60%),
      linear-gradient(135deg, rgba(10, 12, 18, 0.92), rgba(8, 10, 16, 0.92))
    `,
  };

  const startPlayback = (trackNo?: number, shuffle = false) => {
    // Later: send to backend / mpv / CD controller
    console.log("CD playback:", { trackNo, shuffle });

    navigate("/", {
      state: {
        fromSource: "cd",
        trackNo,
        shuffle,
      },
    });
  };

  return (
    <div className="min-h-screen w-full" style={bgStyle}>
      <div className="min-h-screen w-full backdrop-blur-2xl">
        {/* Header with hamburger */}
        <CdHeader onOpenSidebar={() => setIsSidebarOpen(true)} />

        <main className="mx-auto w-full max-w-md px-4 pb-10 pt-4">
          <section className="rounded-[1.75rem] border border-white/10 bg-black/25 shadow-2xl shadow-black/40 backdrop-blur-2xl">
            <div className="p-4">
              {/* Disc meta */}
              <div className="flex items-center gap-4">
                <div className="grid h-20 w-20 place-items-center rounded-2xl border border-white/10 bg-white/5 text-3xl">
                  💿
                </div>

                <div className="min-w-0">
                  <p className="text-lg font-semibold text-white">Audio CD</p>
                  <p className="text-sm text-white/60">
                    {/* {cdTracks.length} tracks */}
                  </p>
                </div>
              </div>

              <CdControls
                onPlayAll={() => startPlayback(1, false)}
                onShuffle={() => startPlayback(undefined, true)}
              />

              <div className="mt-4 h-px w-full bg-white/10" />

              {/* Track list */}
              <div className="mt-3 overflow-hidden rounded-xl border border-white/10 bg-white/5">
                {/* {cdTracks.map((t, idx) => (
                  <CdTrackRow
                    key={t.no}
                    track={t}
                    showDivider={idx !== cdTracks.length - 1}
                    onPlay={(trackNo) => startPlayback(trackNo, false)}
                  />
                ))} */}
              </div>
            </div>
          </section>
        </main>

        {/* Independent sidebar */}
        <SidebarDrawer
          open={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      </div>
    </div>
  );
}
