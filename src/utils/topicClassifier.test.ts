import { describe, expect, it } from "vitest";
import { classifyTopic } from "@/utils/topicClassifier";

describe("classifyTopic", () => {
  it("识别养宠话题", () => {
    expect(classifyTopic("我想养一只猫")).toBe("pet");
  });

  it("识别学习话题", () => {
    expect(classifyTopic("我想学编程转行")).toBe("learning");
  });

  it("识别兜底通用话题", () => {
    expect(classifyTopic("我想换一种生活方式")).toBe("general");
  });
});
