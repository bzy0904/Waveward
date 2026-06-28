import { useState } from "react";
import { Plus } from "lucide-react";
import { getFootnoteForJourney, getPetById, verdictLabels } from "@/data/demoContent";
import type { GrowthRecord, JourneyEntry, UserProfile } from "@/types/session";

type JourneyBookProps = {
  profile: UserProfile;
  entries: JourneyEntry[];
  onAddFollowUp?: (journeyId: string, content: string) => Promise<JourneyEntry | null>;
};

function TrajectoryList({ records }: { records: GrowthRecord[] }) {
  if (!records.length) return null;

  return (
    <div className="mt-3 rounded-[22px] bg-[#f4faff] p-4">
      <p className="text-xs font-medium tracking-[0.08em] text-[#7ca5c2]">成长轨迹</p>
      <ul className="mt-2 space-y-1.5">
        {records.map((record, index) => (
          <li key={`${record.date}-${index}`} className="text-sm leading-6 text-[#4f80a4]">
            <span className="text-[#8eb1c8]">{record.date}</span> {record.content}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function JourneyBook({ profile, entries, onAddFollowUp }: JourneyBookProps) {
  const [followUpText, setFollowUpText] = useState<Record<string, string>>({});
  const [submittingFollowUp, setSubmittingFollowUp] = useState<string | null>(null);
  if (!entries.length) {
    return (
      <section className="rounded-[32px] border border-dashed border-[#d2e9f6] bg-white/60 p-6 text-sm leading-7 text-[#7ca5c2]">
        你的成长记录还没翻开。完成第一次尝试后，这里会出现你和宠物一起写下的第一页。
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <section className="waveward-panel rounded-[36px] p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm tracking-[0.08em] text-[#7ca5c2]">📖 {profile.nickname} 的人生之书</p>
            <h2 className="font-waveward-display text-4xl font-medium tracking-[0.04em] text-[#2a6598]">
              每一次涉浪，都在替你写下一页
            </h2>
          </div>
          <div className="waveward-badge rounded-full px-4 py-2 text-sm tracking-[0.08em]">
            已记录 {entries.length} 次涉浪
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[24px] bg-white/80 p-4 ring-1 ring-[#deeff8]">
            <p className="text-xs tracking-[0.08em] text-[#7ca5c2]">已有能力</p>
            <div className="mt-2 flex flex-wrap gap-2">
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
                <span className="text-sm text-[#9ab9cf]">还没记录</span>
              )}
            </div>
          </div>
          <div className="rounded-[24px] bg-white/80 p-4 ring-1 ring-[#deeff8]">
            <p className="text-xs tracking-[0.08em] text-[#7ca5c2]">高光时刻</p>
            <div className="mt-2 space-y-1 text-sm leading-6 text-[#4f80a4]">
              {profile.highlights.length ? (
                profile.highlights.map((highlight) => <p key={highlight}>{highlight}</p>)
              ) : (
                <p className="text-[#9ab9cf]">还没记录</p>
              )}
            </div>
          </div>
        </div>

        {profile.growthTrajectory.length ? (
          <TrajectoryList records={profile.growthTrajectory} />
        ) : null}

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <div className="rounded-[20px] bg-[linear-gradient(180deg,rgba(241,249,255,0.96),rgba(220,239,250,0.96))] px-4 py-3">
            <p className="text-xs tracking-[0.08em] text-[#7ca5c2]">涉浪次数</p>
            <p className="mt-1 font-waveward-display text-2xl font-medium text-[#2a6598]">
              {profile.shelangCount}
            </p>
          </div>
          <div className="rounded-[20px] bg-[linear-gradient(180deg,rgba(241,249,255,0.96),rgba(220,239,250,0.96))] px-4 py-3">
            <p className="text-xs tracking-[0.08em] text-[#7ca5c2]">最小尝试完成率</p>
            <p className="mt-1 font-waveward-display text-2xl font-medium text-[#2a6598]">
              {profile.completionRate}%
            </p>
          </div>
          <div className="rounded-[20px] bg-[linear-gradient(180deg,rgba(241,249,255,0.96),rgba(220,239,250,0.96))] px-4 py-3">
            <p className="text-xs tracking-[0.08em] text-[#7ca5c2]">注册时间</p>
            <p className="mt-1 font-waveward-display text-2xl font-medium text-[#2a6598]">
              {profile.registeredAt}
            </p>
          </div>
        </div>

        <p className="mt-4 rounded-[20px] bg-white/70 px-4 py-3 text-sm italic leading-7 text-[#3d6e94] ring-1 ring-[#deeff8]">
          {profile.portraitLine}
        </p>
      </section>

      <div className="space-y-4">
        {entries.map((entry, index) => {
          const pet = getPetById(entry.petId);

          return (
            <article key={entry.id} className="waveward-panel rounded-[30px] p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm tracking-[0.08em] text-[#8eb1c8]">
                    第 {entries.length - index} 页 · {entry.date}
                  </p>
                  <h3 className="mt-1 font-waveward-display text-3xl font-medium tracking-[0.04em] text-[#2a6598]">
                    {entry.topic}
                  </h3>
                </div>
                <div className="rounded-full bg-[#eef7fd] px-4 py-2 text-sm text-[#5f8fb2] ring-1 ring-[#d9eef8]">
                  {pet.emoji} 陪伴者：{pet.name}
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-[24px] bg-white/80 p-4 text-sm leading-7 text-[#4f80a4] ring-1 ring-[#deeff8]">
                  <p>劝退指数：{entry.discourageScore}%</p>
                  <p>建议结果：{verdictLabels[entry.verdict]}</p>
                  <p>最小尝试：{entry.actionSuggestion}</p>
                  <p>完成了吗？{entry.completed ? "✓ 已完成" : "⏳ 进行中"}</p>
                  {entry.reflection ? <p>事后备注：{entry.reflection}</p> : null}
                </div>

                <div className="rounded-[24px] bg-[linear-gradient(180deg,rgba(240,248,254,0.96),rgba(225,241,250,0.96))] p-4 text-sm leading-7 text-[#4f80a4]">
                  <p className="font-medium text-[#2a6598]">{entry.stageTitle}</p>
                  <p className="mt-2">{entry.growthLine}</p>
                </div>
              </div>

              <div className="mt-4 rounded-[24px] bg-[#f4faff] p-4">
                <p className="text-xs font-medium tracking-[0.08em] text-[#7ca5c2]">
                  后续轨迹 · 试试那个建议，记录你做到了什么
                </p>
                  {entry.followUps.length ? (
                    <ul className="mt-2 space-y-1.5">
                      {entry.followUps.map((followUp, followIndex) => (
                        <li
                          key={`${followUp.date}-${followIndex}`}
                          className="text-sm leading-6 text-[#4f80a4]"
                        >
                          <span className="text-[#8eb1c8]">{followUp.date}</span> {followUp.content} ✓
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {onAddFollowUp ? (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <input
                        type="text"
                        value={followUpText[entry.id] ?? ""}
                        onChange={(event) =>
                          setFollowUpText((current) => ({
                            ...current,
                            [entry.id]: event.target.value,
                          }))
                        }
                        placeholder="比如：今天真的去问了那个朋友，比想象中顺利。"
                        disabled={submittingFollowUp === entry.id}
                        className="min-w-0 flex-1 rounded-full bg-white/80 px-4 py-2 text-sm text-[#245f92] outline-none ring-1 ring-[#deeff8] placeholder:text-[#a5c4d8] disabled:cursor-not-allowed"
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            const text = followUpText[entry.id]?.trim();
                            if (!text || submittingFollowUp === entry.id) return;
                            setSubmittingFollowUp(entry.id);
                            onAddFollowUp(entry.id, text)
                              .catch(() => {})
                              .finally(() => {
                                setSubmittingFollowUp(null);
                                setFollowUpText((current) => ({ ...current, [entry.id]: "" }));
                              });
                          }
                        }}
                      />
                      <button
                        type="button"
                        disabled={
                          !followUpText[entry.id]?.trim() || submittingFollowUp === entry.id
                        }
                        onClick={() => {
                          const text = followUpText[entry.id]?.trim();
                          if (!text || submittingFollowUp === entry.id) return;
                          setSubmittingFollowUp(entry.id);
                          onAddFollowUp(entry.id, text)
                            .catch(() => {})
                            .finally(() => {
                              setSubmittingFollowUp(null);
                              setFollowUpText((current) => ({ ...current, [entry.id]: "" }));
                            });
                        }}
                        className="waveward-secondary-button inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium text-[#5f8fb2] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        {submittingFollowUp === entry.id ? "记录中..." : "记录"}
                      </button>
                    </div>
                  ) : null}
                </div>

              {entry.processAnalysis ? (
                <div className="mt-4 rounded-[24px] bg-[linear-gradient(180deg,rgba(241,249,255,0.96),rgba(228,243,252,0.96))] p-4 text-sm leading-7 text-[#4f80a4] ring-1 ring-[#d6ebf7]">
                  <p className="font-medium text-[#2a6598]">试水过程分析</p>
                  <p className="mt-2 text-[#3d6e94]">{entry.processAnalysis.trajectory}</p>
                  {entry.processAnalysis.patterns.length ? (
                    <ul className="mt-2 space-y-1">
                      {entry.processAnalysis.patterns.map((pattern, patternIndex) => (
                        <li key={patternIndex} className="text-[#5d8bae]">
                          · {pattern}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <p className="mt-2 rounded-[16px] bg-white/70 px-3 py-2 text-[#3d6e94]">
                    {pet.emoji} {entry.processAnalysis.growthMessage}
                  </p>
                </div>
              ) : null}

              {entry.report.summary.length ? (
                <div className="mt-4 rounded-[24px] bg-white/80 p-4 text-sm leading-7 text-[#4f80a4] ring-1 ring-[#deeff8]">
                  <p className="font-medium text-[#2a6598]">这一页的结论</p>
                  {entry.report.summary.slice(0, 2).map((line) => (
                    <p key={line} className="mt-2">
                      {line}
                    </p>
                  ))}
                </div>
              ) : null}

              <p className="mt-4 text-sm italic leading-7 text-[#8eb1c8]">
                {getFootnoteForJourney(entry)}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
