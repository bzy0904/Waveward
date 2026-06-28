import { useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { companionPets } from "@/data/demoContent";
import { cn } from "@/lib/utils";
import type { PetId } from "@/types/session";

type CompanionSelectorProps = {
  value: PetId;
  onChange: (value: PetId) => void;
};

export function CompanionSelector({ value, onChange }: CompanionSelectorProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const activeIndex = Math.max(
    0,
    companionPets.findIndex((pet) => pet.id === value),
  );
  const activePet = companionPets[activeIndex];

  const scrollToActive = (index: number) => {
    const rail = railRef.current;
    if (!rail) return;
    const child = rail.children[index] as HTMLElement | undefined;
    if (child) {
      rail.scrollTo({
        left: child.offsetLeft - (rail.clientWidth - child.clientWidth) / 2,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    scrollToActive(activeIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

  const stepTo = (dir: -1 | 1) => {
    const next = (activeIndex + dir + companionPets.length) % companionPets.length;
    onChange(companionPets[next].id);
  };

  return (
    <section className="waveward-panel rounded-[32px] p-6">
      <div className="flex items-center gap-3 text-[#2b6aa2]">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eef7fd] ring-1 ring-[#d9eef8]">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-waveward-display text-2xl font-medium tracking-[0.04em]">选一位陪你涉浪的伙伴</h2>
          <p className="text-sm leading-7 text-[#7ca5c2]">
            你不是在选人格，你是在选今天想要的对话温度。
          </p>
        </div>
      </div>

      {/* 主展示卡片 */}
      <div className="relative mt-5 overflow-hidden rounded-[28px] border border-[#8cc8ea] bg-[linear-gradient(180deg,rgba(132,197,236,0.96),rgba(84,155,209,0.96))] text-white shadow-[0_16px_32px_rgba(116,176,216,0.26)]">
        <div className="flex items-start gap-4 px-6 py-6">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/18 text-4xl">
            {activePet.emoji}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-waveward-display text-3xl font-medium tracking-[0.04em]">{activePet.name}</p>
              <span className="rounded-full bg-white/18 px-2 py-1 text-xs text-[#eef8ff]">{activePet.trait}</span>
              <span className="rounded-full bg-white/12 px-2 py-1 text-xs text-[#dceffd]">{activePet.style}</span>
            </div>
            <p className="mt-1 text-xs tracking-[0.12em] text-[#dceffd]">{activePet.title}</p>
            <p className="mt-3 text-sm leading-7 text-[#edf7ff]">{activePet.intro}</p>
            <p className="mt-3 text-xs leading-6 text-[#dceffd]">{activePet.hint}</p>
          </div>
        </div>

        {/* 左右切换箭头 */}
        <button
          type="button"
          aria-label="上一位"
          onClick={() => stepTo(-1)}
          className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition hover:bg-white/35"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label="下一位"
          onClick={() => stepTo(1)}
          className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition hover:bg-white/35"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* 可滑动的头像轨道 */}
      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          aria-label="上一个"
          onClick={() => stepTo(-1)}
          className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#d9edf8] bg-white/70 text-[#4f80a4] transition hover:border-[#8fcdf0] hover:bg-white/90 sm:flex"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div
          ref={railRef}
          className="flex flex-1 gap-3 overflow-x-auto px-1 py-2 [scrollbar-width:none] snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
        >
          {companionPets.map((pet) => {
            const active = pet.id === value;
            return (
              <button
                key={pet.id}
                type="button"
                onClick={() => onChange(pet.id)}
                aria-pressed={active}
                className={cn(
                  "snap-center shrink-0 rounded-[20px] border px-3 py-2 text-center transition duration-200",
                  active
                    ? "border-[#8cc8ea] bg-[linear-gradient(180deg,rgba(132,197,236,0.18),rgba(84,155,209,0.18))] text-[#2a6598] shadow-[0_8px_18px_rgba(116,176,216,0.18)]"
                    : "border-[#d9edf8] bg-white/70 text-[#4f80a4] hover:-translate-y-0.5 hover:border-[#8fcdf0] hover:bg-white/90",
                )}
              >
                <div
                  className={cn(
                    "mx-auto flex h-12 w-12 items-center justify-center rounded-full text-2xl transition",
                    active ? "bg-white/60" : "bg-[linear-gradient(180deg,rgba(241,249,255,0.94),rgba(219,239,250,0.94))]",
                  )}
                >
                  {pet.emoji}
                </div>
                <p className="mt-1.5 text-sm font-medium tracking-[0.04em]">{pet.name}</p>
                <p className="text-[10px] tracking-[0.12em] text-[#7ca5c2]">{pet.trait}</p>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          aria-label="下一个"
          onClick={() => stepTo(1)}
          className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#d9edf8] bg-white/70 text-[#4f80a4] transition hover:border-[#8fcdf0] hover:bg-white/90 sm:flex"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* 进度指示 */}
      <div className="mt-3 flex items-center justify-center gap-1.5">
        {companionPets.map((pet, idx) => (
          <button
            key={pet.id}
            type="button"
            aria-label={`跳到 ${pet.name}`}
            onClick={() => onChange(pet.id)}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              idx === activeIndex ? "w-5 bg-[#549bd1]" : "w-1.5 bg-[#cfe6f5] hover:bg-[#a9d6ee]",
            )}
          />
        ))}
      </div>
    </section>
  );
}
