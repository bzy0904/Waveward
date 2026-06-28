import { describe, expect, it } from "vitest";
import { buildReport, evaluateCustomTrend } from "@/utils/reportEngine";

describe("evaluateCustomTrend", () => {
  it("识别理性关键词", () => {
    expect(evaluateCustomTrend("我想先做预算，再安排时间")).toBe("rational");
  });

  it("识别冲动关键词", () => {
    expect(evaluateCustomTrend("我就是想马上冲，其他再说")).toBe("impulsive");
  });
});

describe("buildReport", () => {
  it("高冲动回答会得到较高劝退指数", () => {
    const report = buildReport("买相机", "sharp", [
      {
        questionId: "1",
        dimension: "motivation",
        title: "真实动机",
        prompt: "为什么想买相机？",
        value: "马上冲",
        trend: "impulsive",
        stance: "alternative",
      },
      {
        questionId: "2",
        dimension: "resource",
        title: "硬性条件",
        prompt: "你能投入多少预算和时间？",
        value: "以后再说",
        trend: "impulsive",
        stance: "alternative",
      },
      {
        questionId: "3",
        dimension: "risk",
        title: "风险承受",
        prompt: "你能承担最坏结果吗？",
        value: "没想过",
        trend: "neutral",
        stance: "mixed",
      },
      {
        questionId: "4",
        dimension: "alternative",
        title: "低成本试水",
        prompt: "要不要先试用？",
        value: "不想试水",
        trend: "impulsive",
        stance: "alternative",
      },
      {
        questionId: "5",
        dimension: "fallback",
        title: "退路规划",
        prompt: "有没有止损方案？",
        value: "到时候再看",
        trend: "neutral",
        stance: "mixed",
      },
    ]);

    expect(report.discourageScore).toBeGreaterThanOrEqual(70);
    expect(report.verdict).toBe("wait");
    expect(report.actionSuggestion.length).toBeGreaterThan(12);
  });

  it("理性回答会得到较低劝退指数", () => {
    const report = buildReport("学编程", "gentle", [
      {
        questionId: "1",
        dimension: "code-language",
        title: "语言门槛",
        prompt: "你更能接受哪种起步方式？",
        value: "想了一阵子",
        trend: "rational",
        stance: "topic",
      },
      {
        questionId: "2",
        dimension: "code-feedback",
        title: "反馈节奏",
        prompt: "你能接受慢反馈吗？",
        value: "有学习时间",
        trend: "rational",
        stance: "topic",
      },
      {
        questionId: "3",
        dimension: "code-resource",
        title: "资源投入",
        prompt: "你能投入多少资源？",
        value: "能接受试错",
        trend: "neutral",
        stance: "mixed",
      },
      {
        questionId: "4",
        dimension: "code-direction",
        title: "方向选择",
        prompt: "要不要先试免费课？",
        value: "先试免费课",
        trend: "rational",
        stance: "topic",
      },
      {
        questionId: "5",
        dimension: "code-threshold",
        title: "上手门槛",
        prompt: "你能接受多长适应期？",
        value: "三个月复盘",
        trend: "rational",
        stance: "topic",
      },
    ]);

    expect(report.discourageScore).toBeLessThan(40);
    expect(report.verdict).toBe("go");
  });
});
