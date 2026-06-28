// AI 智能问题生成模块
// 默认接入 DeepSeek（OpenAI 兼容），无 key 时回退到智能本地生成
// 优先读 DEEPSEEK_API_KEY，其次兼容 OPENAI_API_KEY

const AI_API_KEY = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY || "";
const AI_BASE_URL =
  process.env.DEEPSEEK_BASE_URL ||
  process.env.OPENAI_BASE_URL ||
  "https://api.deepseek.com/v1";
const AI_MODEL = process.env.DEEPSEEK_MODEL || process.env.OPENAI_MODEL || "deepseek-chat";

// 10 个问题维度，从浅到深覆盖决策全链路
const QUESTION_DIMENSIONS = [
  { key: "motivation", label: "真实动机", desc: "区分内在渴望与外界推动" },
  { key: "resource", label: "硬性条件", desc: "时间、金钱、精力是否到位" },
  { key: "risk", label: "风险承受", desc: "最坏情况能否扛住" },
  { key: "alternative", label: "低成本试水", desc: "能否先做 1/10 成本的尝试" },
  { key: "fallback", label: "退路规划", desc: "失败后如何止损" },
  { key: "timing", label: "时机判断", desc: "现在是不是做这件事的最好时机" },
  { key: "sustainability", label: "长期可持续", desc: "三个月后热情是否还在" },
  { key: "tradeoff", label: "机会成本", desc: "做这件事意味着放弃什么" },
  { key: "ecosystem", label: "环境支撑", desc: "周围人、资源、信息是否支持" },
  { key: "self-awareness", label: "自我认知", desc: "是否真的了解自己的真实需求" },
];

const TOTAL_QUESTIONS = 10;

function getDimensionByStep(step) {
  return QUESTION_DIMENSIONS[step] ?? QUESTION_DIMENSIONS[0];
}

// ---- 本地智能生成（兜底） ----

const TOPIC_PATTERNS = [
  { regex: /养|猫|狗|宠物|仓鼠|鹦鹉|鱼|兔/, category: "pet", comparisonPool: ["布偶猫", "英短蓝猫", "金吉拉", "狸花猫", "泰迪犬", "柯基犬"] },
  { regex: /编程|程序|代码|python|java|javascript|rust|go|前端|后端/i, category: "learning", comparisonPool: ["Java", "Golang", "Rust", "C++", "JavaScript", "Python"] },
  { regex: /考研|考公|考证|辞职|转行|跳槽|创业/, category: "career", comparisonPool: ["继续现状", "在职备考", "非全日制", "先积累再跳", "副业试水"] },
  { regex: /买|相机|摩托|电脑|手机|消费|数码|耳机|手表/, category: "purchase", comparisonPool: ["同价位替代款", "二手先试", "租赁体验", "降一档入门款"] },
  { regex: /乐器|跑步|健身|画画|摄影|跳舞|吉他|钢琴|游泳/, category: "hobby", comparisonPool: ["免费体验课", "借用器材", "线上自学", "短期训练营"] },
  { regex: /表白|恋爱|结婚|分手|复合|相亲/, category: "relationship", comparisonPool: ["先做朋友观察", "保持现状", "直接沟通", "先提升自己"] },
];

function detectCategory(topic) {
  for (const pattern of TOPIC_PATTERNS) {
    if (pattern.regex.test(topic)) return pattern;
  }
  return { category: "general", comparisonPool: ["先小范围试错", "保持现状观察", "找过来人聊聊"] };
}

function pickComparison(topic, step) {
  const { comparisonPool } = detectCategory(topic);
  return comparisonPool[step % comparisonPool.length];
}

// 根据话题和维度生成贴合的问题文案
function buildLocalPrompt(topic, dimension, step, answers) {
  const lastAnswer = answers[answers.length - 1];
  const contextHint = lastAnswer ? `你刚才提到「${lastAnswer.value.slice(0, 40)}」，顺着这点往下看：` : "";

  const promptTemplates = {
    motivation: `${contextHint}你想“${topic}”，到底是出于自己真心想做，还是最近被某件事、某个人、某种情绪推着走？如果没人看，你还会想做吗？`,
    resource: `${contextHint}如果真的开始“${topic}”，时间、预算和精力这三样里，哪一样最先见底？你现在能投入的底线是多少？`,
    risk: `${contextHint}“${topic}”最坏会变成什么样？那种代价——不管是钱、时间还是关系——你现在扛得住吗？扛不住的话会连累谁？`,
    alternative: `${contextHint}不直接梭哈“${topic}”的话，你能不能先花 1/10 的成本试一下？比如只用一周、只花几十块、只跟一个人聊聊？`,
    fallback: `${contextHint}如果三个月后发现“${topic}”不适合你，你准备怎么收尾？是换方向、暂停还是彻底放弃？退路现在想清楚了吗？`,
    timing: `${contextHint}为什么是现在想做“${topic}”，而不是半年前或半年后？现在这个时间点有什么特别的，还是只是刚好想到了？`,
    sustainability: `${contextHint}想象一下连续做“${topic}”三个月、每天重复，你还会觉得有意思吗？哪些部分你会最先厌倦？`,
    tradeoff: `${contextHint}选择“${topic}”意味着你必须放弃什么？那个被放弃的东西，半年后你会不会后悔？`,
    ecosystem: `${contextHint}你身边的人——家人、朋友、同事——会怎么看你做“${topic}”？你能在周围找到懂行、能帮你的人吗？还是只能一个人扛？`,
    "self-awareness": `${contextHint}说到底，你觉得“${topic}”能满足你内心哪个真实需求？是想要成就感、归属感、安全感，还是只想证明什么？`,
  };

  return promptTemplates[dimension.key] || promptTemplates.motivation;
}

// 生成 3 个选项，立场分布为 topic / alternative / mixed
function buildLocalOptions(dimension, comparisonTarget) {
  const optionTemplates = {
    motivation: [
      { label: "我是真心想做，跟外界无关", trend: "rational", stance: "topic" },
      { label: "说实话有点被推着走，但也不全是", trend: "neutral", stance: "mixed" },
      { label: "我现在更像是在逃避别的事", trend: "impulsive", stance: "alternative" },
    ],
    resource: [
      { label: "时间和预算我都算过，能安排", trend: "rational", stance: "topic" },
      { label: "能挤一点，但还不稳定", trend: "neutral", stance: "mixed" },
      { label: "我其实还没认真算过现实成本", trend: "neutral", stance: "alternative" },
    ],
    risk: [
      { label: "最坏结果我能接受，知道会痛在哪", trend: "rational", stance: "topic" },
      { label: "有点怕，但愿意继续拆清楚", trend: "neutral", stance: "mixed" },
      { label: "我还没敢认真想最坏情况", trend: "neutral", stance: "alternative" },
    ],
    alternative: [
      { label: "我愿意先做一次低成本试水", trend: "rational", stance: "topic" },
      { label: "可以试一点，但我还是想快点定下来", trend: "neutral", stance: "mixed" },
      { label: "我现在只想一步到位", trend: "impulsive", stance: "alternative" },
    ],
    fallback: [
      { label: "我有退路，也想过怎么止损", trend: "rational", stance: "topic" },
      { label: "有模糊想法，但还不够具体", trend: "neutral", stance: "mixed" },
      { label: "我完全没想过 Plan B", trend: "neutral", stance: "alternative" },
    ],
    timing: [
      { label: "现在确实是最合适的窗口，我等过", trend: "rational", stance: "topic" },
      { label: "说不上特别，但也不想再拖了", trend: "neutral", stance: "mixed" },
      { label: "其实就是最近突然想到的", trend: "impulsive", stance: "alternative" },
    ],
    sustainability: [
      { label: "重复做我也能接受，核心部分我喜欢", trend: "rational", stance: "topic" },
      { label: "有些部分会腻，但应该能扛", trend: "neutral", stance: "mixed" },
      { label: "说实话我不确定三个月后还愿不愿意", trend: "neutral", stance: "alternative" },
    ],
    tradeoff: [
      { label: "放弃的东西我想过，能接受", trend: "rational", stance: "topic" },
      { label: "有点舍不得，但觉得值得", trend: "neutral", stance: "mixed" },
      { label: "我还没认真想过要放弃什么", trend: "neutral", stance: "alternative" },
    ],
    ecosystem: [
      { label: "周围有人支持，也能找到懂行的人", trend: "rational", stance: "topic" },
      { label: "支持不多，但我可以自己找资源", trend: "neutral", stance: "mixed" },
      { label: "基本只能一个人扛，没人懂", trend: "neutral", stance: "alternative" },
    ],
    "self-awareness": [
      { label: "我知道自己要什么，这件事能满足", trend: "rational", stance: "topic" },
      { label: "隐约知道，但还没完全想清楚", trend: "neutral", stance: "mixed" },
      { label: "我其实不确定自己到底要什么", trend: "neutral", stance: "alternative" },
    ],
  };

  const templates = optionTemplates[dimension.key] || optionTemplates.motivation;
  return templates.map((opt, index) => ({
    id: `ai-${dimension.key}-${index + 1}`,
    label: opt.label,
    trend: opt.trend,
    stance: opt.stance,
  }));
}

function generateLocalQuestion(topic, step, answers) {
  const dimension = getDimensionByStep(step);
  const comparisonTarget = pickComparison(topic, step);
  const prompt = buildLocalPrompt(topic, dimension, step, answers);
  const options = buildLocalOptions(dimension, comparisonTarget);

  return {
    id: `ai-${dimension.key}-${step + 1}`,
    dimension: dimension.key,
    title: dimension.label,
    prompt,
    options,
    comparisonTarget,
    scenarioLabel: detectCategory(topic).category,
  };
}

// ---- AI 生成（OpenAI 兼容） ----

function buildAiSystemPrompt(topic, step, answers) {
  const dimension = getDimensionByStep(step);
  const answerContext = answers.length
    ? answers.map((a, i) => `第${i + 1}轮「${a.title}」：${a.value}`).join("\n")
    : "（暂无历史回答）";

  return `你是一个"劝退鉴定师"AI，擅长用犀利但温和的提问帮用户看清自己想做的事是否真的适合现在做。

当前用户想做的事：${topic}
当前是第 ${step + 1} / ${TOTAL_QUESTIONS} 轮提问。
本轮维度：${dimension.label}（${dimension.desc}）

用户之前的回答：
${answerContext}

请基于用户的具体话题和历史回答，生成一个贴合「${topic}」这一具体场景的问题。要求：
1. 问题必须紧扣「${topic}」这件事本身，不要泛泛而谈
2. 结合用户之前的回答自然追问，不要重复已问过的角度
3. 语气像朋友聊天，不要说教，可以带一点犀利
4. 提供 3 个选项，分别代表：偏向去做(topic)、偏向再想想(alternative)、还在摇摆(mixed)
5. 选项要具体、口语化，像真人会说的话

返回纯 JSON，格式：
{
  "dimension": "${dimension.key}",
  "title": "${dimension.label}",
  "prompt": "问题正文",
  "comparisonTarget": "对比项（可选）",
  "options": [
    {"id": "opt-1", "label": "选项1", "trend": "rational", "stance": "topic"},
    {"id": "opt-2", "label": "选项2", "trend": "neutral", "stance": "mixed"},
    {"id": "opt-3", "label": "选项3", "trend": "impulsive", "stance": "alternative"}
  ]
}

trend 只能是 rational/neutral/impulsive，stance 只能是 topic/mixed/alternative。只返回 JSON，不要其他文字。`;
}

async function callAi(messages, { maxTokens = 600, temperature = 0.8 } = {}) {
  const response = await fetch(`${AI_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AI_API_KEY}`,
    },
    body: JSON.stringify({
      model: AI_MODEL,
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    throw new Error(`AI 接口返回 ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}



function parseAiResponse(content, topic, step, answers) {
  const dimension = getDimensionByStep(step);

  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("AI 返回内容无 JSON");
    const parsed = JSON.parse(jsonMatch[0]);

    if (!parsed.prompt || !Array.isArray(parsed.options) || parsed.options.length < 2) {
      throw new Error("AI 返回结构不完整");
    }

    const validTrends = new Set(["rational", "neutral", "impulsive"]);
    const validStances = new Set(["topic", "mixed", "alternative"]);

    return {
      id: `ai-${dimension.key}-${step + 1}`,
      dimension: dimension.key,
      title: parsed.title || dimension.label,
      prompt: parsed.prompt,
      options: parsed.options.slice(0, 3).map((opt, index) => ({
        id: opt.id || `ai-${dimension.key}-${index + 1}`,
        label: opt.label,
        trend: validTrends.has(opt.trend) ? opt.trend : "neutral",
        stance: validStances.has(opt.stance) ? opt.stance : "mixed",
      })),
      comparisonTarget: parsed.comparisonTarget || pickComparison(topic, step),
      scenarioLabel: detectCategory(topic).category,
    };
  } catch {
    return generateLocalQuestion(topic, step, answers);
  }
}

// ---- 对外入口 ----

export async function generateQuestion(topic, step, answers) {
  // 无 API key 时直接走本地智能生成
  if (!AI_API_KEY) {
    return generateLocalQuestion(topic, step, answers);
  }

  try {
    const systemPrompt = buildAiSystemPrompt(topic, step, answers);
    const content = await callAi([
      { role: "system", content: "你是一个专业的决策辅导 AI，只返回 JSON。" },
      { role: "user", content: systemPrompt },
    ]);
    return parseAiResponse(content, topic, step, answers);
  } catch {
    return generateLocalQuestion(topic, step, answers);
  }
}

// ---- 报告相关 AI 生成（summary / dimensionInsight / actionSuggestion） ----

function buildReportSystemPrompt(topic, persona, answers, discourageScore, verdict) {
  const personaLabel = persona === "sharp" ? "犀利直接" : "温和克制";
  const verdictLabel =
    verdict === "go" ? "可以行动" : verdict === "try-first" ? "建议先小范围试水" : "建议暂缓";

  const answerLines = answers
    .map((a, i) => `第${i + 1}轮「${a.title}」：${a.value}（倾向 ${a.trend} / 立场 ${a.stance}）`)
    .join("\n");

  return `你是一个"劝退鉴定师"AI，正在为用户生成决策报告。语气要求：${personaLabel}。

用户想做的事：${topic}
阻力分（0-100，越高越不建议立刻做）：${discourageScore}
结论：${verdictLabel}

用户回答汇总：
${answerLines}

请生成报告内容，要求：
1. summary：3 条整体判断，每条一句话，自然口语化，不要套话，紧扣这个话题和回答
2. dimensionInsights：针对每一轮回答给一句话点评，必须与 summary 不重复，点出该维度的关键信号
3. actionSuggestion：一个具体的、可在 24 小时内完成的最小行动，必须紧扣「${topic}」，可执行、低成本、能验证假设

返回纯 JSON，格式：
{
  "summary": ["句1", "句2", "句3"],
  "dimensionInsights": ["针对第1轮的点评", "针对第2轮的点评", "..."],
  "actionSuggestion": "一句话具体行动"
}
只返回 JSON，不要其他文字。dimensionInsights 数组长度必须等于回答数 ${answers.length}。`;
}

function parseReportAi(content, fallback) {
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("AI 返回内容无 JSON");
    const parsed = JSON.parse(jsonMatch[0]);

    if (!Array.isArray(parsed.summary) || parsed.summary.length < 1) {
      throw new Error("summary 结构不完整");
    }
    if (!Array.isArray(parsed.dimensionInsights)) {
      throw new Error("dimensionInsights 结构不完整");
    }
    if (typeof parsed.actionSuggestion !== "string" || !parsed.actionSuggestion.trim()) {
      throw new Error("actionSuggestion 结构不完整");
    }

    return {
      summary: parsed.summary.slice(0, 4).map((s) => String(s).trim()).filter(Boolean),
      dimensionInsights: parsed.dimensionInsights.map((s) => String(s).trim()),
      actionSuggestion: parsed.actionSuggestion.trim(),
    };
  } catch {
    return fallback;
  }
}

export async function generateReportText(topic, persona, answers, discourageScore, verdict, fallback) {
  if (!AI_API_KEY) return fallback;

  try {
    const systemPrompt = buildReportSystemPrompt(topic, persona, answers, discourageScore, verdict);
    const content = await callAi(
      [
        { role: "system", content: "你是一个专业的决策报告生成 AI，只返回 JSON。" },
        { role: "user", content: systemPrompt },
      ],
      { maxTokens: 900, temperature: 0.7 },
    );
    return parseReportAi(content, fallback);
  } catch {
    return fallback;
  }
}

// ---- 试水过程智能分析（完成后生成） ----

function buildProcessAnalysisPrompt(topic, petName, answers, discourageScore, verdict) {
  const verdictLabel =
    verdict === "go" ? "可以行动" : verdict === "try-first" ? "建议先小范围试水" : "建议暂缓";

  const answerLines = answers
    .map((a, i) => `第${i + 1}轮「${a.title}」：${a.value}（倾向 ${a.trend} / 立场 ${a.stance}）`)
    .join("\n");

  return `你是一个叙事治疗师 AI，正在为用户生成「试水过程回顾」。语气温柔但有洞察力，像一个懂你的老朋友在帮你复盘。

用户想做的事：${topic}
陪伴宠物：${petName}
阻力分：${discourageScore}/100
结论：${verdictLabel}

用户十轮回答完整记录：
${answerLines}

请基于以上回答，生成一份试水过程分析，要求：
1. trajectory：一段话（50-100字），描述用户在这十轮中决策风格的演变轨迹，点出从第几轮到第几轮发生了什么转变
2. patterns：2-3 条思维模式特征，每条一句话，指出用户反复出现的思考习惯（比如"习惯用理性压制直觉""在不确定时倾向收集更多信息"）
3. highlights：1-2 个关键转折点，每条一句话，指出哪一轮回答最能体现用户的内心拉扯或突破
4. growthMessage：以陪伴宠物「${petName}」的口吻写给用户的一段话（30-60字），温暖、具体、不套话，提到用户在这次试水中的某个具体表现

返回纯 JSON，格式：
{
  "trajectory": "一段话描述决策风格演变",
  "patterns": ["思维特征1", "思维特征2"],
  "highlights": ["关键转折点1"],
  "growthMessage": "宠物以自己口吻写的寄语"
}
只返回 JSON，不要其他文字。`;
}

function parseProcessAnalysis(content, fallback) {
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("AI 返回内容无 JSON");
    const parsed = JSON.parse(jsonMatch[0]);

    if (typeof parsed.trajectory !== "string" || !parsed.trajectory.trim()) {
      throw new Error("trajectory 结构不完整");
    }
    if (!Array.isArray(parsed.patterns) || parsed.patterns.length < 1) {
      throw new Error("patterns 结构不完整");
    }
    if (typeof parsed.growthMessage !== "string" || !parsed.growthMessage.trim()) {
      throw new Error("growthMessage 结构不完整");
    }

    return {
      trajectory: parsed.trajectory.trim(),
      patterns: parsed.patterns.map((s) => String(s).trim()).filter(Boolean),
      highlights: Array.isArray(parsed.highlights)
        ? parsed.highlights.map((s) => String(s).trim()).filter(Boolean)
        : [],
      growthMessage: parsed.growthMessage.trim(),
    };
  } catch {
    return fallback;
  }
}

export async function generateProcessAnalysis(topic, petName, answers, discourageScore, verdict) {
  const fallback = {
    trajectory: `这十轮里，你的回答从最初的犹疑逐渐走向清晰，中间几轮有过来回拉扯，但最终倾向趋于稳定。`,
    patterns: ["在不确定时习惯多角度权衡", "会本能地考虑最坏情况再决定是否前行"],
    highlights: ["中间几轮的回答最能体现你内心理智与直觉的拉扯"],
    growthMessage: `${petName}看到你一路认真回答每一道题，哪怕犹豫也没放弃想清楚——这份耐心本身就很难得。`,
  };

  if (!AI_API_KEY) return fallback;

  try {
    const systemPrompt = buildProcessAnalysisPrompt(topic, petName, answers, discourageScore, verdict);
    const content = await callAi(
      [
        { role: "system", content: "你是一个叙事治疗师 AI，擅长从对话中洞察思维模式，只返回 JSON。" },
        { role: "user", content: systemPrompt },
      ],
      { maxTokens: 800, temperature: 0.75 },
    );
    return parseProcessAnalysis(content, fallback);
  } catch {
    return fallback;
  }
}

export { TOTAL_QUESTIONS, QUESTION_DIMENSIONS };
