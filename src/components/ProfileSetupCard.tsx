import { ArrowRight, BookUser, Stars } from "lucide-react";
import type { UserProfile } from "@/types/session";

type ProfileSetupCardProps = {
  nickname: string;
  existingSkills: string;
  highlightMoment: string;
  potentialDirection: string;
  disabled?: boolean;
  onNicknameChange: (value: string) => void;
  onExistingSkillsChange: (value: string) => void;
  onHighlightMomentChange: (value: string) => void;
  onPotentialDirectionChange: (value: string) => void;
  onGenerate: () => void;
  generatedProfile: UserProfile | null;
};

export function ProfileSetupCard({
  nickname,
  existingSkills,
  highlightMoment,
  potentialDirection,
  disabled = false,
  onNicknameChange,
  onExistingSkillsChange,
  onHighlightMomentChange,
  onPotentialDirectionChange,
  onGenerate,
  generatedProfile,
}: ProfileSetupCardProps) {
  return (
    <section className="waveward-panel space-y-5 rounded-[32px] p-6">
      <div className="flex items-center gap-3 text-[#2b6aa2]">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eef7fd] ring-1 ring-[#d9eef8]">
          <Stars className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-waveward-display text-2xl font-medium tracking-[0.04em]">在出发之前，让我认识一下你</h2>
          <p className="text-sm leading-7 text-[#7ca5c2]">
            回答三个有用的问题，你的 OC 档案会自己长出来——不是一句文艺描述，而是一份真实的人生履历。
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        <label className="space-y-2">
          <span className="text-sm font-medium tracking-[0.08em] text-[#5f8fb2]">你叫什么名字？</span>
          <input
            value={nickname}
            onChange={(event) => onNicknameChange(event.target.value)}
            placeholder="昵称即可"
            disabled={disabled}
            className="waveward-input w-full rounded-[22px] px-4 py-3 text-base outline-none disabled:cursor-not-allowed disabled:bg-[#eef6fb] disabled:text-[#95b6cc]"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium tracking-[0.08em] text-[#5f8fb2]">
            你觉得自己最擅长的一件事是什么？
          </span>
          <textarea
            value={existingSkills}
            onChange={(event) => onExistingSkillsChange(event.target.value)}
            placeholder="比如：我会游泳，会唱歌"
            disabled={disabled}
            className="waveward-input min-h-24 w-full rounded-[22px] px-4 py-3 text-base outline-none disabled:cursor-not-allowed disabled:bg-[#eef6fb] disabled:text-[#95b6cc]"
          />
          <p className="text-xs leading-6 text-[#9ab9cf]">记录你已有的能力，用顿号分隔多项。</p>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium tracking-[0.08em] text-[#5f8fb2]">
            你最近一次感到骄傲的事是什么？
          </span>
          <textarea
            value={highlightMoment}
            onChange={(event) => onHighlightMomentChange(event.target.value)}
            placeholder="比如：我完成了第一个半马"
            disabled={disabled}
            className="waveward-input min-h-24 w-full rounded-[22px] px-4 py-3 text-base outline-none disabled:cursor-not-allowed disabled:bg-[#eef6fb] disabled:text-[#95b6cc]"
          />
          <p className="text-xs leading-6 text-[#9ab9cf]">记录你的高光时刻。</p>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium tracking-[0.08em] text-[#5f8fb2]">
            如果三年后的你回头看现在，你最希望自己已经开始做什么？
          </span>
          <textarea
            value={potentialDirection}
            onChange={(event) => onPotentialDirectionChange(event.target.value)}
            placeholder="比如：我希望我已经开始学跳舞了"
            disabled={disabled}
            className="waveward-input min-h-24 w-full rounded-[22px] px-4 py-3 text-base outline-none disabled:cursor-not-allowed disabled:bg-[#eef6fb] disabled:text-[#95b6cc]"
          />
          <p className="text-xs leading-6 text-[#9ab9cf]">记录你的潜在方向。</p>
        </label>
      </div>

      <div className="flex items-center justify-between gap-4">
        <p className="max-w-md text-sm leading-7 text-[#7ca5c2]">
          这份档案跟你的账号绑定，每完成一次涉浪都会自动更新。时间越久，它越珍贵。
        </p>
        <button
          type="button"
          onClick={onGenerate}
          disabled={
            !nickname.trim() ||
            !existingSkills.trim() ||
            !highlightMoment.trim() ||
            !potentialDirection.trim() ||
            disabled
          }
          className="waveward-button inline-flex items-center gap-2 rounded-full px-5 py-3 font-waveward-display text-sm font-medium tracking-[0.08em] text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          生成我的 OC 档案
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {generatedProfile && (
        <div className="waveward-panel-soft rounded-[28px] p-5">
          <div className="flex items-center gap-2 text-[#2b6aa2]">
            <BookUser className="h-5 w-5" />
            <p className="text-sm tracking-[0.08em] text-[#7ca5c2]">【用户OC档案】</p>
          </div>
          <h3 className="mt-2 font-waveward-display text-3xl font-medium tracking-[0.04em] text-[#2a6598]">
            {generatedProfile.nickname}
          </h3>

          <div className="mt-4 space-y-3 text-sm leading-7 text-[#5d8bae]">
            <div className="flex flex-wrap items-start gap-2">
              <span className="shrink-0 font-medium text-[#2a6598]">已有能力：</span>
              <div className="flex flex-wrap gap-2">
                {generatedProfile.skills.length ? (
                  generatedProfile.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-[#eef7fd] px-3 py-1 text-sm text-[#5f8fb2] ring-1 ring-[#d9eef8]"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-[#9ab9cf]">还没记录</span>
                )}
              </div>
            </div>

            <div>
              <span className="font-medium text-[#2a6598]">高光时刻：</span>
              {generatedProfile.highlights.length ? (
                generatedProfile.highlights.map((highlight) => (
                  <p key={highlight} className="mt-1">{highlight}</p>
                ))
              ) : (
                <span className="text-[#9ab9cf]">还没记录</span>
              )}
            </div>

            <div>
              <span className="font-medium text-[#2a6598]">潜在方向：</span>
              <span>{generatedProfile.potentialDirection || "还没记录"}</span>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              <div className="rounded-[18px] bg-white/70 px-3 py-2 ring-1 ring-[#deeff8]">
                <p className="text-xs tracking-[0.08em] text-[#7ca5c2]">注册时间</p>
                <p className="mt-1 text-sm text-[#4f80a4]">{generatedProfile.registeredAt}</p>
              </div>
              <div className="rounded-[18px] bg-white/70 px-3 py-2 ring-1 ring-[#deeff8]">
                <p className="text-xs tracking-[0.08em] text-[#7ca5c2]">涉浪次数</p>
                <p className="mt-1 text-sm text-[#4f80a4]">{generatedProfile.shelangCount} 次</p>
              </div>
              <div className="rounded-[18px] bg-white/70 px-3 py-2 ring-1 ring-[#deeff8]">
                <p className="text-xs tracking-[0.08em] text-[#7ca5c2]">完成率</p>
                <p className="mt-1 text-sm text-[#4f80a4]">{generatedProfile.completionRate}%</p>
              </div>
            </div>

            <div className="rounded-[18px] bg-[linear-gradient(180deg,rgba(240,248,254,0.96),rgba(225,241,250,0.96))] px-4 py-3">
              <p className="text-xs tracking-[0.08em] text-[#7ca5c2]">一句话肖像</p>
              <p className="mt-1 text-sm leading-7 text-[#3d6e94]">{generatedProfile.portraitLine}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
