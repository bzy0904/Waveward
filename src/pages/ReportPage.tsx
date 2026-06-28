import { useEffect, useMemo, useState } from "react";
import { BookOpenText, CheckCheck, Compass, Heart, Lightbulb, Sparkles } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";
import { ReportSummary } from "@/components/ReportSummary";
import { WavewardBottomWaves } from "@/components/waveward/WavewardBottomWaves";
import { WavewardWatercolorBackground } from "@/components/waveward/WavewardWatercolorBackground";
import { buildGrowthLine, companionPetMap, getGrowthStageTitle } from "@/data/demoContent";
import { useSessionStore } from "@/store/sessionStore";

export default function ReportPage() {
  const navigate = useNavigate();
  const [reflection, setReflection] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const {
    topic,
    answers,
    profile,
    selectedPetId,
    currentSessionId,
    currentReport,
    journeys,
    syncReport,
    completeJourney,
    resetSession,
  } = useSessionStore(
    useShallow((state) => ({
      topic: state.topic,
      answers: state.answers,
      profile: state.profile,
      selectedPetId: state.selectedPetId,
      currentSessionId: state.currentSessionId,
      currentReport: state.currentReport,
      journeys: state.journeys,
      syncReport: state.syncReport,
      completeJourney: state.completeJourney,
      resetSession: state.resetSession,
    })),
  );

  useEffect(() => {
    if (!topic.trim() || !answers.length || !currentSessionId || currentReport) {
      return;
    }

    let cancelled = false;
    setIsSubmitting(true);
    setErrorMessage("");

    void syncReport().catch((error) => {
      if (!cancelled) {
        setErrorMessage(error instanceof Error ? error.message : "生成报告失败，请稍后再试。");
      }
    }).finally(() => {
      if (!cancelled) {
        setIsSubmitting(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [answers.length, currentReport, currentSessionId, syncReport, topic]);

  const report = currentReport;

  const currentJourney = useMemo(() => {
    if (!currentSessionId) return null;
    return journeys.find((entry) => entry.sessionId === currentSessionId) ?? null;
  }, [currentSessionId, journeys]);

  const completedCount = journeys.filter((entry) => entry.completed).length;
  const pet = companionPetMap[selectedPetId];
  const projectedGrowth = profile
    ? buildGrowthLine(completedCount + (currentJourney?.completed ? 0 : 1), profile, selectedPetId, topic)
    : "";

  useEffect(() => {
    if (currentJourney?.reflection) {
      setReflection(currentJourney.reflection);
    }
  }, [currentJourney?.reflection]);

  if (!topic.trim() || !answers.length) return <Navigate to="/home" replace />;
  if (!profile) return <Navigate to="/home" replace />;
  if (!report || !currentJourney) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[#f8fbfe] px-4 py-10 sm:px-6 lg:px-8">
        <WavewardWatercolorBackground />
        <WavewardBottomWaves />
        <div className="relative mx-auto max-w-4xl rounded-[32px] border border-[#deeff8] bg-white/75 p-6 text-sm leading-7 text-[#5d8bae] shadow-[0_24px_70px_rgba(133,183,214,0.14)]">
          {errorMessage || "正在把这一页装订进你的成长记录..."}
        </div>
      </main>
    );
  }

  const handleCompleteJourney = async () => {
    if (isSubmitting || currentJourney.completed) return;

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await completeJourney(currentJourney.id, reflection);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "记录试水结果失败，请稍后再试。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f8fbfe] px-4 py-10 sm:px-6 lg:px-8">
      <WavewardWatercolorBackground />
      <WavewardBottomWaves />

      <div className="relative mx-auto max-w-5xl space-y-5">
        <section className="waveward-panel rounded-[32px] p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm tracking-[0.08em] text-[#7ca5c2]">
                {pet.emoji} {pet.name} 正在等这次最小尝试落地
              </p>
              <h2 className="font-waveward-display text-4xl font-medium tracking-[0.04em] text-[#2a6598]">
                {currentJourney.completed
                  ? currentJourney.stageTitle
                  : getGrowthStageTitle(completedCount + 1)}
              </h2>
            </div>

            <button
              type="button"
              onClick={() => navigate("/journey")}
              className="waveward-secondary-button inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-medium text-[#5f8fb2]"
            >
              <BookOpenText className="h-4 w-4" />
              查看人生之书
            </button>
          </div>

          <p className="mt-4 text-sm leading-7 text-[#5d8bae]">
            {currentJourney.completed ? currentJourney.growthLine : projectedGrowth}
          </p>
          {errorMessage ? (
            <p className="mt-4 text-sm leading-7 text-[#d06c82]">{errorMessage}</p>
          ) : null}

          <div className="mt-5 rounded-[26px] border border-[#deeff8] bg-white/65 p-4">
            <p className="text-sm tracking-[0.08em] text-[#7ca5c2]">完成最小尝试后，补一句你的事后备注</p>
            <p className="mt-1 text-xs leading-6 text-[#9ab9cf]">
              完成后，你的 OC 档案会自动更新：涉浪次数 +1、成长轨迹新增一条记录、完成率重新计算。
            </p>
            <textarea
              value={reflection}
              onChange={(event) => setReflection(event.target.value)}
              placeholder="比如：有点紧张，但真的试过之后，心里反而安静了一点。"
              disabled={isSubmitting || currentJourney.completed}
              className="mt-3 min-h-24 w-full resize-none bg-transparent text-sm leading-7 text-[#245f92] outline-none placeholder:text-[#a5c4d8] disabled:cursor-not-allowed disabled:text-[#8cb0c7]"
            />
            <button
              type="button"
              onClick={() => {
                void handleCompleteJourney();
              }}
              disabled={currentJourney.completed || isSubmitting}
              className="waveward-button mt-4 inline-flex items-center gap-2 rounded-full px-5 py-3 font-waveward-display text-sm font-medium tracking-[0.08em] text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CheckCheck className="h-4 w-4" />
              {currentJourney.completed
                ? "这次试水已记录"
                : isSubmitting
                  ? "正在记录..."
                  : "我完成这次最小尝试了"}
            </button>
          </div>
        </section>

        {currentJourney.completed && currentJourney.processAnalysis ? (
          <section className="waveward-panel rounded-[32px] p-6">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-[#2b6aa2]" />
              <h3 className="font-waveward-display text-2xl font-medium tracking-[0.04em] text-[#2a6598]">
                试水过程分析
              </h3>
            </div>

            <div className="mt-4 space-y-4 text-sm leading-7 text-[#5d8bae]">
              <div className="rounded-[22px] bg-white/65 p-4 ring-1 ring-[#deeff8]">
                <p className="flex items-center gap-2 text-xs tracking-[0.08em] text-[#7ca5c2]">
                  <Compass className="h-3.5 w-3.5" />
                  决策轨迹
                </p>
                <p className="mt-2 text-[#3d6e94]">
                  {currentJourney.processAnalysis.trajectory}
                </p>
              </div>

              <div className="rounded-[22px] bg-white/65 p-4 ring-1 ring-[#deeff8]">
                <p className="flex items-center gap-2 text-xs tracking-[0.08em] text-[#7ca5c2]">
                  <Lightbulb className="h-3.5 w-3.5" />
                  思维特征
                </p>
                <ul className="mt-2 space-y-1.5">
                  {currentJourney.processAnalysis.patterns.map((pattern, index) => (
                    <li key={index} className="text-[#3d6e94]">
                      · {pattern}
                    </li>
                  ))}
                </ul>
              </div>

              {currentJourney.processAnalysis.highlights.length > 0 ? (
                <div className="rounded-[22px] bg-white/65 p-4 ring-1 ring-[#deeff8]">
                  <p className="flex items-center gap-2 text-xs tracking-[0.08em] text-[#7ca5c2]">
                    <Sparkles className="h-3.5 w-3.5" />
                    关键转折点
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {currentJourney.processAnalysis.highlights.map((highlight, index) => (
                      <li key={index} className="text-[#3d6e94]">
                        · {highlight}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="rounded-[22px] bg-[linear-gradient(180deg,rgba(240,248,254,0.96),rgba(225,241,250,0.96))] p-4 ring-1 ring-[#d6ebf7]">
                <p className="flex items-center gap-2 text-xs tracking-[0.08em] text-[#7ca5c2]">
                  <Heart className="h-3.5 w-3.5" />
                  {pet.emoji} {pet.name} 想对你说
                </p>
                <p className="mt-2 text-[#3d6e94]">
                  {currentJourney.processAnalysis.growthMessage}
                </p>
              </div>
            </div>
          </section>
        ) : null}

        <ReportSummary
          report={report}
          onRestart={() => {
            resetSession();
            navigate("/home");
          }}
        />
      </div>
    </main>
  );
}
