import { RotateCcw, Sparkles, Sprout } from "lucide-react";
import { personaMeta, verdictLabels } from "@/data/demoContent";
import { cn } from "@/lib/utils";
import type { ReportResult } from "@/types/session";

type ReportSummaryProps = {
  report: ReportResult;
  onRestart: () => void;
};

const verdictStyles = {
  go: "bg-[#e6f6ea] text-[#4f9a74]",
  "try-first": "bg-[#eef7fd] text-[#5f8fb2]",
  wait: "bg-[#fdeff0] text-[#b7747c]",
} as const;

export function ReportSummary({ report, onRestart }: ReportSummaryProps) {
  return (
    <section className="waveward-panel rounded-[36px] p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm tracking-[0.08em] text-[#7ca5c2]">你的结果页</p>
          <h2 className="font-waveward-display text-4xl font-medium tracking-[0.04em] text-[#2a6598]">
            {report.topic}
          </h2>
          <p className="mt-2 text-sm leading-7 text-[#7ca5c2]">
            场景：{report.scenarioLabel} · 对话风格：{personaMeta[report.persona].label}
          </p>
        </div>
        <button
          type="button"
          onClick={onRestart}
          className="waveward-secondary-button inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-medium text-[#5f8fb2]"
        >
          <RotateCcw className="h-4 w-4" />
          开始下一次尝试
        </button>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[30px] bg-[linear-gradient(180deg,rgba(242,249,255,0.96),rgba(227,242,250,0.96))] p-5">
          <div className="flex items-end gap-3">
            <span className="font-waveward-display text-7xl font-medium text-[#2a6598]">
              {report.discourageScore}
            </span>
            <span className="pb-2 text-lg text-[#7ca5c2]">%</span>
          </div>
          <div className="mt-4 h-4 overflow-hidden rounded-full bg-[#dceef8]">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#84c5ec,#549bd1)] transition-all duration-700"
              style={{ width: `${report.discourageScore}%` }}
            />
          </div>
          <div
            className={cn(
              "mt-4 inline-flex rounded-full px-4 py-2 text-sm font-medium",
              verdictStyles[report.verdict],
            )}
          >
            {verdictLabels[report.verdict]}
          </div>
        </div>

        <div className="rounded-[30px] border border-[#deeff8] bg-white/75 p-5">
          <div className="flex items-center gap-2 text-[#2b6aa2]">
            <Sparkles className="h-4 w-4" />
            <h3 className="font-waveward-display text-2xl font-medium tracking-[0.04em]">具体分析</h3>
          </div>
          <div className="mt-4 space-y-3 text-sm leading-7 text-[#4f80a4]">
            {report.summary.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {report.dimensionInsights.map((item) => (
          <div key={`${item.dimension}-${item.title}`} className="rounded-[24px] border border-[#deeff8] bg-white/75 p-4">
            <p className="text-sm font-medium text-[#2a6598]">{item.title}</p>
            <p className="mt-2 text-sm leading-7 text-[#4f80a4]">{item.summary}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-[30px] border border-[#d7ebf7] bg-[linear-gradient(180deg,rgba(241,249,255,0.96),rgba(226,242,251,0.96))] p-5">
        <div className="flex items-center gap-2 text-[#2b6aa2]">
          <Sprout className="h-5 w-5" />
          <h3 className="font-waveward-display text-2xl font-medium tracking-[0.04em]">你的最小尝试建议</h3>
        </div>
        <p className="mt-3 text-base leading-8 text-[#336e9f]">{report.actionSuggestion}</p>
        <p className="mt-4 text-sm tracking-[0.08em] text-[#7ca5c2]">不用等山海平，先踏一步浪。</p>
      </div>
    </section>
  );
}
