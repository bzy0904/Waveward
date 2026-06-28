import { Sparkles } from "lucide-react";
import { topicExamples } from "@/data/demoContent";
import { cn } from "@/lib/utils";

type TopicComposerProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  pending?: boolean;
  disabled?: boolean;
};

export function TopicComposer({
  value,
  onChange,
  onSubmit,
  pending = false,
  disabled = false,
}: TopicComposerProps) {
  return (
    <div className="waveward-panel rounded-[32px] p-6">
      <div className="mb-4 flex items-center gap-3 text-[#2b6aa2]">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eef7fd] ring-1 ring-[#d9eef8]">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-waveward-display text-2xl font-medium tracking-[0.04em]">说说你在纠结什么</h2>
          <p className="text-sm leading-7 text-[#7ca5c2]">
            不用把自己说得很完整，先把那个念头丢出来就行。
          </p>
        </div>
      </div>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="比如：我想辞职去考研，但又怕自己坚持不住。"
        disabled={disabled}
        className="waveward-input min-h-36 w-full rounded-[28px] px-5 py-4 text-base outline-none disabled:cursor-not-allowed disabled:bg-[#eef6fb] disabled:text-[#95b6cc]"
      />

      <div className="mt-4 flex flex-wrap gap-2">
        {topicExamples.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => onChange(example)}
            disabled={disabled}
            className={cn(
              "rounded-full border px-4 py-2 text-sm transition",
              value === example
                ? "border-[#84c5ec] bg-[linear-gradient(180deg,rgba(132,197,236,0.96),rgba(84,155,209,0.96))] text-white"
                : "border-[#d8edf8] bg-white/70 text-[#5f8fb2] hover:border-[#8fcdf0] hover:bg-white",
              disabled && "cursor-not-allowed opacity-60 hover:border-[#d8edf8] hover:bg-white/70",
            )}
          >
            {example}
          </button>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <p className="max-w-md text-sm leading-7 text-[#7ca5c2]">
          最后一定会给你一个今天就能做的最小尝试动作，不让你卡在“准备好了再开始”。
        </p>
        <button
          type="button"
          onClick={onSubmit}
          disabled={!value.trim() || disabled || pending}
          className="waveward-button rounded-full px-6 py-3 font-waveward-display text-base font-medium tracking-[0.08em] text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "正在出发..." : "开始新尝试"}
        </button>
      </div>
    </div>
  );
}
