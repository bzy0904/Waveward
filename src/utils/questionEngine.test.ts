import { describe, expect, it } from "vitest";
import { getQuestionAtStep } from "@/utils/questionEngine";

describe("getQuestionAtStep", () => {
  it("首轮问题会带上话题和引导语", () => {
    const question = getQuestionAtStep("学编程", "gentle", "moon-rabbit", 0, []);

    expect(question.dimension).toBe("code-language");
    expect(question.prompt).toContain("Python");
    expect(question.prompt).toContain("衔月");
    expect(question.options.length).toBeGreaterThan(0);
  });

  it("后续问题会根据上一轮趋势补上下文", () => {
    const question = getQuestionAtStep("辞职考研", "sharp", "cloud-tiger", 1, [
      {
        questionId: "exam-motivation-1",
        dimension: "exam-motivation",
        title: "动机对比",
        prompt: "你到底更想要结果，还是更想逃开现在的状态？",
        value: "就是突然很上头，想马上冲",
        trend: "impulsive",
        stance: "alternative",
      },
    ]);

    expect(question.prompt).toContain("踩刹车");
    expect(question.prompt).toContain("破云");
  });
});
