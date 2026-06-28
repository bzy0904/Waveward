import { categoryKeywords } from "@/data/demoContent";
import type { TopicCategory } from "@/types/session";

export function classifyTopic(topic: string): TopicCategory {
  const normalized = topic.trim().toLowerCase();

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (category === "general") continue;
    if (keywords.some((keyword) => normalized.includes(keyword))) {
      return category as TopicCategory;
    }
  }

  return "general";
}
