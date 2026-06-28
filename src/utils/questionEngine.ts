import { companionPetMap, getToneLine } from "@/data/demoContent";
import {
  TOTAL_QUESTIONS,
  genericDimensionOrder,
  genericDimensionLabels,
  getQuestionAtScenarioStep,
} from "@/data/verticalScenarios";
import { wavewardApi } from "@/services/wavewardApi";
import type { AnswerRecord, PersonaType, PetId, QuestionItem } from "@/types/session";

function buildContextLine(persona: PersonaType, answers: AnswerRecord[], title: string) {
  const lastAnswer = answers[answers.length - 1];

  if (!lastAnswer) {
    return persona === "sharp"
      ? "先别急着说服自己，我先拿具体对比把这件事摊开。"
      : "别担心，我们不聊空话，只聊你真正要面对的日常。";
  }

  const toneLine = getToneLine(persona, lastAnswer.trend);
  return `${toneLine} 这一轮我们看「${title}」。`;
}

function buildPetLead(petId: PetId, prompt: string) {
  const petName = companionPetMap[petId].name;

  const leadMap: Record<PetId, string> = {
    "moon-rabbit": `${petName}把声音放轻了一点：`,
    "cloud-tiger": `${petName}抬了抬下巴，问得很直接：`,
    "ink-mouse": `${petName}用笔尖敲了敲桌面：`,
    "book-ox": `${petName}把问题摊平在你面前：`,
    "wind-horse": `${petName}把风往前推了一点：`,
    "deep-dragon": `${petName}像在雾里慢慢问你：`,
    "mist-snake": `${petName}绕着问题转了一圈，开口：`,
    "snow-sheep": `${petName}把声音捂得暖暖的：`,
    "light-monkey": `${petName}把光往问题上一抛：`,
    "dawn-rooster": `${petName}干脆利落地问：`,
    "shore-dog": `${petName}安静地陪你看着问题：`,
    "content-pig": `${petName}慢悠悠地开口：`,
  };

  return `${leadMap[petId]}\n\n${prompt}`;
}

export function decorateQuestion(
  question: QuestionItem,
  persona: PersonaType,
  petId: PetId,
  answers: AnswerRecord[],
): QuestionItem {
  const context = buildContextLine(persona, answers, question.title);
  return {
    ...question,
    prompt: `${context}\n\n${buildPetLead(petId, question.prompt)}`,
  };
}

export function getQuestionAtStep(
  topic: string,
  persona: PersonaType,
  petId: PetId,
  step: number,
  answers: AnswerRecord[],
): QuestionItem {
  const question = getQuestionAtScenarioStep(topic, step, answers);
  return decorateQuestion(question, persona, petId, answers);
}

// 异步获取 AI 智能生成的问题，失败时回退到本地规则引擎
export async function fetchAiQuestion(
  sessionId: number,
  topic: string,
  persona: PersonaType,
  petId: PetId,
  step: number,
  answers: AnswerRecord[],
): Promise<QuestionItem | null> {
  try {
    const { question } = await wavewardApi.fetchAiQuestion(sessionId);
    if (!question) return null;
    return decorateQuestion(question, persona, petId, answers);
  } catch {
    // 回退到本地规则引擎
    if (step >= TOTAL_QUESTIONS) return null;
    return getQuestionAtStep(topic, persona, petId, step, answers);
  }
}

export function getQuestionDimensions() {
  return genericDimensionOrder;
}

export { TOTAL_QUESTIONS, genericDimensionLabels as dimensionLabels };
