import { House, Undo2 } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";
import { JourneyBook } from "@/components/JourneyBook";
import { WavewardBottomWaves } from "@/components/waveward/WavewardBottomWaves";
import { WavewardWatercolorBackground } from "@/components/waveward/WavewardWatercolorBackground";
import { useSessionStore } from "@/store/sessionStore";

export default function JourneyPage() {
  const navigate = useNavigate();
  const { profile, journeys, resetSession, addFollowUp } = useSessionStore(
    useShallow((state) => ({
      profile: state.profile,
      journeys: state.journeys,
      resetSession: state.resetSession,
      addFollowUp: state.addFollowUp,
    })),
  );

  if (!profile) return <Navigate to="/home" replace />;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f8fbfe] px-4 py-10 sm:px-6 lg:px-8">
      <WavewardWatercolorBackground />
      <WavewardBottomWaves />

      <div className="relative mx-auto max-w-5xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm tracking-[0.08em] text-[#7ca5c2]">🌊 {profile.nickname} 的岸</p>
            <h1 className="font-waveward-display text-4xl font-medium tracking-[0.04em] text-[#2a6598]">
              我的人生之书
            </h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate("/home")}
              className="waveward-secondary-button inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-medium text-[#5f8fb2]"
            >
              <House className="h-4 w-4" />
              回主页
            </button>
            <button
              type="button"
              onClick={() => {
                resetSession();
                navigate("/home");
              }}
              className="waveward-secondary-button inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-medium text-[#5f8fb2]"
            >
              <Undo2 className="h-4 w-4" />
              清空当前记录
            </button>
          </div>
        </div>

        <JourneyBook profile={profile} entries={journeys} onAddFollowUp={addFollowUp} />
      </div>
    </main>
  );
}
