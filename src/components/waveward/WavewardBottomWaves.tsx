export function WavewardBottomWaves() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 overflow-hidden opacity-90">
      <div className="absolute bottom-12 left-[-10%] h-24 w-[68%] rounded-[100%] border-t-2 border-[#aad7f1]/75" />
      <div className="absolute bottom-9 right-[-8%] h-20 w-[64%] rounded-[100%] border-t-2 border-[#93c8ea]/70" />
      <div className="absolute bottom-3 left-[2%] h-24 w-[76%] rounded-[100%] border-t-2 border-[#c0e1f5]/80" />
      <div className="absolute bottom-0 right-[6%] h-28 w-[72%] rounded-[100%] border-t-2 border-[#9ecfed]/75" />
      <div className="absolute bottom-[-20px] inset-x-0 h-24 bg-[linear-gradient(180deg,rgba(214,238,250,0),rgba(202,231,247,0.58))]" />
    </div>
  );
}
