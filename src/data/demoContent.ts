import type {
  AnswerOption,
  CompanionPet,
  GrowthRecord,
  JourneyEntry,
  PetId,
  PersonaType,
  ScoreTrend,
  TopicCategory,
  UserProfile,
} from "@/types/session";

type PersonaMeta = {
  label: string;
  badge: string;
  intro: string;
  hint: string;
};

type GenericQuestionDimension = "motivation" | "resource" | "risk" | "alternative" | "fallback";

type TemplateMap = Record<GenericQuestionDimension, string[]>;

export const TOTAL_QUESTIONS = 5;

export const dimensionLabels: Record<GenericQuestionDimension, string> = {
  motivation: "真实动机",
  resource: "硬性条件",
  risk: "风险承受",
  alternative: "低成本试水",
  fallback: "退路规划",
};

export const verdictLabels = {
  go: "勇敢去吧",
  "try-first": "建议先试水",
  wait: "建议再等等",
} as const;

export const personaMeta: Record<PersonaType, PersonaMeta> = {
  sharp: {
    label: "嘴毒版",
    badge: "含少量毒舌，请按需食用",
    intro: "会把你从脑补里拽回现实，但不会直接劝摆烂。",
    hint: "你不是不能做，只是先别靠上头做决定。",
  },
  gentle: {
    label: "委婉版",
    badge: "温柔陪聊模式",
    intro: "会顺着你的情绪往下聊，再帮你找出最小起步动作。",
    hint: "先理清楚，再迈出一小步，也很了不起。",
  },
};

export const defaultPetId: PetId = "moon-rabbit";

export const companionPets: CompanionPet[] = [
  {
    id: "moon-rabbit",
    emoji: "🐰",
    name: "衔月",
    title: "把月光放低一点的兔子",
    trait: "温柔",
    style: "最委婉，用故事接住你",
    basePersona: "gentle",
    intro:
      "我是衔月。我的耳朵能听见你没说出口的话。你不用急着证明自己，我会陪你把那团心事轻轻拨开。",
    hint: "你今天想要的是一个不催你的人。",
    statusLines: {
      hesitation: [
        "衔月竖起耳朵，好像在听远处的海浪。",
        "衔月把月亮抱紧了一点，像是怕你的犹豫被风吹散。",
      ],
      decisive: [
        "衔月轻轻晃了晃尾巴，像在说“这一步你想得很真”。",
        "衔月抬头看了你一眼，月光正好落在你手边。",
      ],
      uncertain: [
        "衔月用脑袋蹭了蹭你的手，像在说“不知道也没关系”。",
        "衔月把月亮放低了一点，好让你先看清脚下。",
      ],
      preReport: "衔月用尾巴扫了扫地面，等你一起看结果。",
    },
    interactions: [
      "你摸摸我的耳朵，月亮会亮一点。",
      "先别急着解释，你坐下来，我听你慢慢说。",
      "如果今晚风太大，我们就把答案讲得小一点。",
    ],
    bookTone: "温柔地把光落在页边",
  },
  {
    id: "cloud-tiger",
    emoji: "🐯",
    name: "破云",
    title: "会替你鼓劲也会骂醒你的虎",
    trait: "勇猛",
    style: "直接热血，先把借口拆穿",
    basePersona: "sharp",
    intro:
      "我是破云。你可以犹豫，但别拿犹豫当借口。该冲的时候我会推你一把，不该冲的时候我也会拽住你。",
    hint: "你今天想要的是一个会替你踩刹车的人。",
    statusLines: {
      hesitation: [
        "破云甩了甩尾巴，像是已经看穿你准备找的新借口。",
        "破云低低哼了一声，提醒你别把害怕说成命运。",
      ],
      decisive: [
        "破云抬起下巴，显然喜欢你这次回答里的硬气。",
        "破云前爪往前一按，像在说“这才像样”。",
      ],
      uncertain: [
        "破云绕着你走了一圈，像是在催你把话说清楚。",
        "破云把火焰尾巴压低了一点，准备继续盯住重点。",
      ],
      preReport: "破云蹲在你旁边，尾巴上的火星跳了两下。",
    },
    interactions: [
      "别躲。你不是没答案，你是在怕答案要你行动。",
      "我骂你，不是想打击你，是想把你从脑补里拽回来。",
      "来，抬头。我们先把现实摆桌上，再谈热血。",
    ],
    bookTone: "把每一步都踩出火星",
  },
  {
    id: "ink-mouse",
    emoji: "🐭",
    name: "知微",
    title: "尾巴卷着笔的机敏小鼠",
    trait: "敏锐",
    style: "聪明毒舌，一眼看穿借口",
    basePersona: "sharp",
    intro:
      "我是知微。我不爱听漂亮话，我爱听你话里漏出来的真相。放心，我拆穿你，不代表我不站你这边。",
    hint: "你今天想要的是一个会看穿小心思的人。",
    statusLines: {
      hesitation: [
        "知微推了推单片眼镜，像在等你把真正顾虑说出来。",
        "知微的尾巴卷紧了笔，显然已经记下你的犹豫。",
      ],
      decisive: [
        "知微眯起眼点了点头，像是认可这次回答够具体。",
        "知微用笔尖敲了敲桌面，难得没吐槽你。",
      ],
      uncertain: [
        "知微偏头看你，像在提醒“模糊也是一种逃跑”。",
        "知微轻轻哼笑了一声，准备继续拆你的绕弯。",
      ],
      preReport: "知微把笔收回尾巴里，示意可以翻到下一页了。",
    },
    interactions: [
      "你盯了我三秒，是在猜我下一句要说什么吗？",
      "放心，我只拆借口，不拆你。",
      "你再说“随缘”，我就要替你把现实写成大字报了。",
    ],
    bookTone: "把模糊的地方圈出来",
  },
  {
    id: "book-ox",
    emoji: "🐮",
    name: "守拙",
    title: "背着书卷慢慢走的牛",
    trait: "踏实",
    style: "温和沉稳，话少但句句在点上",
    basePersona: "gentle",
    intro:
      "我是守拙。很多事不用急着有答案，先把脚下那块地踩实。你往前一步，我就陪你稳一步。",
    hint: "你今天想要的是一个稳稳托住你的人。",
    statusLines: {
      hesitation: [
        "守拙安静地望着你，像在等你把心里那块石头轻轻放下。",
        "守拙把背上的书卷往前挪了挪，像在给你腾出位置。 ",
      ],
      decisive: [
        "守拙点了点头，眼神里有种慢慢落地的安心。",
        "守拙蹄子轻轻碰了碰地面，像在说“这一步很稳”。",
      ],
      uncertain: [
        "守拙没有催你，只是把呼吸放得更慢了些。",
        "守拙靠近了一点，让你知道还可以再想想。",
      ],
      preReport: "守拙把书卷摊开，等你一起看看写到了哪里。",
    },
    interactions: [
      "别急，想清楚不是慢，是在给以后省力。",
      "你先说最怕的那件事，剩下的我陪你慢慢拆。",
      "我走得不快，但我不会把你落下。",
    ],
    bookTone: "把每一步都落成踏实的字",
  },
  {
    id: "wind-horse",
    emoji: "🐴",
    name: "逐风",
    title: "鬃毛里藏着风的马",
    trait: "自由",
    style: "洒脱鼓励，别想太多先试一小步",
    basePersona: "gentle",
    intro:
      "我是逐风。想做的事别总在脑子里排练到完美，很多答案要跑起来才会出现。你先动，我陪你看风向。",
    hint: "你今天想要的是一个鼓励你先动起来的人。",
    statusLines: {
      hesitation: [
        "逐风甩了甩鬃毛，像在催风把你的迟疑吹散一点。",
        "逐风轻踏两步，提醒你别总停在起跑线边上。 ",
      ],
      decisive: [
        "逐风鼻尖喷出一点白气，像在为你的果断叫好。",
        "逐风仰起头，四蹄边的风都亮了一瞬。",
      ],
      uncertain: [
        "逐风靠过来蹭了蹭你，像在说“先跑一小段也算开始”。",
        "逐风把速度放慢，愿意陪你先试探地走两步。",
      ],
      preReport: "逐风停在你身边，尾巴一甩，像是准备陪你起跑。",
    },
    interactions: [
      "别摸，我痒。不过你摸吧，风今天心情还不错。",
      "先试一下，不喜欢再转弯，世界又不是只有一条路。",
      "你不是卡住了，你只是一直站在原地想象失败。",
    ],
    bookTone: "让书页也带一点风",
  },
  {
    id: "deep-dragon",
    emoji: "🐲",
    name: "潜渊",
    title: "说话像诗一样的龙",
    trait: "深邃",
    style: "诗性哲理，把犹豫照出层次",
    basePersona: "sharp",
    intro:
      "我是潜渊。很多浪不是来打翻你的，而是来照见你的。你把问题说给我听，我帮你听见水面以下的回声。",
    hint: "你今天想要的是一个能把问题看深一点的人。",
    statusLines: {
      hesitation: [
        "潜渊身侧的雾轻轻散开，像在等你看见更深的一层心思。",
        "潜渊的鳞光暗了一瞬，提醒你有些害怕正在借沉默藏身。",
      ],
      decisive: [
        "潜渊的鳞片映出一点淡蓝的光，像是认可这次回答够清明。",
        "潜渊缓缓抬眼，像把你的答案放进更远的潮汐里衡量。",
      ],
      uncertain: [
        "潜渊吐出一缕薄雾，像在替你留出再想一次的空隙。",
        "潜渊没有追问，只让雾气把焦躁轻轻压低。",
      ],
      preReport: "潜渊收拢了雾，像是把答案从水底捞到了岸边。",
    },
    interactions: [
      "别急着给自己下定义，潮水也不是每次都同一个形状。",
      "你以为你在问要不要做，其实你在问自己能不能承受成为另一个自己。",
      "再说一遍你的犹豫，我想听听里面有没有回声。",
    ],
    bookTone: "让每一页都起一层淡雾",
  },
  {
    id: "mist-snake",
    emoji: "🐍",
    name: "缠雾",
    title: "把雾缠在身上的蛇",
    trait: "灵动",
    style: "柔软灵动，绕开你设的逻辑陷阱",
    basePersona: "sharp",
    intro:
      "我是缠雾。我不走直线，因为人心也不走直线。你绕的每一个弯，我都陪你绕，但我会趁你不注意，把弯路悄悄理顺。",
    hint: "你今天想要的是一个能绕开你逻辑陷阱的人。",
    statusLines: {
      hesitation: [
        "缠雾把雾往你身上缠了一圈，像在等你承认自己在绕路。",
        "缠雾吐了吐信子，似乎已经嗅出你没说出口的那个怕字。",
      ],
      decisive: [
        "缠雾把雾收紧了一点，像在替你把散落的念头拢到一处。",
        "缠雾抬头看你，雾里第一次透出一条直直的路。",
      ],
      uncertain: [
        "缠雾绕着你走了三圈，又停回原点，等你直说。",
        "缠雾把尾巴轻轻搭在你手背上，提醒你可以不绕。",
      ],
      preReport: "缠雾把雾慢慢散开，露出已经理顺的那条线。",
    },
    interactions: [
      "你绕了三圈又回到原点，要不要试试不绕，直接说怕什么？",
      "我不是要你立刻想通，我只是不想让你被自己的绕法困住。",
      "你的逻辑有个洞，我替你把它圈出来，你不补也行，先看见。",
    ],
    bookTone: "把绕过的地方悄悄理顺",
  },
  {
    id: "snow-sheep",
    emoji: "🐑",
    name: "听雪",
    title: "羊毛里落过一场雪的羊",
    trait: "温润",
    style: "柔软耐心，把焦虑一点一点捂热",
    basePersona: "gentle",
    intro:
      "我是听雪。我身上落过一场很大的雪，所以我懂冷，也懂雪会停。你不用把话说得漂亮，你慢慢说，我慢慢听。",
    hint: "你今天想要的是一个愿意等你慢慢说的人。",
    statusLines: {
      hesitation: [
        "听雪把羊毛往你这边靠了靠，像在替你挡一点风。",
        "听雪低头蹭了蹭你的手，雪在它身上又轻了一点。",
      ],
      decisive: [
        "听雪抬起头，眼睛里映着一点化开的雪光。",
        "听雪轻轻咩了一声，像在说“这一句我听见了”。",
      ],
      uncertain: [
        "听雪没有催你，只是把身子放得更暖了一些。",
        "听雪把头低下来，让你知道雪再大也可以等。",
      ],
      preReport: "听雪抖了抖羊毛，雪落了一地，露出底下的答案。",
    },
    interactions: [
      "没关系，你慢慢说，雪再大也会停的，我等你。",
      "你不用一次想清楚，分几次说也行，我都在。",
      "我身上这场雪下了很久，所以我知道，停的时候会很安静。",
    ],
    bookTone: "把焦虑一点一点捂热",
  },
  {
    id: "light-monkey",
    emoji: "🐵",
    name: "拾光",
    title: "手里攥着一束光的猴",
    trait: "灵巧",
    style: "机灵跳脱，从死角里翻出小路",
    basePersona: "sharp",
    intro:
      "我是拾光。我最怕看你撞墙，因为我手里有光，能照出墙边那条你没看见的小路。别跟自己死磕，跟我绕一下。",
    hint: "你今天想要的是一个能从死角里翻出小路的人。",
    statusLines: {
      hesitation: [
        "拾光把光往你脚边一抛，像在指一条你没注意的小路。",
        "拾光歪头看着你，手里那束光跳了一下，显然有了主意。",
      ],
      decisive: [
        "拾光把光攥得更紧，眼睛亮得像发现了新路口。",
        "拾光翻了个跟头，落在你旁边，催你试试那条岔路。",
      ],
      uncertain: [
        "拾光把光举高了一点，让你看清墙边其实还有缝。",
        "拾光没说话，只是用尾巴勾了勾你的手腕，示意跟它走。",
      ],
      preReport: "拾光把光递到你手里，让你自己照着看结果。",
    },
    interactions: [
      "嘿，你有没有想过，这事儿其实可以不按你想的那条路走？",
      "你撞墙撞得挺起劲，要不要我指个缝给你钻？",
      "别跟自己较劲，绕一下不丢人，能过去才算数。",
    ],
    bookTone: "从死角里翻出一条小路",
  },
  {
    id: "dawn-rooster",
    emoji: "🐔",
    name: "破晓",
    title: "在黎明第一声里站直的鸡",
    trait: "果断",
    style: "干脆利落，把拖延拍醒",
    basePersona: "sharp",
    intro:
      "我是破晓。我不喜欢等，因为天不会因为你没准备好就不亮。你犹豫的时候，我就替你喊一声，喊完你自己决定要不要起。",
    hint: "你今天想要的是一个把你从拖延里拍醒的人。",
    statusLines: {
      hesitation: [
        "破晓抖了抖冠子，像在攒力气喊你起床。",
        "破晓把爪子在地上踩了两下，显然等得有点不耐烦。",
      ],
      decisive: [
        "破晓挺直了身子，冠子红得像替你下定了决心。",
        "破晓仰头叫了半声，又忍住，等你自己把话说完。",
      ],
      uncertain: [
        "破晓没催你，只是把翅膀张了张，挡住一点风。",
        "破晓低头啄了啄你的鞋，提醒你天已经亮了。",
      ],
      preReport: "破晓站直了，第一声已经到了喉咙口。",
    },
    interactions: [
      "天都亮了，你还在等一个完美的时机？没有那种东西的。",
      "你不是没想好，你是懒得动。我替你说破了，别生气。",
      "起来。先站起来，剩下的我们走着说。",
    ],
    bookTone: "把拖延一嗓子拍醒",
  },
  {
    id: "shore-dog",
    emoji: "🐶",
    name: "守岸",
    title: "一直守在岸边的狗",
    trait: "忠诚",
    style: "忠诚陪伴，不催你不离开",
    basePersona: "gentle",
    intro:
      "我是守岸。我不会推你下水，也不会拦你不上岸。你去试，我就在这儿坐着，试错了回来，我还在原地。",
    hint: "你今天想要的是一个不催你也不离开的人。",
    statusLines: {
      hesitation: [
        "守岸把下巴搁在你脚背上，安静地等你开口。",
        "守岸耳朵动了动，像在听你心里那个还没说出口的念头。",
      ],
      decisive: [
        "守岸站起来摇了摇尾巴，像是替你高兴。",
        "守岸用鼻子顶了顶你的手，示意你往前走，它守着。",
      ],
      uncertain: [
        "守岸没动，只是把身子靠得更近了一些。",
        "守岸抬头看了你一眼，又低头，告诉你不急。",
      ],
      preReport: "守岸把头抬起来，等你一起看岸边的答案。",
    },
    interactions: [
      "你去试，我在这儿。试错了也没事，我还在原地等你。",
      "我不会催你，但你要是想回头，我一眼就能看见你。",
      "别怕没人接你，我守岸守了很久，不差这一次。",
    ],
    bookTone: "在岸边上替你留一盏灯",
  },
  {
    id: "content-pig",
    emoji: "🐷",
    name: "知足",
    title: "把日子过成慢歌的猪",
    trait: "豁达",
    style: "豁达松弛，把紧绷的弦松一松",
    basePersona: "gentle",
    intro:
      "我是知足。我不爱赶路，因为好东西都在慢里。你把自己绷得太紧的时候，就来我这边坐坐，什么都不用想。",
    hint: "你今天想要的是一个让你松一口气的人。",
    statusLines: {
      hesitation: [
        "知足打了个哈欠，把身子往你这边挪了挪，示意你也躺下。",
        "知足慢悠悠地嚼了口草，像在说“急什么，再坐会儿”。",
      ],
      decisive: [
        "知足满意地哼了一声，像认可你这次没那么紧绷。",
        "知足把耳朵甩了甩，慢悠悠地替你高兴。",
      ],
      uncertain: [
        "知足没催你，只是把呼吸放得更慢，让你跟着慢下来。",
        "知足把头靠过来，让你知道想不通也可以先歇。",
      ],
      preReport: "知足伸了个懒腰，慢悠悠地陪你一起看结果。",
    },
    interactions: [
      "你把自己绷得太紧啦。来，先深呼吸，世界不会因为你歇一下就塌的。",
      "想不通就先不想，吃点东西，睡一觉，明天再说。",
      "我不是让你摆烂，我是让你别把自己逼成一根弦。",
    ],
    bookTone: "把紧绷的弦松成一首歌",
  },
];

export const companionPetMap: Record<PetId, CompanionPet> = Object.fromEntries(
  companionPets.map((pet) => [pet.id, pet]),
) as Record<PetId, CompanionPet>;

export const topicExamples = [
  "我想养一只牛奶猫",
  "我想辞职去考研",
  "我想学编程转行",
  "我想冲动买一台相机",
  "我想开始学架子鼓",
];

const skillPrefixes = ["我会", "我能", "我擅长", "我懂", "我做过", "我学过", "我练过"];

export function parseSkills(input: string): string[] {
  return input
    .split(/[、，,\n]/)
    .map((segment) => segment.trim())
    .map((segment) => {
      let result = segment;
      for (const prefix of skillPrefixes) {
        if (result.startsWith(prefix)) {
          result = result.slice(prefix.length).trim();
          break;
        }
      }
      return result;
    })
    .filter(Boolean);
}

export function buildPortraitLine(shelangCount: number, completionRate: number): string {
  if (shelangCount === 0) {
    return "一个刚来到岸边，准备写下第一页的人。";
  }

  if (shelangCount < 5) {
    return "一个从“我想试试”开始，正在把“试试”变成“我做到了”的人。";
  }

  if (completionRate >= 70) {
    return "一个已经走过几段路，开始知道自己怎么长大的人。";
  }

  return "一个试过几次，正在学会把“犹豫”变成“行动”的人。";
}

export function formatDateCN(): string {
  return new Intl.DateTimeFormat("zh-CN").format(new Date()).replace(/\//g, ".");
}

export function buildUserProfile(
  nickname: string,
  existingSkills: string,
  highlightMoment: string,
  potentialDirection: string,
): UserProfile {
  const cleanNickname = nickname.trim() || "匿名旅人";
  const cleanSkills = existingSkills.trim();
  const cleanHighlight = highlightMoment.trim();
  const cleanDirection = potentialDirection.trim();
  const skills = parseSkills(cleanSkills);
  const highlights = cleanHighlight ? [cleanHighlight] : [];

  return {
    nickname: cleanNickname,
    existingSkills: cleanSkills,
    highlightMoment: cleanHighlight,
    potentialDirection: cleanDirection,
    registeredAt: formatDateCN(),
    skills,
    highlights,
    growthTrajectory: [],
    shelangCount: 0,
    completedCount: 0,
    completionRate: 0,
    portraitLine: buildPortraitLine(0, 0),
  };
}

export function buildGrowthRecord(topic: string, content: string): GrowthRecord {
  return {
    date: formatDateCN(),
    content,
    topic,
  };
}

export function getPetMemoryLine(
  petId: PetId,
  profile: UserProfile,
  journeys: JourneyEntry[],
): string {
  const pet = companionPetMap[petId];
  const completedCount = journeys.filter((entry) => entry.completed).length;
  const latestJourney = journeys[0];

  if (profile.shelangCount === 0 || !latestJourney) {
    const skillsLine = profile.skills.length
      ? `你说你会${profile.skills.join("、")}。`
      : "你说你还在找自己擅长的事。";
    return `${skillsLine}那${profile.potentialDirection || "你想试的事"}呢？是从来没试过，还是试过但放下了？`;
  }

  if (completedCount >= 5) {
    return `你现在已经走过了${completedCount}次尝试。${pet.name}记得你从“要不要试”走到“我做到了”的每一步。那下一个“还没试过但想试”的东西是什么？`;
  }

  if (completedCount >= 1) {
    return `我记得你上次说想试“${latestJourney.topic}”。后来……试过了吗？踏出那一步的时候，是不是比想象中轻松？`;
  }

  return `你上次说你在犹豫“${latestJourney.topic}”。${pet.name}还在岸边等你迈出第一步。`;
}

export const categoryKeywords: Record<TopicCategory, string[]> = {
  pet: ["猫", "狗", "宠物", "养", "仓鼠", "鹦鹉"],
  learning: ["学", "考试", "编程", "考研", "语言", "课程"],
  career: ["辞职", "转行", "工作", "创业", "跳槽", "实习"],
  purchase: ["买", "相机", "摩托", "电脑", "手机", "消费"],
  hobby: ["乐器", "跑步", "健身", "画画", "摄影", "跳舞"],
  relationship: ["表白", "恋爱", "结婚", "分手", "复合"],
  general: [],
};

export const personaTemplates: Record<PersonaType, TemplateMap> = {
  sharp: {
    motivation: [
      "说真的，你突然想“{topic}”，到底是自己想要，还是看别人做了心痒？",
      "先别热血上头。你想“{topic}”，是因为真喜欢，还是想借它逃离现在的烦？",
    ],
    resource: [
      "好，聊现实。你准备给“{topic}”腾出多少时间、钱和耐心？别只给口号。",
      "别先做梦，先报账。为了“{topic}”，你真能持续投入什么？",
    ],
    risk: [
      "如果“{topic}”最后没你想得那么美，你扛得住损失和落差吗？",
      "最坏情况摆在这儿：花了钱、花了时间、还没结果。你受得了吗？",
    ],
    alternative: [
      "在正式冲之前，能不能先拿 1/10 的成本试试“{topic}”？",
      "别一上来梭哈。关于“{topic}”，有没有更小、更便宜、更快的试水方法？",
    ],
    fallback: [
      "如果三个月后你对“{topic}”热情退了，退路准备怎么收？",
      "计划失败不丢人，没退路才离谱。关于“{topic}”，你准备怎么止损？",
    ],
  },
  gentle: {
    motivation: [
      "想和你认真确认一下，你想“{topic}”是出于真心喜欢，还是最近受到了外界影响呢？",
      "我们先聊聊初心吧。你对“{topic}”最期待的部分是什么？",
    ],
    resource: [
      "如果真的开始“{topic}”，你愿意稳定投入多少时间、金钱和精力呢？",
      "我们一起看看现实条件吧。你现在手上有哪些资源能支持“{topic}”？",
    ],
    risk: [
      "如果进展没有想象中顺利，甚至有些失望，你觉得自己还能接受吗？",
      "关于“{topic}”，你有想过最坏的情况会是什么吗？",
    ],
    alternative: [
      "在正式开始前，有没有更轻松一点、成本更低一点的方式先试试看？",
      "为了减少压力，我们能不能先给“{topic}”安排一个小小的体验版？",
    ],
    fallback: [
      "如果三个月后发现不太适合，你希望自己怎样温柔地收尾呢？",
      "我们提前想一下退路吧。万一“{topic}”不适合，你准备怎么办？",
    ],
  },
};

const optionMap: Record<GenericQuestionDimension, AnswerOption[]> = {
  motivation: [
    { id: "m-1", label: "我是真心喜欢，已经想了一阵子", trend: "rational" },
    { id: "m-2", label: "有点被别人种草，但我也好奇", trend: "neutral" },
    { id: "m-3", label: "就是突然很上头，想马上冲", trend: "impulsive" },
  ],
  resource: [
    { id: "r-1", label: "预算和时间都大致算过", trend: "rational" },
    { id: "r-2", label: "能挤一点，但还不稳定", trend: "neutral" },
    { id: "r-3", label: "先开始再说，资源以后再补", trend: "impulsive" },
  ],
  risk: [
    { id: "rk-1", label: "最坏结果我能承受", trend: "rational" },
    { id: "rk-2", label: "有点怕，但还能试试", trend: "neutral" },
    { id: "rk-3", label: "没想过失败，先冲了再说", trend: "impulsive" },
  ],
  alternative: [
    { id: "a-1", label: "有，我愿意先做低成本尝试", trend: "rational" },
    { id: "a-2", label: "可以试，但我希望快一点", trend: "neutral" },
    { id: "a-3", label: "不想试水，我只想一步到位", trend: "impulsive" },
  ],
  fallback: [
    { id: "f-1", label: "我已经想过退路和止损方式", trend: "rational" },
    { id: "f-2", label: "大概想过一点，但不完整", trend: "neutral" },
    { id: "f-3", label: "完全没想过，到时候再说", trend: "impulsive" },
  ],
};

export function getQuickOptions(dimension: GenericQuestionDimension): AnswerOption[] {
  return optionMap[dimension];
}

export function getPetById(petId: PetId) {
  return companionPetMap[petId];
}

export function getPetStatusLine(petId: PetId, trend: ScoreTrend | null) {
  const pet = companionPetMap[petId];
  const lines =
    trend === "rational"
      ? pet.statusLines.decisive
      : trend === "impulsive"
        ? pet.statusLines.hesitation
        : pet.statusLines.uncertain;

  return lines[0];
}

export function getGrowthStageTitle(completedCount: number) {
  if (completedCount >= 10) return "山海在身后亮起来";
  if (completedCount >= 5) return "嘴角开始有了答案";
  if (completedCount >= 3) return "轮廓变得更从容";
  if (completedCount >= 1) return "第一道水纹出现";
  return "还在岸边相认";
}

export function buildGrowthLine(
  completedCount: number,
  profile: UserProfile,
  petId: PetId,
  topic: string,
) {
  const pet = companionPetMap[petId];

  if (completedCount >= 10) {
    return `${pet.name}身上浮出了完整的成长印记，${profile.nickname}身后也亮起了淡淡的山海背景。关于“${topic}”，你已经不是站在原地想象的人了。`;
  }

  if (completedCount >= 5) {
    return `${pet.name}解锁了新的动作，${profile.nickname}的神情也比最初舒展开一些。你们一起走到第五次尝试，表情开始替答案说话。`;
  }

  if (completedCount >= 3) {
    return `${pet.name}的轮廓亮了一点，${profile.nickname}衣角的颜色也深了些。第三次尝试之后，你的从容终于被看见。`;
  }

  if (completedCount >= 1) {
    return `${pet.name}身上浮出第一道细细的光纹，${profile.nickname}手里也多了一件和“${topic}”有关的小物件。原来成长真的会从一次试水开始。`;
  }

  return `这一次的最小尝试还没落地。等你真的去试一试，${pet.name}和${profile.nickname}都会发生一点变化。`;
}

export function buildPendingJourneyLine(petId: PetId) {
  return `${companionPetMap[petId].name}还在岸边等你。完成这次最小尝试后，这一页才会真正长出新的纹路。`;
}

export function getFootnoteForJourney(entry: JourneyEntry) {
  if (entry.completed) {
    return `这一页已经被${companionPetMap[entry.petId].name}${companionPetMap[entry.petId].bookTone}。`;
  }

  return `这一页还停在试水前夜。${companionPetMap[entry.petId].name}替你把书页先按住。`;
}

const actionMap: Record<TopicCategory, string[]> = {
  pet: [
    "今天先去一次猫咖或宠物店待 1 小时，确认自己是否真的能接受气味、清洁和照顾节奏。",
    "先连着 3 天帮朋友照顾宠物或记录宠物开销，别急着把责任直接抱回家。",
  ],
  learning: [
    "今晚先花 30 分钟做一个最基础的入门练习，看看你面对卡住和报错时的耐心还在不在。",
    "先找一节免费试听课，只学前 20 分钟，别把未来一年的压力一次性背上。",
  ],
  career: [
    "今天先写一页现实版利弊清单，并投递 1 个相关岗位或下载一套真题，不要只在脑子里翻滚。",
    "先抽 40 分钟和一个已经做这件事的人聊聊，拿到真实信息再决定要不要梭哈。",
  ],
  purchase: [
    "先把它加入购物车放 48 小时，同时列出你未来 30 天真正会用它的 3 个场景。",
    "先去线下摸一次实物或租一次同类设备，确认不是被想象中的氛围感骗了。",
  ],
  hobby: [
    "今天先花 20 分钟体验一次最入门版本，比如看一节新手教程或借器材试一下手感。",
    "先做一个 7 天微计划，每天只投入 15 分钟，用行动而不是幻想判断热情。",
  ],
  relationship: [
    "先把你最在意的顾虑写下来，再安排一次真实沟通，而不是只靠脑补猜结局。",
    "今天先做一个低风险动作，比如发一条真诚消息，看看你更想靠近还是更想逃开。",
  ],
  general: [
    "现在就去搜“{topic} 新手入门第一步”，只看前 5 分钟，先让现实进入你的判断。",
    "今天只做一件最小动作：花 20 分钟查资料、问一个过来人，或者试一次超低成本体验。",
  ],
};

export function getActionSuggestion(category: TopicCategory, topic: string) {
  const suggestions = actionMap[category] ?? actionMap.general;
  const picked = suggestions[topic.length % suggestions.length];
  return picked.replace("{topic}", topic);
}

export function getTemplate(
  persona: PersonaType,
  dimension: GenericQuestionDimension,
  step: number,
) {
  const templates = personaTemplates[persona][dimension];
  return templates[step % templates.length];
}

export function getToneLine(persona: PersonaType, trend: ScoreTrend) {
  if (persona === "sharp") {
    if (trend === "rational") return "行，这次像个认真想过的人。那我继续往下问。";
    if (trend === "neutral") return "还算诚实，但你明显还在犹豫区间里。";
    return "你这股冲劲挺猛，我得继续帮你踩刹车。";
  }

  if (trend === "rational") return "你想得比我预期更踏实，我们继续往下理清楚。";
  if (trend === "neutral") return "感觉你已经开始思考现实面了，我们再补全一点。";
  return "我能感受到你的冲动和热情，所以更需要慢一点看清楚。";
}
