import {
  ArrowRight,
  BookOpenText,
  ChevronDown,
  ChevronUp,
  HeartHandshake,
  LogOut,
  Sparkles,
  Stars,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";
import { CompanionSelector } from "@/components/CompanionSelector";
import { ProfileSetupCard } from "@/components/ProfileSetupCard";
import { TopicComposer } from "@/components/TopicComposer";
import { WavewardBottomWaves } from "@/components/waveward/WavewardBottomWaves";
import { WavewardWatercolorBackground } from "@/components/waveward/WavewardWatercolorBackground";
import { companionPetMap } from "@/data/demoContent";
import { useSessionStore } from "@/store/sessionStore";
import type { PetId } from "@/types/session";

export default function Home() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState("");
  const [existingSkills, setExistingSkills] = useState("");
  const [highlightMoment, setHighlightMoment] = useState("");
  const [potentialDirection, setPotentialDirection] = useState("");
  const [busyAction, setBusyAction] = useState<"" | "pet" | "profile" | "session">("");
  const [errorMessage, setErrorMessage] = useState("");
  const [profileCollapsed, setProfileCollapsed] = useState(true);

  const {
    loginName,
    topic,
    setTopic,
    startSession,
    selectedPetId,
    selectPet,
    profile,
    createProfile,
    journeys,
    logout,
  } = useSessionStore(
    useShallow((state) => ({
      loginName: state.loginName,
      topic: state.topic,
      setTopic: state.setTopic,
      startSession: state.startSession,
      selectedPetId: state.selectedPetId,
      selectPet: state.selectPet,
      profile: state.profile,
      createProfile: state.createProfile,
      journeys: state.journeys,
      logout: state.logout,
    })),
  );

  const pet = companionPetMap[selectedPetId];
  const latestJourney = journeys[0] ?? null;

  useEffect(() => {
    if (profile) {
      setNickname(profile.nickname);
      setExistingSkills(profile.existingSkills);
      setHighlightMoment(profile.highlightMoment);
      setPotentialDirection(profile.potentialDirection);
      return;
    }

    setNickname((current) => current || loginName);
  }, [loginName, profile]);

  const handleStart = async () => {
    if (!topic.trim() || !profile || busyAction) return;

    setBusyAction("session");
    setErrorMessage("");

    try {
      await startSession(topic);
      navigate("/session");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "开始话题失败，请稍后再试。");
    } finally {
      setBusyAction("");
    }
  };

  const handleGenerateProfile = async () => {
    if (busyAction) return;

    setBusyAction("profile");
    setErrorMessage("");

    try {
      await createProfile(nickname, existingSkills, highlightMoment, potentialDirection);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "生成档案失败，请稍后再试。");
    } finally {
      setBusyAction("");
    }
  };

  const handlePetChange = async (petId: PetId) => {
    if (busyAction) return;

    setBusyAction("pet");
    setErrorMessage("");

    try {
      await selectPet(petId);

      if (profile) {
        await createProfile(
          profile.nickname,
          profile.existingSkills,
          profile.highlightMoment,
          profile.potentialDirection,
          petId,
        );
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "切换陪伴者失败，请稍后再试。");
    } finally {
      setBusyAction("");
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f8fbfe] px-4 py-10 text-[#1f4f84] sm:px-6 lg:px-8">
      <WavewardWatercolorBackground />
      <WavewardBottomWaves />

      <div className="relative mx-auto grid max-w-7xl gap-6 px-1 sm:gap-8 sm:px-0 lg:grid-cols-[0.8fr_1.2fr]">
        <section className="waveward-panel min-w-0 flex flex-col gap-6 rounded-[32px] p-5 sm:rounded-[40px] sm:p-7">
          <div>
            <div className="waveward-badge inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium tracking-[0.18em]">
              <Stars className="h-4 w-4" />
              WAVEWARD HOME
            </div>

            <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-4">
              <div className="min-w-0 flex-1">
                <h1 className="font-waveward-display text-4xl font-medium leading-[1.1] tracking-[0.06em] text-[#1d4f86] sm:text-6xl">
                  欢迎回来
                </h1>
                <p className="mt-3 text-base tracking-[0.08em] text-[#6e9dbe]">
                  {loginName}，今天想先把哪一片潮声说给伙伴听？
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
                className="waveward-secondary-button inline-flex min-h-[44px] items-center justify-center gap-2 self-stretch rounded-full px-4 py-3 text-sm font-medium text-[#5f8fb2] sm:self-auto"
              >
                <LogOut className="h-4 w-4" />
                退出登录
              </button>
            </div>
            {errorMessage ? (
              <p className="mt-4 text-sm leading-7 text-[#d06c82]">{errorMessage}</p>
            ) : null}

            <div className="waveward-panel-soft mt-6 rounded-[28px] p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eef7fd] text-[#2b6aa2] ring-1 ring-[#d9eef8]">
                  <HeartHandshake className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-waveward-display text-2xl font-medium tracking-[0.04em] text-[#2a6598]">
                    你不是在定义自己
                  </p>
                  <p className="text-sm leading-7 text-[#7aa4c2]">
                    你是在一次次尝试里，看见自己是怎么长出来的。
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="waveward-panel-soft rounded-[28px] p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[linear-gradient(180deg,rgba(241,249,255,0.96),rgba(220,239,250,0.96))] text-xl ring-1 ring-[#d6ebf7]">
                  {pet.emoji}
                </div>
                <div>
                  <p className="font-waveward-display text-2xl font-medium tracking-[0.04em] text-[#2a6598]">
                    当前陪伴者 · {pet.name}
                  </p>
                  <p className="text-sm tracking-[0.08em] text-[#7ca5c2]">{pet.title}</p>
                </div>
              </div>
              <p className="mt-3 text-sm leading-7 text-[#5d8bae]">{pet.hint}</p>
            </div>

            {profile ? (
              <div className="waveward-panel-soft rounded-[28px] p-5">
                <button
                  type="button"
                  onClick={() => setProfileCollapsed((value) => !value)}
                  className="flex w-full items-center justify-between gap-3 text-left"
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-5 w-5 text-[#2b6aa2]" />
                    <p className="font-waveward-display text-2xl font-medium tracking-[0.04em] text-[#2a6598]">
                      {profile.nickname} 的 OC 档案
                    </p>
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
                    {profile.skills.length > 3 ? "…" : ""} · 涉浪 {profile.shelangCount} 次 · 完成率 {profile.completionRate}%
                  </p>
                ) : (
                  <div className="mt-4 grid gap-3 text-sm leading-7 text-[#5d8bae]">
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
                      <span className="font-medium text-[#2a6598]">高光时刻：</span>
                      {profile.highlights[0] || "还没记录"}
                    </p>
                    <p>
                      <span className="font-medium text-[#2a6598]">潜在方向：</span>
                      {profile.potentialDirection || "还没记录"}
                    </p>
                    <div className="grid gap-2 sm:grid-cols-3">
                      <div className="rounded-[18px] bg-white/70 px-3 py-2 ring-1 ring-[#deeff8]">
                        <p className="text-xs tracking-[0.08em] text-[#7ca5c2]">涉浪次数</p>
                        <p className="mt-1 text-sm text-[#4f80a4]">{profile.shelangCount} 次</p>
                      </div>
                      <div className="rounded-[18px] bg-white/70 px-3 py-2 ring-1 ring-[#deeff8]">
                        <p className="text-xs tracking-[0.08em] text-[#7ca5c2]">完成率</p>
                        <p className="mt-1 text-sm text-[#4f80a4]">{profile.completionRate}%</p>
                      </div>
                      <div className="rounded-[18px] bg-white/70 px-3 py-2 ring-1 ring-[#deeff8]">
                        <p className="text-xs tracking-[0.08em] text-[#7ca5c2]">最近一次</p>
                        <p className="mt-1 text-sm text-[#4f80a4]">
                          {latestJourney ? latestJourney.topic : "还没有写下第一页"}
                        </p>
                      </div>
                    </div>
                    <p className="rounded-[18px] bg-[linear-gradient(180deg,rgba(240,248,254,0.96),rgba(225,241,250,0.96))] px-4 py-3 text-sm leading-7 text-[#3d6e94]">
                      {profile.portraitLine}
                    </p>
                  </div>
                )}

                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      void handleStart();
                    }}
                    disabled={!topic.trim() || busyAction !== ""}
                    className="waveward-button inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full px-5 py-3 font-waveward-display text-sm font-medium tracking-[0.08em] text-white disabled:cursor-not-allowed disabled:opacity-50 sm:flex-1"
                  >
                    {busyAction === "session" ? "正在出发..." : "开始新话题"}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/journey")}
                    className="waveward-secondary-button inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium text-[#5f8fb2] sm:flex-1"
                  >
                    <BookOpenText className="h-4 w-4" />
                    查看人生之书
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-[28px] border border-dashed border-[#d6ebf7] bg-white/60 p-5 text-sm leading-7 text-[#6692b2]">
                选一位陪你涉浪的伙伴，写下你正在纠结的事，就可以出发了。
              </div>
            )}
          </div>
        </section>

        <section className="min-w-0 space-y-5">
          <CompanionSelector value={selectedPetId} onChange={handlePetChange} />

          {!profile && (
            <ProfileSetupCard
              nickname={nickname}
              existingSkills={existingSkills}
              highlightMoment={highlightMoment}
              potentialDirection={potentialDirection}
              disabled={busyAction !== ""}
              onNicknameChange={setNickname}
              onExistingSkillsChange={setExistingSkills}
              onHighlightMomentChange={setHighlightMoment}
              onPotentialDirectionChange={setPotentialDirection}
              onGenerate={handleGenerateProfile}
              generatedProfile={null}
            />
          )}

          <TopicComposer
            value={topic}
            onChange={setTopic}
            onSubmit={handleStart}
            pending={busyAction === "session"}
            disabled={!profile || busyAction === "pet" || busyAction === "profile"}
          />
        </section>
      </div>
    </main>
  );
}
