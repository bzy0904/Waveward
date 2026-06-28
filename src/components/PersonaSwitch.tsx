import { CloudSun, Flame } from "lucide-react";
import { personaMeta } from "@/data/demoContent";
import { cn } from "@/lib/utils";
import type { PersonaType } from "@/types/session";

type PersonaSwitchProps = {
  value: PersonaType;
  onChange: (value: PersonaType) => void;
  compact?: boolean;
};

export function PersonaSwitch({
  value,
  onChange,
  compact = false,
}: PersonaSwitchProps) {
  const options: PersonaType[] = ["sharp", "gentle"];

  return (
    <div
      className={cn(
        "rounded-[28px] border border-[#d7c5a5] bg-white/80 p-2 shadow-[0_16px_40px_rgba(139,90,43,0.12)] backdrop-blur",
        compact ? "w-full" : "w-full max-w-xl",
      )}
    >
      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => {
          const active = option === value;
          const Icon = option === "sharp" ? Flame : CloudSun;

          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={cn(
                "rounded-[22px] border px-4 py-4 text-left transition duration-200",
                active
                  ? "border-[#8B5A2B] bg-[#8B5A2B] text-[#fff8e7] shadow-[0_10px_24px_rgba(139,90,43,0.24)]"
                  : "border-transparent bg-[#fff6eb] text-[#5a4029] hover:border-[#c6a883] hover:bg-white",
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full",
                    active ? "bg-white/15" : "bg-[#f2e1c5]",
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-display text-lg font-extrabold">
                    {personaMeta[option].label}
                  </p>
                  {!compact && (
                    <p className={cn("text-sm", active ? "text-[#f7e8cd]" : "text-[#85684d]")}>
                      {personaMeta[option].intro}
                    </p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
      {!compact && (
        <p className="mt-3 px-2 text-sm text-[#8b7355]">
          当前提示: {personaMeta[value].badge}
        </p>
      )}
    </div>
  );
}
