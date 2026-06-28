import { SendHorizonal } from "lucide-react";
import type { AnswerOption, PersonaType } from "@/types/session";

type AnswerPanelProps = {
  persona: PersonaType;
  options: AnswerOption[];
  customValue: string;
  disabled?: boolean;
  onCustomChange: (value: string) => void;
  onQuickReply: (option: AnswerOption) => void;
  onSubmitCustom: () => void;
};

export function AnswerPanel({
  persona,
  options,
  customValue,
  disabled = false,
  onCustomChange,
  onQuickReply,
  onSubmitCustom,
}: AnswerPanelProps) {
  return (
    <section className="waveward-panel rounded-[32px] p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="font-waveward-display text-2xl font-medium tracking-[0.04em] text-[#2a6598]">
            你可以直接点，也可以自己补充
          </h3>
          <p className="text-sm leading-7 text-[#7ca5c2]">
            {persona === "sharp"
              ? "别写套话，越具体越像真的。"
              : "不用写得很完整，真实一点就很好。"}
          </p>
        </div>
      </div>

      <div className="grid gap-3">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onQuickReply(option)}
            disabled={disabled}
            className="rounded-[24px] border border-[#d8edf8] bg-white/75 px-5 py-4 text-left text-[#4f80a4] transition hover:-translate-y-0.5 hover:border-[#8fcdf0] hover:bg-white hover:shadow-[0_12px_24px_rgba(116,176,216,0.12)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:border-[#d8edf8] disabled:hover:bg-white/75 disabled:hover:shadow-none"
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="mt-5 rounded-[28px] border border-dashed border-[#d2e9f6] bg-white/60 p-4">
        <textarea
          value={customValue}
          onChange={(event) => onCustomChange(event.target.value)}
          placeholder="比如：我有一点预算，也能挤出时间，但我担心自己只是一阵热度。"
          disabled={disabled}
          className="min-h-28 w-full resize-none bg-transparent text-base text-[#245f92] outline-none placeholder:text-[#a5c4d8] disabled:cursor-not-allowed disabled:text-[#8cb0c7]"
        />
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onSubmitCustom}
            disabled={!customValue.trim() || disabled}
            className="waveward-button inline-flex items-center gap-2 rounded-full px-5 py-3 font-waveward-display text-sm font-medium tracking-[0.08em] text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <SendHorizonal className="h-4 w-4" />
            提交这一轮回答
          </button>
        </div>
      </div>
    </section>
  );
}
