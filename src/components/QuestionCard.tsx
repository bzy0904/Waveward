import { MessageCircleHeart } from "lucide-react";
import type { QuestionItem } from "@/types/session";
import { TOTAL_QUESTIONS, dimensionLabels } from "@/utils/questionEngine";

type QuestionCardProps = {
  question: QuestionItem;
  step: number;
  topic: string;
  petName: string;
  petTrait: string;
  contextLine: string;
};

export function QuestionCard({
  question,
  step,
  topic,
  petName,
  petTrait,
  contextLine,
}: QuestionCardProps) {
  return (
    <section className="waveward-panel rounded-[24px] p-4 sm:rounded-[32px] sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#eef7fd] text-[#2b6aa2] ring-1 ring-[#d9eef8]">
            <MessageCircleHeart className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm tracking-[0.08em] text-[#7ca5c2]">
              {petName} · {petTrait}
            </p>
            <h2 className="font-waveward-display text-2xl font-medium tracking-[0.04em] text-[#2a6598] sm:text-3xl">
              第 {step + 1} / {TOTAL_QUESTIONS} 轮
            </h2>
          </div>
        </div>
        <div className="waveward-badge truncate rounded-full px-4 py-2 text-sm tracking-[0.08em]">
          话题：{topic}
        </div>
      </div>

      <div className="mt-5 rounded-[22px] border border-[#deeff8] bg-white/60 px-4 py-3 text-sm leading-7 text-[#5d8bae]">
        {contextLine}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-[linear-gradient(180deg,rgba(132,197,236,0.96),rgba(84,155,209,0.96))] px-3 py-1 text-xs font-medium uppercase tracking-[0.28em] text-white">
          {question.title || dimensionLabels[question.dimension]}
        </span>
        {question.comparisonTarget ? (
          <span className="rounded-full bg-[#eef7fd] px-3 py-1 text-xs font-medium text-[#5f8fb2]">
            对比：{question.comparisonTarget}
          </span>
        ) : null}
        <div className="h-2 w-full min-w-[120px] flex-1 overflow-hidden rounded-full bg-[#deeff8]">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,#84c5ec,#549bd1)] transition-all duration-300"
            style={{ width: `${((step + 1) / TOTAL_QUESTIONS) * 100}%` }}
          />
        </div>
      </div>

      <div className="mt-6 whitespace-pre-line rounded-[24px] border border-[#deeff8] bg-white/75 px-4 py-4 text-base leading-7 text-[#336e9f] sm:px-5 sm:py-5 sm:text-lg sm:leading-8">
        {question.prompt}
      </div>
    </section>
  );
}
