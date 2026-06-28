import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { AnswerRecord } from "@/types/session";
import { dimensionLabels } from "@/utils/questionEngine";

type AnswerHistoryProps = {
  answers: AnswerRecord[];
};

const COLLAPSED_LIMIT = 2;

export function AnswerHistory({ answers }: AnswerHistoryProps) {
  const [expanded, setExpanded] = useState(false);

  if (!answers.length) {
    return (
      <aside className="rounded-[28px] border border-dashed border-[#d2e9f6] bg-white/60 p-5 text-sm leading-7 text-[#7ca5c2]">
        你刚刚说过的话会留在这里，像被写进这一小段对话过程里。
      </aside>
    );
  }

  const canCollapse = answers.length > COLLAPSED_LIMIT;
  const visibleAnswers = expanded || !canCollapse ? answers : answers.slice(-COLLAPSED_LIMIT);

  return (
    <aside className="waveward-panel-soft rounded-[28px] p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-waveward-display text-2xl font-medium tracking-[0.04em] text-[#2a6598]">刚刚你留下的话</h3>
        {canCollapse ? (
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="inline-flex items-center gap-1 rounded-full bg-white/70 px-3 py-1.5 text-xs tracking-[0.08em] text-[#5f8fb2] ring-1 ring-[#deeff8] transition-colors hover:text-[#2a6598]"
          >
            {expanded ? (
              <>
                <ChevronUp className="h-3.5 w-3.5" />
                收起
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5" />
                共 {answers.length} 条
              </>
            )}
          </button>
        ) : null}
      </div>
      <div className="mt-4 space-y-3">
        {visibleAnswers.map((answer, index) => {
          const isLatest = index === visibleAnswers.length - 1;
          return (
            <div
              key={`${answer.questionId}-${index}`}
              className="rounded-[22px] bg-white/75 p-4 ring-1 ring-[#deeff8]"
            >
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-[#7ca5c2]">
                {answer.title || dimensionLabels[answer.dimension]}
              </p>
              {answer.comparisonTarget ? (
                <p className="mt-1 text-xs text-[#8eb1c8]">对比对象：{answer.comparisonTarget}</p>
              ) : null}
              <p className="mt-2 text-sm leading-7 text-[#4f80a4]">{answer.value}</p>
              {!expanded && !isLatest && canCollapse ? (
                <p className="mt-2 text-xs tracking-[0.08em] text-[#9ab9cf]">…</p>
              ) : null}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
