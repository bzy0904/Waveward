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
    <section className="waveward-panel rounded-[32px] p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#eef7fd] text-[#2b6aa2] ring-1 ring-[#d9eef8]">
            <MessageCircleHeart className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm tracking-[0.08em] text-[#7ca5c2]">
              {petName} · {petTrait}
            </p>
            <h2 className="font-waveward-display text-3xl font-medium tracking-[0.04em] text-[#2a6598]">
              第 {step + 1} / {TOTAL_QUESTIONS} 轮
            </h2>
          </div>
        </div>
        <div className="waveward-badge rounded-full px-4 py-2 text-sm tracking-[0.08em]">
          话题：{topic}
        </div>
      </div>

      <div className="mt-5 rounded-[22px] border border-[#deeff8] bg-white/60 px-4 py-3 text-sm leading-7 text-[#5d8bae]">
        {contextLine}
      </div>

      <div className="mt-6 flex items-center gap-3">
        <span className="rounded-full bg-[linear-gradient(180deg,rgba(132,197,236,0.96),rgba(84,155,209,0.96))] px-3 py-1 text-xs font-medium uppercase tracking-[0.28em] text-white">
          {question.title || dimensionLabels[question.dimension]}
        </span>
        {question.comparisonTarget ? (
          <span className="rounded-full bg-[#eef7fd] px-3 py-1 text-xs font-medium text-[#5f8fb2]">
            对比：{question.comparisonTarget}
          </span>
        ) : null}
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#deeff8]">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,#84c5ec,#549bd1)] transition-all duration-300"
            style={{ width: `${((step + 1) / TOTAL_QUESTIONS) * 100}%` }}
          />
        </div>
      </div>

      <div className="mt-6 whitespace-pre-line rounded-[28px] border border-[#deeff8] bg-white/75 px-5 py-5 text-lg leading-8 text-[#336e9f]">
        {question.prompt}
      </div>
    </section>
  );
}
