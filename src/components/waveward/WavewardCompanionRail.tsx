import { cn } from "@/lib/utils";
import type { WavewardCompanion } from "@/data/wavewardLanding";
import type { PetId } from "@/types/session";

type WavewardCompanionRailProps = {
  items: WavewardCompanion[];
  value: PetId;
  onChange: (value: PetId) => void;
};

export function WavewardCompanionRail({
  items,
  value,
  onChange,
}: WavewardCompanionRailProps) {
  return (
    <div className="w-full">
      <div className="flex gap-4 overflow-x-auto px-2 pb-3 pt-2 [scrollbar-width:none] sm:justify-center sm:overflow-visible">
        {items.map((item, index) => {
          const active = item.id === value;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              aria-pressed={active}
              className={cn(
                "waveward-fade-up min-w-[88px] text-center transition duration-200 hover:-translate-y-1",
                active ? "scale-[1.04]" : "",
              )}
              style={{ animationDelay: `${index * 90}ms` }}
            >
              <div
                className={cn(
                  "mx-auto flex h-20 w-20 items-center justify-center rounded-full p-[3px] ring-1 backdrop-blur-sm transition duration-200",
                  item.palette.shadow,
                  item.palette.ring,
                  active
                    ? `bg-gradient-to-br ${item.palette.halo} shadow-[0_18px_36px_rgba(124,173,205,0.28)]`
                    : "bg-white/70",
                )}
              >
                <div
                  className={cn(
                    "flex h-full w-full items-center justify-center rounded-full text-[2rem]",
                    item.palette.card,
                  )}
                >
                  <span aria-hidden="true">{item.emoji}</span>
                </div>
              </div>
              <p className="mt-3 font-waveward-display text-2xl font-medium tracking-[0.08em] text-[#2a6598]">
                {item.name}
              </p>
              <p className="mt-1 text-xs tracking-[0.16em] text-[#6f9abb]">{item.trait}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
