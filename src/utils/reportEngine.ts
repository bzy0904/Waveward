import { verdictLabels } from "@/data/demoContent";
import {
  buildInsightLine,
  buildScenarioActionSuggestion,
  buildScenarioSummary,
  inferCustomStance,
  getScenarioLabel,
} from "@/data/verticalScenarios";
import type { AnswerRecord, PersonaType, ReportResult, ScoreTrend } from "@/types/session";

const trendWeights: Record<ScoreTrend, number> = {
  rational: 0,
  neutral: 0.3,
  impulsive: 1,
};

const stanceWeights = {
  topic: 0,
  mixed: 0.3,
  alternative: 1,
} as const;

const rationalKeywords = [
  "预算",
  "计划",
  "安排",
  "了解",
  "试试",
  "先",
  "慢慢",
  "评估",
  "存钱",
  "考虑过",
];

const impulsiveKeywords = [
  "马上",
  "立刻",
  "冲",
  "上头",
  "逃离",
  "随便",
  "先买",
  "再说",
  "受不了",
  "跟风",
];

export function evaluateCustomTrend(input: string): ScoreTrend {
  const value = input.trim();

  if (!value) return "neutral";

  if (impulsiveKeywords.some((keyword) => value.includes(keyword))) {
    return "impulsive";
  }

  if (rationalKeywords.some((keyword) => value.includes(keyword))) {
    return "rational";
  }

  if (value.length >= 22) {
    return "rational";
  }

  return "neutral";
}

export function evaluateCustomStance(input: string) {
  return inferCustomStance(input);
}

export function buildReport(
  topic: string,
  persona: PersonaType,
  answers: AnswerRecord[],
): ReportResult {
  const totalScore = answers.reduce((sum, answer) => {
    const cautionScore = trendWeights[answer.trend];
    const mismatchScore = stanceWeights[answer.stance];
    return sum + cautionScore * 0.55 + mismatchScore * 0.45;
  }, 0);
  const discourageScore = Math.round((totalScore / Math.max(answers.length, 1)) * 100);

  const verdict =
    discourageScore >= 70 ? "wait" : discourageScore >= 40 ? "try-first" : "go";

  return {
    topic,
    persona,
    scenarioLabel: getScenarioLabel(topic),
    discourageScore,
    verdict,
    summary: buildScenarioSummary(topic, answers, discourageScore),
    dimensionInsights: answers.map((answer) => ({
      dimension: answer.dimension,
      title: answer.title,
      stance: answer.stance,
      summary: buildInsightLine(answer),
    })),
    actionSuggestion: buildScenarioActionSuggestion(topic, answers, verdict),
  };
}

export function getVerdictLabel(score: number) {
  if (score >= 70) return verdictLabels.wait;
  if (score >= 40) return verdictLabels["try-first"];
  return verdictLabels.go;
}
