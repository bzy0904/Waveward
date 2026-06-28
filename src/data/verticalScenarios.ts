import { getActionSuggestion } from "@/data/demoContent";
import type {
  AnswerOption,
  AnswerRecord,
  AnswerStance,
  QuestionDimension,
  QuestionItem,
  TopicCategory,
} from "@/types/session";
import { classifyTopic } from "@/utils/topicClassifier";

type ScenarioId = "cow-cat" | "programming" | "exam" | "general";

type ScenarioContext = {
  topic: string;
  answers: AnswerRecord[];
};

type ScenarioQuestion = Omit<QuestionItem, "id">;

type ScenarioDefinition = {
  id: ScenarioId;
  label: string;
  match: (topic: string) => boolean;
  buildQuestion: (step: number, context: ScenarioContext) => ScenarioQuestion;
  buildActionSuggestion: (context: ScenarioContext, verdict: "go" | "try-first" | "wait") => string;
  category: (topic: string) => TopicCategory;
};

export const TOTAL_QUESTIONS = 10;

export const genericDimensionOrder: QuestionDimension[] = [
  "motivation",
  "resource",
  "risk",
  "alternative",
  "fallback",
  "timing",
  "sustainability",
  "tradeoff",
  "ecosystem",
  "self-awareness",
];

export const genericDimensionLabels: Record<QuestionDimension, string> = {
  "pet-personality": "性格对比",
  "pet-energy": "精力对比",
  "pet-voice": "声音对比",
  "pet-health": "风险对比",
  "pet-maintenance": "维护对比",
  "code-language": "语言门槛",
  "code-feedback": "成就反馈",
  "code-resource": "资料密度",
  "code-direction": "用途取向",
  "code-threshold": "启动门槛",
  "exam-motivation": "动机对比",
  "exam-cost": "成本对比",
  "exam-risk": "风险对比",
  "exam-alternative": "替代方案",
  "exam-fallback": "退路规划",
  motivation: "真实动机",
  resource: "硬性条件",
  risk: "风险承受",
  alternative: "低成本试水",
  fallback: "退路规划",
  timing: "时机判断",
  sustainability: "长期可持续",
  tradeoff: "机会成本",
  ecosystem: "环境支撑",
  "self-awareness": "自我认知",
};

const stanceKeywords: Record<AnswerStance, string[]> = {
  topic: ["喜欢闹腾", "能接受", "愿意陪", "想冲", "就学 python", "全职考", "我可以"],
  alternative: ["安静", "省心", "独立", "轻松", "网页", "在职", "不想辞职", "温顺"],
  mixed: [],
};

function createOption(
  id: string,
  label: string,
  trend: AnswerOption["trend"],
  stance: AnswerStance,
): AnswerOption {
  return { id, label, trend, stance };
}

function hasKeyword(value: string, keywords: string[]) {
  return keywords.some((keyword) => value.includes(keyword));
}

function readAnswer(answers: AnswerRecord[], index: number) {
  return answers[index]?.value ?? "";
}

function inferCatEnergyTarget(answers: AnswerRecord[]) {
  const combined = answers.map((answer) => answer.value).join(" ");

  if (hasKeyword(combined, ["忙", "加班", "没空", "独立", "省心"])) {
    return {
      name: "狸花猫",
      description: "自己玩玩具也能消耗大半天，不太会因为你晚回家就开始拆家",
    };
  }

  if (hasKeyword(combined, ["安静", "抱着", "温顺", "懒一点"])) {
    return {
      name: "英短蓝猫",
      description: "更能接受安静趴着，存在感稳定，不会随时把家里变跑道",
    };
  }

  return {
    name: "布偶猫",
    description: "更像大型抱枕，能在同一个地方安静待很久，陪玩阈值没那么高",
  };
}

function inferProgrammingDirection(answers: AnswerRecord[]) {
  const combined = answers.map((answer) => answer.value).join(" ").toLowerCase();

  if (hasKeyword(combined, ["网页", "前端", "页面", "网站", "web", "界面"])) {
    return {
      name: "JavaScript",
      description: "更专注网页和交互，方向更窄但目标感更强",
    };
  }

  if (hasKeyword(combined, ["文档", "自学", "后台", "工程化", "go"])) {
    return {
      name: "Golang",
      description: "工程味更重，很多问题得自己啃文档，适合耐得住打磨的人",
    };
  }

  return {
    name: "JavaScript",
    description: "更专注网页开发，路径更直接，但可迁移面没有 Python 那么宽",
  };
}

function buildGenericPrompt(topic: string, step: number) {
  const prompts = [
    `你想“${topic}”，到底是出于真喜欢，还是最近被环境推着往前走？`,
    `如果真的开始“${topic}”，时间、预算和精力里，哪一项最先吃紧？`,
    `这件事最坏会发生什么？那种代价你现在扛得住吗？`,
    `不直接梭哈的话，你能不能先做一次 1/10 成本的试水？`,
    `如果三个月后发现不适合，你准备怎么收尾和止损？`,
    `为什么是现在想做“${topic}”，而不是半年前或半年后？这个时间点有什么特别的？`,
    `想象连续做“${topic}”三个月每天重复，你还会觉得有意思吗？哪部分最先厌倦？`,
    `选择“${topic}”意味着你必须放弃什么？那个被放弃的东西半年后你会不会后悔？`,
    `你身边的人会怎么看这件事？你能找到懂行的人帮忙吗，还是只能一个人扛？`,
    `说到底，“${topic}”能满足你内心哪个真实需求？成就感、安全感，还是只想证明什么？`,
  ];

  return prompts[step] ?? prompts[0];
}

const scenarioDefinitions: ScenarioDefinition[] = [
  {
    id: "cow-cat",
    label: "养奶牛猫",
    match: (topic) => /奶牛猫|牛奶猫/.test(topic),
    buildQuestion: (step, context) => {
      const energyTarget = inferCatEnergyTarget(context.answers);

      const questions: ScenarioQuestion[] = [
        {
          dimension: "pet-personality",
          title: "性格对比",
          comparisonTarget: "布偶猫",
          scenarioLabel: "养奶牛猫",
          prompt:
            "奶牛猫的好奇心重到能把自己卡进门缝里，外号常常是“猫中二哈”。而布偶猫被抱起来就容易软成一滩，很多时候只想安静贴着人。你更想和哪一种相处？",
          options: [
            createOption("cat-p1", "我就喜欢会闹会互动的，奶牛猫这种更对胃口", "rational", "topic"),
            createOption("cat-p2", "我更想要温顺黏人的陪伴感，布偶猫那种更合适", "rational", "alternative"),
            createOption("cat-p3", "我得看自己那天的状态，太闹和太软都怕不稳定", "neutral", "mixed"),
          ],
        },
        {
          dimension: "pet-energy",
          title: "精力对比",
          comparisonTarget: energyTarget.name,
          scenarioLabel: "养奶牛猫",
          prompt: `奶牛猫的精力值大概是${energyTarget.name}的 3 倍，一天跑酷 8 次都不夸张。${energyTarget.name}${energyTarget.description}。你家里更适合“永动机”，还是“自己能消耗自己”的类型？`,
          options: [
            createOption("cat-e1", "我能接受每天至少陪玩 30 分钟，家里热闹点也行", "rational", "topic"),
            createOption("cat-e2", `我更需要像${energyTarget.name}这样能自己待着的，不想被高频拉着跑`, "rational", "alternative"),
            createOption("cat-e3", "我现在作息不稳定，可能得先试试自己能不能跟上", "neutral", "mixed"),
          ],
        },
        {
          dimension: "pet-voice",
          title: "声音对比",
          comparisonTarget: "英短蓝猫",
          scenarioLabel: "养奶牛猫",
          prompt:
            "奶牛猫不算最话痨，但真叫起来动静很足，常常像在跟你认真“开会”。而英短蓝猫普遍更安静，存在感更多来自陪着你发呆。你更喜欢哪种陪伴节奏？",
          options: [
            createOption("cat-v1", "有互动感挺好，偶尔被一只猫喊两声我能接受", "neutral", "topic"),
            createOption("cat-v2", "我更想要安静陪伴，最好别高频打断我的注意力", "rational", "alternative"),
            createOption("cat-v3", "声音不是核心，但我很怕持续性的闹腾", "neutral", "mixed"),
          ],
        },
        {
          dimension: "pet-health",
          title: "风险对比",
          comparisonTarget: "布偶猫",
          scenarioLabel: "养奶牛猫",
          prompt:
            "奶牛猫的基因库通常比很多品种猫更皮实，但它天生爱冒险，卡住、摔下去、乱钻缝隙的概率也明显更高。布偶猫常见的是体质和护理成本问题，日常冒险反而没那么猛。你更担心哪一种代价？",
          options: [
            createOption("cat-h1", "我更怕长期体弱带来的医疗和护理压力，冒险型反而还能防", "rational", "topic"),
            createOption("cat-h2", "我最怕它自己作出事，天天提心吊胆我受不了", "rational", "alternative"),
            createOption("cat-h3", "两种风险我都怕，得先看看家里环境能不能做好防护", "neutral", "mixed"),
          ],
        },
        {
          dimension: "pet-maintenance",
          title: "维护对比",
          comparisonTarget: "金吉拉",
          scenarioLabel: "养奶牛猫",
          prompt:
            "奶牛猫的黑白花色辨识度很高，像是自带小西装，但它的麻烦点往往不在掉毛，而在精力和日常管理。金吉拉更像“颜值税”，毛量大、打理久，可胜在多数时候没那么爱拆。你更怕哪种维护成本？",
          options: [
            createOption("cat-m1", "我宁可多陪玩、多互动，也不想天天被毛量追着跑", "rational", "topic"),
            createOption("cat-m2", "我更怕拆家和高精力，打理外观反而是固定劳动", "rational", "alternative"),
            createOption("cat-m3", "我要看空间、沙发颜色和作息再判断谁更折磨人", "neutral", "mixed"),
          ],
        },
      ];

      return questions[step] ?? questions[0];
    },
    buildActionSuggestion: (context, verdict) => {
      if (verdict === "go") {
        return "去猫咖或救助站专门找奶牛猫待 1 小时，观察自己对跑酷、呼唤、突然起飞这些高能行为是不是越看越喜欢。";
      }

      return "先连续 3 天记录自己的作息和回家时间，再去猫咖专门找奶牛猫陪玩 30 分钟，确认你能不能稳定接住它的精力值。";
    },
    category: () => "pet",
  },
  {
    id: "programming",
    label: "学编程",
    match: (topic) => /编程|程序|代码|python|java|javascript|rust|go/i.test(topic),
    buildQuestion: (step, context) => {
      const directionTarget = inferProgrammingDirection(context.answers);

      const questions: ScenarioQuestion[] = [
        {
          dimension: "code-language",
          title: "语言门槛",
          comparisonTarget: "Java",
          scenarioLabel: "学编程",
          prompt:
            "Python 的关键词几乎都是可读性很强的英文单词，新手第一眼往往能猜出大意。Java 的语法结构更完整，但符号、类和模板感也更强。你更怕看英文，还是更怕被一堆结构先压住？",
          options: [
            createOption("code-l1", "英文我能查词，但太多结构和符号会先把我劝退", "rational", "topic"),
            createOption("code-l2", "我能接受语法严格一点，反而想早点适应工程化结构", "neutral", "alternative"),
            createOption("code-l3", "我只想先选最不容易被第一周劝退的入口", "neutral", "topic"),
          ],
        },
        {
          dimension: "code-feedback",
          title: "成就反馈",
          comparisonTarget: "C++",
          scenarioLabel: "学编程",
          prompt:
            "用 Python 做自动化或数据分析，几行代码就能看见结果，成就感来得很快。C++ 更像长期打磨型选手，前面可能折腾很久都还在跟环境和内存较劲。你更需要哪种学习反馈？",
          options: [
            createOption("code-f1", "我需要尽快看到成果，不然热情会掉得很快", "rational", "topic"),
            createOption("code-f2", "我不怕慢一点，只要底子够扎实就行", "rational", "alternative"),
            createOption("code-f3", "我能接受前期难，但最好还是别一直看不到产出", "neutral", "mixed"),
          ],
        },
        {
          dimension: "code-resource",
          title: "资料密度",
          comparisonTarget: "Golang",
          scenarioLabel: "学编程",
          prompt:
            "Python 的社区教程和报错答案几乎是新手最容易搜到的一档，遇到问题往往有人已经踩过坑。Golang 的资料也不少，但很多时候你得自己啃英文文档和源码。你更希望怎么学？",
          options: [
            createOption("code-r1", "我希望先有大量现成答案兜底，卡住时不至于直接停住", "rational", "topic"),
            createOption("code-r2", "我能接受自己啃文档，只要方向清楚就行", "rational", "alternative"),
            createOption("code-r3", "我最好有答案兜底，但也愿意慢慢提升自学能力", "neutral", "mixed"),
          ],
        },
        {
          dimension: "code-direction",
          title: "用途取向",
          comparisonTarget: directionTarget.name,
          scenarioLabel: "学编程",
          prompt: `Python 能做自动化、数据分析、AI、后端脚本，属于“什么都能碰一点”的路线。${directionTarget.name}${directionTarget.description}。你更想要“入口广”，还是“方向一开始就特别清楚”？`,
          options: [
            createOption("code-d1", "我现在更需要一个能尽快打开多个方向的入口", "rational", "topic"),
            createOption("code-d2", `我更想像${directionTarget.name}这样先盯住一个明确赛道`, "rational", "alternative"),
            createOption("code-d3", "我还不确定未来方向，先别把自己锁太死比较好", "neutral", "topic"),
          ],
        },
        {
          dimension: "code-threshold",
          title: "启动门槛",
          comparisonTarget: "Rust",
          scenarioLabel: "学编程",
          prompt:
            "Python 的入门门槛低，第一行代码几乎能立刻跑起来。Rust 往往从环境、工具链和所有权概念开始就要求你很认真。你更看重“快速上手”，还是“不怕一开始就硬一点”？",
          options: [
            createOption("code-t1", "我现在最重要的是先跑起来，把自信建立起来", "rational", "topic"),
            createOption("code-t2", "我不怕麻烦，只要语言长期值得投入就行", "neutral", "alternative"),
            createOption("code-t3", "我可以接受稍微麻烦一点，但别让我第一周就怀疑人生", "neutral", "mixed"),
          ],
        },
      ];

      return questions[step] ?? questions[0];
    },
    buildActionSuggestion: (context, verdict) => {
      if (verdict === "go") {
        return "今晚就用 Python 跑一个 20 分钟内能完成的小练习，比如打印账单、整理文件或画一张简单图表，先把“我会了第一步”的反馈拿到。";
      }

      return "先找一个 30 分钟内能完成的 Python 入门任务，再对照一节 JavaScript 或 Java 新手课，看看你更容易被哪一种反馈节奏留住。";
    },
    category: () => "learning",
  },
  {
    id: "exam",
    label: "辞职考研",
    match: (topic) => /考研|辞职.*考研|辞职去考研/.test(topic),
    buildQuestion: (step) => {
      const questions: ScenarioQuestion[] = [
        {
          dimension: "exam-motivation",
          title: "动机对比",
          comparisonTarget: "继续上班",
          scenarioLabel: "辞职考研",
          prompt:
            "有些人辞职考研，是因为明确知道自己要用学历换岗位、换赛道；也有人只是被现在的工作压得想逃。前者通常更能扛住漫长备考，后者常常学到一半开始怀疑。你更接近哪一种？",
          options: [
            createOption("exam-m1", "我是奔着明确目标去的，不是单纯想逃离现在", "rational", "topic"),
            createOption("exam-m2", "说实话我现在更像是想离开这份工作，考研只是出口之一", "neutral", "alternative"),
            createOption("exam-m3", "两种都有，我既想换路也想逃开眼前的消耗", "neutral", "mixed"),
          ],
        },
        {
          dimension: "exam-cost",
          title: "成本对比",
          comparisonTarget: "在职考研",
          scenarioLabel: "辞职考研",
          prompt:
            "全职考研一年，生活费、资料费和报名/课程开销加起来，常见就是 3 到 5 万起步；在职考研虽然会慢，但不用立刻断掉收入。你现在更怕哪种成本？",
          options: [
            createOption("exam-c1", "我更怕时间被拖太长，如果辞职能换来专注，我愿意算这笔账", "rational", "topic"),
            createOption("exam-c2", "我更怕现金流断掉，宁可慢一点也不想先把自己逼进墙角", "rational", "alternative"),
            createOption("exam-c3", "两边都怕，我可能得先算清楚存款和每月最低支出", "neutral", "mixed"),
          ],
        },
        {
          dimension: "exam-risk",
          title: "风险对比",
          comparisonTarget: "继续工作",
          scenarioLabel: "辞职考研",
          prompt:
            "最坏情况不是“努力了没考上”这么简单，而是辞了职、花了钱、情绪也耗下去，结果出来还是得重新找方向。可如果你不考，以后也可能一直惦记“当时要是试过呢”。你更怕哪种后果？",
          options: [
            createOption("exam-r1", "我更怕一直后悔没试过，只要预算可控，我能接受试一次", "neutral", "topic"),
            createOption("exam-r2", "我更怕失去收入和稳定后还一无所获，这个风险现在太硬了", "rational", "alternative"),
            createOption("exam-r3", "我两种都怕，所以需要更可控的中间方案", "rational", "mixed"),
          ],
        },
        {
          dimension: "exam-alternative",
          title: "替代方案",
          comparisonTarget: "非全日制/在职备考",
          scenarioLabel: "辞职考研",
          prompt:
            "有人会先走非全日制或在职备考这条折中路线，累一点，但不用把所有筹码一次性压上。也有人觉得自己如果不全力冲，就一定会分心。你更像哪一种？",
          options: [
            createOption("exam-a1", "我知道自己需要完整时间块，全职冲更现实", "rational", "topic"),
            createOption("exam-a2", "我更适合先保住基本盘，再决定要不要进一步加码", "rational", "alternative"),
            createOption("exam-a3", "我得先试一段时间高强度学习，再判断自己是不是必须辞职", "rational", "mixed"),
          ],
        },
        {
          dimension: "exam-fallback",
          title: "退路规划",
          comparisonTarget: "继续留在原轨道",
          scenarioLabel: "辞职考研",
          prompt:
            "如果没考上，你的退路是什么？回原单位、换城市找工作、二战，还是直接转方向？很多人不是输在没努力，而是输在一开始根本没给自己准备回撤路线。你的退路现在稳吗？",
          options: [
            createOption("exam-f1", "我已经想过考不上之后的去向，至少不会原地崩掉", "rational", "topic"),
            createOption("exam-f2", "我还没有足够稳的退路，所以现在不适合直接辞职", "rational", "alternative"),
            createOption("exam-f3", "我只想过一点雏形，还需要把 Plan B 写实一点", "neutral", "mixed"),
          ],
        },
      ];

      return questions[step] ?? questions[0];
    },
    buildActionSuggestion: (context, verdict) => {
      if (verdict === "go") {
        return "先请自己过一个 3 天模拟备考周：按正式节奏起床、刷题、复盘，再核对你的现金流和退路表，看看这条路是不是你愿意真实过的生活。";
      }

      return "先做一张现实版辞职考研预算表，再抽 40 分钟和一个正在备考或刚上岸的人通话，把“想象中的考研”换成带数字的现实版本。";
    },
    category: () => "career",
  },
  {
    id: "general",
    label: "泛用决策",
    match: () => true,
    buildQuestion: (step, context) => {
      const dimension = genericDimensionOrder[step] ?? genericDimensionOrder[0];

      const optionsByStep: AnswerOption[][] = [
        [
          createOption("g-m1", "我是真的想了挺久，不是临时上头", "rational", "topic"),
          createOption("g-m2", "我有点被外界推着走，还没完全想明白", "neutral", "mixed"),
          createOption("g-m3", "我现在更像是被情绪推着想立刻做点什么", "impulsive", "alternative"),
        ],
        [
          createOption("g-r1", "时间和预算我大致算过，能安排", "rational", "topic"),
          createOption("g-r2", "能挤一点，但还不稳定", "neutral", "mixed"),
          createOption("g-r3", "我其实还没算现实成本", "neutral", "alternative"),
        ],
        [
          createOption("g-k1", "最坏结果我能接受，至少知道会痛在哪里", "rational", "topic"),
          createOption("g-k2", "我有点怕，但愿意继续拆清楚", "neutral", "mixed"),
          createOption("g-k3", "我还没敢认真想最坏情况", "neutral", "alternative"),
        ],
        [
          createOption("g-a1", "我愿意先做低成本试水", "rational", "topic"),
          createOption("g-a2", "可以试一点，但我还是很想快点定下来", "neutral", "mixed"),
          createOption("g-a3", "我现在只想一步到位", "impulsive", "alternative"),
        ],
        [
          createOption("g-f1", "我有退路，也想过怎么止损", "rational", "topic"),
          createOption("g-f2", "我有模糊想法，但还不够具体", "neutral", "mixed"),
          createOption("g-f3", "我完全没想过 Plan B", "neutral", "alternative"),
        ],
        [
          createOption("g-t1", "现在确实是最合适的窗口，我等过", "rational", "topic"),
          createOption("g-t2", "说不上特别，但也不想再拖了", "neutral", "mixed"),
          createOption("g-t3", "其实就是最近突然想到的", "impulsive", "alternative"),
        ],
        [
          createOption("g-s1", "重复做我也能接受，核心部分我喜欢", "rational", "topic"),
          createOption("g-s2", "有些部分会腻，但应该能扛", "neutral", "mixed"),
          createOption("g-s3", "说实话我不确定三个月后还愿不愿意", "neutral", "alternative"),
        ],
        [
          createOption("g-to1", "放弃的东西我想过，能接受", "rational", "topic"),
          createOption("g-to2", "有点舍不得，但觉得值得", "neutral", "mixed"),
          createOption("g-to3", "我还没认真想过要放弃什么", "neutral", "alternative"),
        ],
        [
          createOption("g-e1", "周围有人支持，也能找到懂行的人", "rational", "topic"),
          createOption("g-e2", "支持不多，但我可以自己找资源", "neutral", "mixed"),
          createOption("g-e3", "基本只能一个人扛，没人懂", "neutral", "alternative"),
        ],
        [
          createOption("g-sa1", "我知道自己要什么，这件事能满足", "rational", "topic"),
          createOption("g-sa2", "隐约知道，但还没完全想清楚", "neutral", "mixed"),
          createOption("g-sa3", "我其实不确定自己到底要什么", "neutral", "alternative"),
        ],
      ];

      return {
        dimension,
        title: genericDimensionLabels[dimension],
        prompt: buildGenericPrompt(context.topic, step),
        options: optionsByStep[step] ?? optionsByStep[0],
        scenarioLabel: "泛用决策",
      };
    },
    buildActionSuggestion: (context) => getActionSuggestion(classifyTopic(context.topic), context.topic),
    category: (topic) => classifyTopic(topic),
  },
];

export function resolveScenario(topic: string) {
  return scenarioDefinitions.find((scenario) => scenario.match(topic)) ?? scenarioDefinitions.at(-1)!;
}

export function getQuestionAtScenarioStep(
  topic: string,
  step: number,
  answers: AnswerRecord[],
): QuestionItem {
  const scenario = resolveScenario(topic);
  const question = scenario.buildQuestion(step, { topic, answers });

  return {
    ...question,
    id: `${scenario.id}-${question.dimension}-${step + 1}`,
  };
}

export function inferCustomStance(input: string): AnswerStance {
  const value = input.trim().toLowerCase();

  if (!value) return "mixed";
  if (hasKeyword(value, stanceKeywords.alternative.map((item) => item.toLowerCase()))) return "alternative";
  if (hasKeyword(value, stanceKeywords.topic.map((item) => item.toLowerCase()))) return "topic";
  return "mixed";
}

export function getScenarioLabel(topic: string) {
  return resolveScenario(topic).label;
}

export function getScenarioCategory(topic: string) {
  return resolveScenario(topic).category(topic);
}

export function buildScenarioActionSuggestion(
  topic: string,
  answers: AnswerRecord[],
  verdict: "go" | "try-first" | "wait",
) {
  return resolveScenario(topic).buildActionSuggestion({ topic, answers }, verdict);
}

export function buildInsightLine(answer: AnswerRecord) {
  if (answer.stance === "topic") {
    return `这一轮你明显更能接受「${answer.title}」里偏向当前选项的代价。`;
  }

  if (answer.stance === "alternative") {
    return `这一轮你更像在向对比项靠拢，说明「${answer.title}」是当前不匹配的关键点。`;
  }

  return `这一轮你没有急着站队，而是在给「${answer.title}」补现实条件。`;
}

export function buildScenarioSummary(topic: string, answers: AnswerRecord[], discourageScore: number) {
  const scenario = resolveScenario(topic);
  const topicCount = answers.filter((answer) => answer.stance === "topic").length;
  const alternativeCount = answers.filter((answer) => answer.stance === "alternative").length;
  const mixedCount = answers.filter((answer) => answer.stance === "mixed").length;

  const opening =
    scenario.id === "cow-cat"
      ? "这次不是在抽象地问“你适不适合养猫”，而是在看你能不能接住奶牛猫那种高好奇、高互动的生活节奏。"
      : scenario.id === "programming"
        ? "这次判断的核心，不是“你能不能学编程”，而是你更适合先从哪种反馈节奏和门槛进入。"
        : scenario.id === "exam"
          ? "这次你问的不是单纯要不要考研，而是要不要为“辞职全职备考”承担它特有的成本和风险。"
          : `你这次讨论的重点，是“${topic}”背后的现实代价，而不是一时的情绪想象。`;

  const fitLine =
    topicCount >= 3
      ? "你有至少三个维度更偏向当前选项，说明你并不是只被它表面吸引。"
      : alternativeCount >= 3
        ? "你有至少三个维度更偏向对比项，说明真正适合你的可能不是你最先说出口的那个答案。"
        : "你的回答里有不少“要看情况”，说明你现在最需要的不是立刻定论，而是补几块关键现实信息。";

  const cautionLine =
    discourageScore >= 70
      ? "高劝退指数并不等于彻底否决，而是提醒你：当前的匹配度和准备度都还不够，直接冲会很容易把热情烧穿。"
      : discourageScore >= 40
        ? "你不是不能做，而是更适合先试水，把模糊的那几块现实先落地。"
        : "你对代价和节奏的接受度整体不错，重点变成用一个低风险动作把判断从想象带进现实。";

  const ending =
    mixedCount >= 2
      ? "你并不缺想法，缺的是一次带反馈的真实体验。"
      : "现在已经能看见你更接近哪一种生活方式了。";

  return [opening, fitLine, cautionLine, ending];
}
