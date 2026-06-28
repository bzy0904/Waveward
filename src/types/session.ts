export type PersonaType = "sharp" | "gentle";

export type ScoreTrend = "impulsive" | "neutral" | "rational";

export type AnswerStance = "topic" | "alternative" | "mixed";

export type PetId =
  | "moon-rabbit"
  | "cloud-tiger"
  | "ink-mouse"
  | "book-ox"
  | "wind-horse"
  | "deep-dragon"
  | "mist-snake"
  | "snow-sheep"
  | "light-monkey"
  | "dawn-rooster"
  | "shore-dog"
  | "content-pig";

export type TopicCategory =
  | "pet"
  | "learning"
  | "career"
  | "purchase"
  | "hobby"
  | "relationship"
  | "general";

export type QuestionDimension =
  | "pet-personality"
  | "pet-energy"
  | "pet-voice"
  | "pet-health"
  | "pet-maintenance"
  | "code-language"
  | "code-feedback"
  | "code-resource"
  | "code-direction"
  | "code-threshold"
  | "exam-motivation"
  | "exam-cost"
  | "exam-risk"
  | "exam-alternative"
  | "exam-fallback"
  | "motivation"
  | "resource"
  | "risk"
  | "alternative"
  | "fallback"
  | "timing"
  | "sustainability"
  | "tradeoff"
  | "ecosystem"
  | "self-awareness";

export type AnswerOption = {
  id: string;
  label: string;
  trend: ScoreTrend;
  stance?: AnswerStance;
};

export type QuestionItem = {
  id: string;
  dimension: QuestionDimension;
  title: string;
  prompt: string;
  options: AnswerOption[];
  comparisonTarget?: string;
  scenarioLabel?: string;
};

export type AnswerRecord = {
  questionId: string;
  dimension: QuestionDimension;
  title: string;
  prompt: string;
  comparisonTarget?: string;
  value: string;
  trend: ScoreTrend;
  stance: AnswerStance;
};

export type CompanionPet = {
  id: PetId;
  emoji: string;
  name: string;
  title: string;
  trait: string;
  style: string;
  basePersona: PersonaType;
  intro: string;
  hint: string;
  statusLines: {
    hesitation: string[];
    decisive: string[];
    uncertain: string[];
    preReport: string;
  };
  interactions: string[];
  bookTone: string;
};

export type GrowthRecord = {
  date: string;
  content: string;
  topic: string;
};

export type UserProfile = {
  nickname: string;
  existingSkills: string;
  highlightMoment: string;
  potentialDirection: string;
  registeredAt: string;
  skills: string[];
  highlights: string[];
  growthTrajectory: GrowthRecord[];
  shelangCount: number;
  completedCount: number;
  completionRate: number;
  portraitLine: string;
};

export type ReportResult = {
  topic: string;
  persona: PersonaType;
  scenarioLabel: string;
  discourageScore: number;
  verdict: "go" | "try-first" | "wait";
  summary: string[];
  dimensionInsights: {
    dimension: QuestionDimension;
    title: string;
    stance: AnswerStance;
    summary: string;
  }[];
  actionSuggestion: string;
};

export type ProcessAnalysis = {
  trajectory: string;
  patterns: string[];
  highlights: string[];
  growthMessage: string;
};

export type JourneyEntry = {
  id: string;
  sessionId: number;
  date: string;
  topic: string;
  petId: PetId;
  nickname: string;
  discourageScore: number;
  verdict: ReportResult["verdict"];
  actionSuggestion: string;
  completed: boolean;
  reflection: string;
  stageTitle: string;
  growthLine: string;
  answers: AnswerRecord[];
  report: ReportResult;
  profileSnapshot: UserProfile;
  followUps: GrowthRecord[];
  processAnalysis: ProcessAnalysis | null;
};
