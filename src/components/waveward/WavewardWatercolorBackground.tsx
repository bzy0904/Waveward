export function WavewardWatercolorBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#f7fbfe_0%,#fbfdff_46%,#f5fbff_100%)]" />
      <div className="waveward-cloud absolute -left-12 top-0 h-72 w-72 rounded-[44%] bg-[#c7e7f8]/60 blur-2xl" />
      <div className="waveward-cloud absolute right-[-6%] top-[-4%] h-80 w-[28rem] rounded-[48%] bg-[#d7eef9]/55 blur-2xl" />
      <div className="waveward-cloud absolute bottom-[18%] right-[-14%] h-80 w-[30rem] rounded-[44%] bg-[#d2ebf8]/50 blur-2xl" />
      <div className="waveward-paper-grain absolute inset-0 opacity-50" />
      <div className="absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.72),transparent_72%)]" />
      <div className="absolute bottom-0 left-0 h-80 w-full bg-[radial-gradient(circle_at_bottom,rgba(215,238,249,0.72),transparent_62%)]" />
    </div>
  );
}
