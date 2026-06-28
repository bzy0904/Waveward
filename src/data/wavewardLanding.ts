import { companionPets } from "@/data/demoContent";
import type { PetId } from "@/types/session";

type CompanionPalette = {
  halo: string;
  ring: string;
  card: string;
  shadow: string;
};

export type WavewardCompanion = {
  id: PetId;
  name: string;
  title: string;
  emoji: string;
  trait: string;
  intro: string;
  palette: CompanionPalette;
};

export const wavewardHero = {
  brandCn: "涉浪",
  brandEn: "Waveward",
  slogan: "不等山海平，先踏一步浪",
  caption: "The waning wave invites one brave step before the tide turns calm.",
  ctaLabel: "开始涉浪",
  inputLabel: "写下你的名字",
  inputPlaceholder: "给自己起个昵称，可留空",
  helperLabel: "陪伴提示",
  helperText: "选择一位伙伴后即可直接进入体验，你的选择会同步到后续陪伴流程。",
} as const;

const paletteMap: Record<PetId, CompanionPalette> = {
  "moon-rabbit": {
    halo: "from-[#fff3d8] via-[#f6fbff] to-[#c4e6fa]",
    ring: "ring-[#f0dcb1]/80",
    card: "bg-[linear-gradient(180deg,rgba(255,251,239,0.92),rgba(233,245,253,0.92))]",
    shadow: "shadow-[0_12px_32px_rgba(145,186,214,0.2)]",
  },
  "cloud-tiger": {
    halo: "from-[#d3ecfb] via-[#f5fbff] to-[#b7d9ef]",
    ring: "ring-[#90c9ef]/80",
    card: "bg-[linear-gradient(180deg,rgba(236,248,255,0.94),rgba(214,236,249,0.92))]",
    shadow: "shadow-[0_12px_32px_rgba(121,174,209,0.22)]",
  },
  "ink-mouse": {
    halo: "from-[#e5eef5] via-[#ffffff] to-[#cfe4f6]",
    ring: "ring-[#a9c7df]/80",
    card: "bg-[linear-gradient(180deg,rgba(246,250,253,0.95),rgba(224,239,248,0.92))]",
    shadow: "shadow-[0_12px_32px_rgba(135,169,198,0.2)]",
  },
  "book-ox": {
    halo: "from-[#f4e9d7] via-[#f9fdff] to-[#d8ecf7]",
    ring: "ring-[#e6d6b5]/80",
    card: "bg-[linear-gradient(180deg,rgba(252,248,239,0.95),rgba(233,245,251,0.92))]",
    shadow: "shadow-[0_12px_32px_rgba(166,186,197,0.2)]",
  },
  "wind-horse": {
    halo: "from-[#d6f1ff] via-[#f7fdff] to-[#bfe0f7]",
    ring: "ring-[#8ccff0]/80",
    card: "bg-[linear-gradient(180deg,rgba(239,250,255,0.95),rgba(214,239,250,0.92))]",
    shadow: "shadow-[0_12px_32px_rgba(117,183,220,0.22)]",
  },
  "deep-dragon": {
    halo: "from-[#dfe9ff] via-[#f7fbff] to-[#c8dff8]",
    ring: "ring-[#a8bfec]/80",
    card: "bg-[linear-gradient(180deg,rgba(243,247,255,0.95),rgba(220,233,252,0.92))]",
    shadow: "shadow-[0_12px_32px_rgba(126,154,208,0.22)]",
  },
  "mist-snake": {
    halo: "from-[#e6e1f5] via-[#f8fbff] to-[#d4dcef]",
    ring: "ring-[#b3a8d8]/80",
    card: "bg-[linear-gradient(180deg,rgba(247,244,252,0.95),rgba(228,223,242,0.92))]",
    shadow: "shadow-[0_12px_32px_rgba(150,135,190,0.2)]",
  },
  "snow-sheep": {
    halo: "from-[#f5f0e6] via-[#fbfbff] to-[#e8e0d4]",
    ring: "ring-[#d8c9a8]/80",
    card: "bg-[linear-gradient(180deg,rgba(252,249,242,0.95),rgba(238,230,218,0.92))]",
    shadow: "shadow-[0_12px_32px_rgba(178,165,135,0.2)]",
  },
  "light-monkey": {
    halo: "from-[#fff3d8] via-[#fffaf0] to-[#f5e0b0]",
    ring: "ring-[#e8c878]/80",
    card: "bg-[linear-gradient(180deg,rgba(255,250,235,0.95),rgba(245,228,180,0.92))]",
    shadow: "shadow-[0_12px_32px_rgba(195,165,90,0.22)]",
  },
  "dawn-rooster": {
    halo: "from-[#ffe2d4] via-[#fff5f0] to-[#f5c8b0]",
    ring: "ring-[#e8a888]/80",
    card: "bg-[linear-gradient(180deg,rgba(255,243,235,0.95),rgba(245,214,196,0.92))]",
    shadow: "shadow-[0_12px_32px_rgba(200,135,100,0.22)]",
  },
  "shore-dog": {
    halo: "from-[#f0e6d8] via-[#fbf8f3] to-[#e0d4c0]",
    ring: "ring-[#c8b095]/80",
    card: "bg-[linear-gradient(180deg,rgba(250,245,238,0.95),rgba(232,220,205,0.92))]",
    shadow: "shadow-[0_12px_32px_rgba(160,140,115,0.2)]",
  },
  "content-pig": {
    halo: "from-[#fde2ea] via-[#fff5f8] to-[#f5c8d4]",
    ring: "ring-[#e8a8b8]/80",
    card: "bg-[linear-gradient(180deg,rgba(255,243,247,0.95),rgba(245,214,224,0.92))]",
    shadow: "shadow-[0_12px_32px_rgba(200,135,155,0.2)]",
  },
};

export const wavewardCompanions: WavewardCompanion[] = companionPets.map((pet) => ({
  id: pet.id,
  name: pet.name,
  title: pet.title,
  emoji: pet.emoji,
  trait: pet.trait,
  intro: pet.hint,
  palette: paletteMap[pet.id],
}));
