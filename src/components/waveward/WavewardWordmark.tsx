import { Droplets, Waves } from "lucide-react";

type WavewardWordmarkProps = {
  brandCn: string;
  brandEn: string;
};

export function WavewardWordmark({ brandCn, brandEn }: WavewardWordmarkProps) {
  return (
    <div className="waveward-fade-up flex flex-col items-center text-center">
      <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white/55 shadow-[0_18px_40px_rgba(117,171,205,0.18)] ring-1 ring-[#d2e8f5] backdrop-blur-sm">
        <Droplets className="h-7 w-7 text-[#2b6aa2]" strokeWidth={1.7} />
        <div className="absolute -bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1 text-[#6daed4]">
          <Waves className="h-4 w-4" strokeWidth={1.7} />
          <Waves className="h-4 w-4" strokeWidth={1.7} />
        </div>
      </div>

      <h1 className="mt-8 font-waveward-display text-6xl font-semibold tracking-[0.08em] text-[#1d4f86] sm:text-7xl">
        {brandCn}
      </h1>
      <p className="mt-2 font-waveward-serif text-3xl italic tracking-[0.08em] text-[#2b6aa2]/90 sm:text-4xl">
        {brandEn}
      </p>
    </div>
  );
}
