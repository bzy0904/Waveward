import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronUp, HandHeart, House, Undo2 } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";
import { AnswerHistory } from "@/components/AnswerHistory";
import { AnswerPanel } from "@/components/AnswerPanel";
import { QuestionCard } from "@/components/QuestionCard";
import { WavewardBottomWaves } from "@/components/waveward/WavewardBottomWaves";
import { WavewardWatercolorBackground } from "@/components/waveward/WavewardWatercolorBackground";
import { companionPetMap, getPetMemoryLine, getPetStatusLine } from "@/data/demoContent";
import { useSessionStore } from "@/store/sessionStore";
import type { AnswerOption, QuestionItem } from "@/types/session";
import { TOTAL_QUESTIONS, decorateQuestion, fetchAiQuestion, getQuestionAtStep } from "@/utils/questionEngine";
import { evaluateCustomStance, evaluateCustomTrend } from "@/utils/reportEngine";

export default function SessionPage() {
  const navigate = useNavigate();
  const [customAnswer, setCustomAnswer] = useState("");
  const [interactionIndex, setInteractionIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [aiQuestion, setAiQuestion] = useState<QuestionItem | null>(null);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [profileCollapsed, setProfileCollapsed] = useState(true);
  // 预取的下一题（提交答案时后端一并返回），用于跳过 useEffect 中的重复请求
  const prefetchedQuestionRef = useRef<QuestionItem | null>(null);

  const { topic, persona, selectedPetId, profile, journeys, currentStep, currentSessionId, answers, submitAnswer, resetSession } =
    useSessionStore(
      useShallow((state) => ({
        topic: state.topic,
        persona: state.persona,
        selectedPetId: state.selectedPetId,
        profile: state.profile,
        journeys: state.journeys,
        currentStep: state.currentStep,
        currentSessionId: state.currentSessionId,
        answers: state.answers,
        submitAnswer: state.submitAnswer,
        resetSession: state.resetSession,
      })),
    );

  const pet = companionPetMap[selectedPetId];
  const latestTrend = answers[answers.length - 1]?.trend ?? null;
  const statusLine = getPetStatusLine(selectedPetId, latestTrend);
  const interactionLine = pet.interactions[interactionIndex % pet.interactions.length];
  const memoryLine = profile ? getPetMemoryLine(selectedPetId, profile, journeys) : "";

  // 本地兜底问题（同步）
  const fallbackQuestion = useMemo(() => {
    if (!topic.trim()) return null;
    if (currentStep >= TOTAL_QUESTIONS) return null;
    return getQuestionAtStep(topic, persona, selectedPetId, currentStep, answers);
  }, [answers, currentStep, persona, selectedPetId, topic]);

  // 异步获取 AI 智能问题
  useEffect(() => {
    if (!topic.trim() || !currentSessionId || currentStep >= TOTAL_QUESTIONS) {
      setAiQuestion(null);
      return;
    }

    // 若提交答案时已预取到下一题，直接使用，避免重复请求
    if (prefetchedQuestionRef.current) {
      setAiQuestion(prefetchedQuestionRef.current);
      setErrorMessage("");
      setIsLoadingQuestion(false);
      prefetchedQuestionRef.current = null;
      return;
    }

    let cancelled = false;
    setIsLoadingQuestion(true);

    fetchAiQuestion(currentSessionId, topic, persona, selectedPetId, currentStep, answers)
      .then((question) => {
        if (!cancelled) {
          setAiQuestion(question);
          setErrorMessage("");
        }
      })
      .catch(() => {
        if (!cancelled) setAiQuestion(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingQuestion(false);
      });

    return () => {
      cancelled = true;
    };
  }, [answers, currentStep, currentSessionId, persona, selectedPetId, topic]);

  // AI 问题加载中时不显示兜底问题，避免问题文本跳变
  const question = aiQuestion ?? (isLoadingQuestion ? null : fallbackQuestion);

  if (!topic.trim() || !profile) return <Navigate to="/home" replace />;
  if (!question && !isLoadingQuestion && currentStep >= TOTAL_QUESTIONS) return <Navigate to="/report" replace />;

  const handleSubmit = async (value: string, trend: AnswerOption["trend"]) => {
    if (isSubmitting || !question) return;

    const isLastStep = currentStep === TOTAL_QUESTIONS - 1;
    const selectedOption = question.options.find((option) => option.label === value);
    const stance = selectedOption?.stance ?? evaluateCustomStance(value);

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const nextQuestion = await submitAnswer(
        question.id,
        question.dimension,
        question.title,
        question.prompt,
        question.comparisonTarget,
        value,
        trend,
        stance,
      );
      setCustomAnswer("");

      if (isLastStep) {
        navigate("/report");
        return;
      }

      // 使用后端预取的下一题，立即装饰并展示，跳过 useEffect 的重复请求
      if (nextQuestion) {
        const latestAnswers = useSessionStore.getState().answers;
        const decorated = decorateQuestion(nextQuestion, persona, selectedPetId, latestAnswers);
        prefetchedQuestionRef.current = decorated;
        setAiQuestion(decorated);
        setIsLoadingQuestion(false);
      } else {
        setAiQuestion(null);
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "提交回答失败，请稍后再试。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f8fbfe] px-4 py-8 sm:px-6 lg:px-8">
      <WavewardWatercolorBackground />
      <WavewardBottomWaves />

      <div className="relative mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm tracking-[0.08em] text-[#7ca5c2]">🌊 {profile.nickname} 的陪伴空间</p>
            <h1 className="font-waveward-display text-4xl font-medium tracking-[0.04em] text-[#2a6598]">
              {topic}
            </h1>
            <p className="mt-2 text-sm leading-7 text-[#5f8fb2]">
              {pet.emoji} {pet.name} 正陪你把这件事慢慢看清楚。
            </p>
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
              重新发起
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5">
            <div className="rounded-[26px] border border-[#deeff8] bg-white/60 px-5 py-4 text-sm leading-7 text-[#5d8bae]">
              {statusLine}
            </div>
            {errorMessage ? (
              <div className="rounded-[20px] border border-[#f2c9d3] bg-[#fff4f7] px-5 py-3 text-sm leading-7 text-[#d06c82]">
                {errorMessage}
              </div>
            ) : null}
            {isLoadingQuestion && !question ? (
              <div className="waveward-panel rounded-[32px] p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#eef7fd] text-[#2b6aa2] ring-1 ring-[#d9eef8]">
                    <span className="animate-pulse text-xl">{pet.emoji}</span>
                  </div>
                  <div>
                    <p className="text-sm tracking-[0.08em] text-[#7ca5c2]">
                      {pet.name} 正在为你组织第 {currentStep + 1} 个问题…
                    </p>
                    <p className="font-waveward-display text-2xl font-medium tracking-[0.04em] text-[#2a6598]">
                      AI 正在思考
                    </p>
                  </div>
                </div>
                <div className="mt-5 space-y-3">
                  <div className="h-4 animate-pulse rounded-full bg-[#deeff8]" />
                  <div className="h-4 w-4/5 animate-pulse rounded-full bg-[#deeff8]" />
                  <div className="h-4 w-3/5 animate-pulse rounded-full bg-[#deeff8]" />
                </div>
              </div>
            ) : question ? (
              <>
                <QuestionCard
                  question={question}
                  step={currentStep}
                  topic={topic}
                  petName={pet.name}
                  petTrait={pet.trait}
                  contextLine={statusLine}
                />
                <AnswerPanel
                  persona={persona}
                  options={question.options}
                  customValue={customAnswer}
                  disabled={isSubmitting}
                  onCustomChange={setCustomAnswer}
                  onQuickReply={(option) => {
                    void handleSubmit(option.label, option.trend);
                  }}
                  onSubmitCustom={() => {
                    void handleSubmit(customAnswer.trim(), evaluateCustomTrend(customAnswer));
                  }}
                />
              </>
            ) : null}
          </div>

          <div className="space-y-5">
            <div className="waveward-panel-soft rounded-[28px] p-5">
              <button
                type="button"
                onClick={() => setProfileCollapsed((value) => !value)}
                className="flex w-full items-center justify-between gap-3 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[linear-gradient(180deg,rgba(241,249,255,0.96),rgba(220,239,250,0.96))] text-2xl ring-1 ring-[#d6ebf7]">
                    {pet.emoji}
                  </div>
                  <div>
                    <p className="text-sm tracking-[0.08em] text-[#7ca5c2]">
                      {profile.nickname} × {pet.name}
                    </p>
                    <p className="font-waveward-display text-3xl font-medium tracking-[0.04em] text-[#2a6598]">
                      OC 档案
                    </p>
                  </div>
                </div>
                {profileCollapsed ? (
                  <ChevronDown className="h-5 w-5 shrink-0 text-[#7ca5c2]" />
                ) : (
                  <ChevronUp className="h-5 w-5 shrink-0 text-[#7ca5c2]" />
                )}
              </button>
              {profileCollapsed ? (
                <p className="mt-3 text-sm leading-7 text-[#7ca5c2]">
                  {profile.skills.length ? profile.skills.slice(0, 3).join("·") : "还没记录能力"}
                  {profile.skills.length > 3 ? "…" : ""} · 涉浪 {profile.shelangCount} 次
                </p>
              ) : (
                <div className="mt-4 space-y-3 text-sm leading-7 text-[#5d8bae]">
                  <div className="flex flex-wrap items-start gap-2">
                    <span className="shrink-0 font-medium text-[#2a6598]">已有能力：</span>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.length ? (
                        profile.skills.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full bg-[#eef7fd] px-3 py-1 text-xs text-[#5f8fb2] ring-1 ring-[#d9eef8]"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-[#9ab9cf]">还没记录</span>
                      )}
                    </div>
                  </div>
                  <p>
                    <span className="font-medium text-[#2a6598]">潜在方向：</span>
                    {profile.potentialDirection || "还没记录"}
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="rounded-[18px] bg-white/70 px-3 py-2 ring-1 ring-[#deeff8]">
                      <p className="text-xs tracking-[0.08em] text-[#7ca5c2]">涉浪次数</p>
                      <p className="mt-1 text-sm text-[#4f80a4]">{profile.shelangCount} 次</p>
                    </div>
                    <div className="rounded-[18px] bg-white/70 px-3 py-2 ring-1 ring-[#deeff8]">
                      <p className="text-xs tracking-[0.08em] text-[#7ca5c2]">完成率</p>
                      <p className="mt-1 text-sm text-[#4f80a4]">{profile.completionRate}%</p>
                    </div>
                  </div>
                  <p className="rounded-[18px] bg-[linear-gradient(180deg,rgba(240,248,254,0.96),rgba(225,241,250,0.96))] px-4 py-3 text-sm leading-7 text-[#3d6e94]">
                    {profile.portraitLine}
                  </p>
                </div>
              )}
            </div>

            <div className="waveward-panel-soft rounded-[28px] p-5">
              <p className="text-sm tracking-[0.08em] text-[#7ca5c2]">{pet.name} 记得你</p>
              <p className="mt-2 text-sm leading-7 text-[#5d8bae]">{memoryLine}</p>
              <p className="mt-4 text-sm leading-7 text-[#5d8bae]">{interactionLine}</p>
              <button
                type="button"
                onClick={() => setInteractionIndex((value) => value + 1)}
                className="waveward-secondary-button mt-4 inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-medium text-[#5f8fb2]"
              >
                <HandHeart className="h-4 w-4" />
                摸摸 {pet.name}
              </button>
            </div>

            <AnswerHistory answers={answers} />
          </div>
        </div>
      </div>
    </main>
  );
}
