import { createServer } from "node:http";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import { join, extname, normalize, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { repo } from "./db.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const DIST_DIR = join(__dirname, "..", "dist");
const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
  ".map": "application/json; charset=utf-8",
};

async function serveStatic(url, response) {
  const pathname = decodeURIComponent(url.pathname);
  let filePath = join(DIST_DIR, pathname === "/" ? "index.html" : pathname);
  filePath = normalize(filePath);
  if (!filePath.startsWith(DIST_DIR + sep) && filePath !== DIST_DIR) {
    sendError(response, 403, "禁止访问。");
    return;
  }
  try {
    const stats = await stat(filePath);
    if (stats.isDirectory()) {
      filePath = join(filePath, "index.html");
    }
    const data = await readFile(filePath);
    response.writeHead(200, {
      "Content-Type": MIME_TYPES[extname(filePath).toLowerCase()] || "application/octet-stream",
      "Access-Control-Allow-Origin": "*",
    });
    response.end(data);
  } catch {
    try {
      const indexData = await readFile(join(DIST_DIR, "index.html"));
      response.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
      });
      response.end(indexData);
    } catch {
      sendError(response, 404, "静态资源不存在。");
    }
  }
}
import {
  generateQuestion,
  generateReportText,
  generateProcessAnalysis,
  TOTAL_QUESTIONS as AI_TOTAL_QUESTIONS,
} from "./aiQuestionGenerator.js";

const DEFAULT_PORT = Number(process.env.PORT || 3001);
const DEFAULT_LOGIN_NAME = "旅人";
const DEFAULT_PET_ID = "moon-rabbit";
const DEFAULT_PERSONA = "gentle";

const VALID_PET_IDS = new Set([
  "moon-rabbit",
  "cloud-tiger",
  "ink-mouse",
  "book-ox",
  "wind-horse",
  "deep-dragon",
  "mist-snake",
  "snow-sheep",
  "light-monkey",
  "dawn-rooster",
  "shore-dog",
  "content-pig",
]);

const VALID_PERSONAS = new Set(["gentle", "sharp"]);
const VALID_TRENDS = new Set(["rational", "neutral", "impulsive"]);
const VALID_STANCES = new Set(["topic", "mixed", "alternative"]);

const PET_NAME_MAP = {
  "moon-rabbit": "衔月",
  "cloud-tiger": "破云",
  "ink-mouse": "知微",
  "book-ox": "守拙",
  "wind-horse": "逐风",
  "deep-dragon": "潜渊",
  "mist-snake": "缠雾",
  "snow-sheep": "听雪",
  "light-monkey": "拾光",
  "dawn-rooster": "破晓",
  "shore-dog": "守岸",
  "content-pig": "知足",
};

const CATEGORY_KEYWORDS = {
  pet: ["猫", "狗", "宠物", "养", "仓鼠", "鹦鹉"],
  learning: ["学", "考试", "编程", "考研", "语言", "课程"],
  career: ["辞职", "转行", "工作", "创业", "跳槽", "实习"],
  purchase: ["买", "相机", "摩托", "电脑", "手机", "消费"],
  hobby: ["乐器", "跑步", "健身", "画画", "摄影", "跳舞"],
  relationship: ["表白", "恋爱", "结婚", "分手", "复合"],
};

const CATEGORY_LABELS = {
  pet: "养宠决定",
  learning: "学习成长",
  career: "职业选择",
  purchase: "消费评估",
  hobby: "兴趣尝试",
  relationship: "关系课题",
  general: "通用判断",
};

const ACTION_MAP = {
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

const trendWeights = {
  rational: 0,
  neutral: 0.5,
  impulsive: 1,
};

const stanceWeights = {
  topic: 0,
  mixed: 0.5,
  alternative: 1,
};

function normalizeLoginName(loginName) {
  return String(loginName || "").trim() || DEFAULT_LOGIN_NAME;
}

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  if (!stored) return false;
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const testHash = scryptSync(password, salt, 64);
  return timingSafeEqual(Buffer.from(hash, "hex"), testHash);
}

const AUTO_NAME_PREFIXES = ["旅人", "浪客", "潮音", "拾光", "逐风", "衔月"];
const AUTO_NAME_CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";

function generateAutoLoginName() {
  const prefix = AUTO_NAME_PREFIXES[Math.floor(Math.random() * AUTO_NAME_PREFIXES.length)];
  let suffix = "";
  for (let i = 0; i < 4; i += 1) {
    suffix += AUTO_NAME_CHARS[Math.floor(Math.random() * AUTO_NAME_CHARS.length)];
  }
  return `${prefix}${suffix}`;
}

function generateAutoPassword() {
  return randomBytes(6).toString("hex");
}

function normalizePetId(petId) {
  return VALID_PET_IDS.has(petId) ? petId : DEFAULT_PET_ID;
}

function normalizePersona(persona) {
  return VALID_PERSONAS.has(persona) ? persona : DEFAULT_PERSONA;
}

function ensureString(value, fieldName) {
  const nextValue = String(value || "").trim();

  if (!nextValue) {
    throw new Error(`${fieldName} 不能为空。`);
  }

  return nextValue;
}

function getTopicCategory(topic) {
  const matchedCategory = Object.entries(CATEGORY_KEYWORDS).find(([, keywords]) =>
    keywords.some((keyword) => topic.includes(keyword)),
  );

  return matchedCategory?.[0] ?? "general";
}

function buildUserProfile(nickname, existingSkills, highlightMoment, potentialDirection, petId, journeys = []) {
  const cleanNickname = nickname.trim() || "匿名旅人";
  const cleanSkills = existingSkills.trim();
  const cleanHighlight = highlightMoment.trim();
  const cleanDirection = potentialDirection.trim();
  const petName = PET_NAME_MAP[petId] ?? PET_NAME_MAP[DEFAULT_PET_ID];

  const skills = cleanSkills
    ? cleanSkills
        .split(/[、,，\n]/)
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
  const highlights = cleanHighlight ? [cleanHighlight] : [];

  const shelangCount = journeys.length;
  const completedCount = journeys.filter((j) => j.completed).length;
  const completionRate = shelangCount > 0 ? Math.round((completedCount / shelangCount) * 100) : 0;

  const skillsText = skills.length ? skills.join("、") : "尚未命名的能力";
  const highlightText = cleanHighlight || "那些还没说出口的高光";
  const directionText = cleanDirection || "下一步该往哪走";

  return {
    nickname: cleanNickname,
    existingSkills: cleanSkills,
    highlightMoment: cleanHighlight,
    potentialDirection: cleanDirection,
    registeredAt: formatJourneyDate(),
    skills,
    highlights,
    growthTrajectory: [],
    shelangCount,
    completedCount,
    completionRate,
    portraitLine: `${cleanNickname}带着${skillsText}，记得${highlightText}，正想着${directionText}。${petName}安静地陪在一旁，替你守住还没说出口的那部分心事。`,
  };
}

function buildScenarioSummary(topic, answers, discourageScore) {
  const rationalCount = answers.filter((answer) => answer.trend === "rational").length;
  const impulsiveCount = answers.filter((answer) => answer.trend === "impulsive").length;
  const alternativeCount = answers.filter((answer) => answer.stance === "alternative").length;

  const rhythmLine =
    rationalCount >= 3
      ? "你的回答明显偏向现实评估，说明这次不是纯靠情绪在做决定。"
      : impulsiveCount >= 2
        ? "这次回答里冲动成分偏高，建议先把速度降下来，再看长期影响。"
        : "你的想法介于热情和谨慎之间，适合用一个小范围试水来换取确定感。";

  const stanceLine =
    alternativeCount >= 2
      ? "你已经在主动比较替代路径，这会让决定更稳。"
      : "目前你的关注点更集中在目标本身，记得同时给自己准备备用方案。";

  const scoreLine =
    discourageScore >= 70
      ? `当前阻力值偏高，关于“${topic}”更适合先补条件再行动。`
      : discourageScore >= 40
        ? `当前阻力值处于试水区间，关于“${topic}”适合先做一个低成本尝试。`
        : `当前阻力值较低，说明你对“${topic}”已经具备较好的起步条件。`;

  return [rhythmLine, stanceLine, scoreLine];
}

function buildInsightLine(answer) {
  const trendLabel =
    answer.trend === "rational" ? "偏理性" : answer.trend === "impulsive" ? "偏冲动" : "还在摇摆";
  const stanceLabel =
    answer.stance === "topic" ? "更贴近目标" : answer.stance === "alternative" ? "更在意替代方案" : "目标与退路都在考虑";

  return `你在“${answer.title}”上的回答${trendLabel}，并且${stanceLabel}。`;
}

function getActionSuggestion(topic) {
  const category = getTopicCategory(topic);
  const suggestions = ACTION_MAP[category] ?? ACTION_MAP.general;
  const picked = suggestions[topic.length % suggestions.length];
  return picked.replace("{topic}", topic);
}

async function buildReport(topic, persona, answers) {
  const totalScore = answers.reduce((sum, answer) => {
    const cautionScore = trendWeights[answer.trend] ?? 0.5;
    const mismatchScore = stanceWeights[answer.stance] ?? 0.5;
    return sum + cautionScore * 0.55 + mismatchScore * 0.45;
  }, 0);
  const discourageScore = Math.round((totalScore / Math.max(answers.length, 1)) * 100);
  const verdict = discourageScore >= 70 ? "wait" : discourageScore >= 40 ? "try-first" : "go";

  const fallbackSummary = buildScenarioSummary(topic, answers, discourageScore);
  const fallbackInsightLines = answers.map((answer) => buildInsightLine(answer));
  const fallbackAction = getActionSuggestion(topic);

  const fallback = {
    summary: fallbackSummary,
    dimensionInsights: fallbackInsightLines,
    actionSuggestion: fallbackAction,
  };

  const ai = await generateReportText(
    topic,
    persona,
    answers,
    discourageScore,
    verdict,
    fallback,
  );

  // 保证 dimensionInsights 长度与 answers 对齐，缺位用兜底补
  const dimensionInsights = answers.map((answer, idx) => ({
    dimension: answer.dimension,
    title: answer.title,
    stance: answer.stance,
    summary: ai.dimensionInsights[idx] ?? fallbackInsightLines[idx],
  }));

  return {
    topic,
    persona,
    scenarioLabel: CATEGORY_LABELS[getTopicCategory(topic)],
    discourageScore,
    verdict,
    summary: ai.summary.length ? ai.summary : fallbackSummary,
    dimensionInsights,
    actionSuggestion: ai.actionSuggestion || fallbackAction,
  };
}

function getGrowthStageTitle(completedCount) {
  if (completedCount >= 10) return "山海在身后亮起来";
  if (completedCount >= 5) return "嘴角开始有了答案";
  if (completedCount >= 3) return "轮廓变得更从容";
  if (completedCount >= 1) return "第一道水纹出现";
  return "还在岸边相认";
}

function buildGrowthLine(completedCount, profile, petId, topic) {
  const petName = PET_NAME_MAP[petId] ?? PET_NAME_MAP[DEFAULT_PET_ID];

  if (completedCount >= 10) {
    return `${petName}身上浮出了完整的成长印记，${profile.nickname}身后也亮起了淡淡的山海背景。关于“${topic}”，你已经不是站在原地想象的人了。`;
  }

  if (completedCount >= 5) {
    return `${petName}解锁了新的动作，${profile.nickname}的神情也比最初舒展开一些。你们一起走到第五次尝试，表情开始替答案说话。`;
  }

  if (completedCount >= 3) {
    return `${petName}的轮廓亮了一点，${profile.nickname}衣角的颜色也深了些。第三次尝试之后，你的从容终于被看见。`;
  }

  if (completedCount >= 1) {
    return `${petName}身上浮出第一道细细的光纹，${profile.nickname}手里也多了一件和“${topic}”有关的小物件。原来成长真的会从一次试水开始。`;
  }

  return `这一次的最小尝试还没落地。等你真的去试一试，${petName}和${profile.nickname}都会发生一点变化。`;
}

function buildPendingJourneyLine(petId) {
  const petName = PET_NAME_MAP[petId] ?? PET_NAME_MAP[DEFAULT_PET_ID];
  return `${petName}还在岸边等你。完成这次最小尝试后，这一页才会真正长出新的纹路。`;
}

function formatJourneyDate() {
  return new Intl.DateTimeFormat("zh-CN").format(new Date()).replace(/\//g, ".");
}

function syncJourneyFromSession(account, session, report) {
  const journeyId = `journey-${session.id}`;
  const existing = repo.getJourney(journeyId);

  const journey = {
    id: journeyId,
    loginName: account.loginName,
    sessionId: session.id,
    date: formatJourneyDate(),
    topic: report.topic,
    petId: session.petId,
    nickname: account.profile.nickname,
    discourageScore: report.discourageScore,
    verdict: report.verdict,
    actionSuggestion: report.actionSuggestion,
    completed: existing?.completed ?? false,
    reflection: existing?.reflection ?? "",
    stageTitle: existing?.stageTitle ?? "等待试水完成",
    growthLine: existing?.growthLine ?? buildPendingJourneyLine(session.petId),
    report,
    profileSnapshot: account.profile,
    followUps: existing?.followUps ?? [],
  };

  repo.upsertJourney(journey);
  repo.touchAccount(account.loginName);

  return repo.getJourney(journeyId);
}

async function completeJourney(loginName, journeyId, reflection = "") {
  const current = repo.getJourney(journeyId);

  if (!current) {
    throw new Error("未找到对应的成长记录。");
  }

  if (current.completed) {
    return current;
  }

  const nextCompletedCount = repo.countCompletedJourneys(loginName) + 1;
  const stageTitle = getGrowthStageTitle(nextCompletedCount);
  const growthLine = buildGrowthLine(
    nextCompletedCount,
    current.profileSnapshot,
    current.petId,
    current.topic,
  );

  const petName = PET_NAME_MAP[current.petId] ?? PET_NAME_MAP[DEFAULT_PET_ID];
  const processAnalysis = await generateProcessAnalysis(
    current.topic,
    petName,
    current.answers,
    current.discourageScore,
    current.verdict,
  );

  repo.completeJourney(
    journeyId,
    reflection,
    stageTitle,
    growthLine,
    JSON.stringify(processAnalysis),
  );
  repo.touchAccount(loginName);

  return repo.getJourney(journeyId);
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  response.end(JSON.stringify(payload));
}

function sendError(response, statusCode, message) {
  sendJson(response, statusCode, {
    ok: false,
    error: message,
  });
}

async function readJsonBody(request) {
  const chunks = [];

  for await (const chunk of request) {
    chunks.push(chunk);
  }

  if (!chunks.length) return {};

  const rawBody = Buffer.concat(chunks).toString("utf8");

  try {
    return JSON.parse(rawBody);
  } catch {
    throw new Error("请求体不是合法 JSON。");
  }
}

async function handleRequest(request, response) {
  if (request.method === "OPTIONS") {
    response.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    response.end();
    return;
  }

  const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
  const pathParts = url.pathname.split("/").filter(Boolean);

  if (request.method === "GET" && (url.pathname === "/logout" || url.pathname === "/clear")) {
    response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    response.end(`<!doctype html><html><head><meta charset="utf-8"><title>清除登录状态</title></head><body><p>正在清除登录状态...</p><script>localStorage.clear();location.href='/login';</script></body></html>`);
    return;
  }

  if (pathParts[0] !== "api") {
    await serveStatic(url, response);
    return;
  }

  try {
    if (request.method === "GET" && url.pathname === "/api/health") {
      sendJson(response, 200, {
        ok: true,
        service: "waveward-backend",
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/auth/login") {
      const body = await readJsonBody(request);
      const loginName = normalizeLoginName(body.loginName);
      const petId = normalizePetId(body.petId);
      const accountRow = repo.getAccountRow(loginName);

      if (!accountRow) {
        sendError(response, 404, "账号不存在，请先注册。");
        return;
      }

      if (!accountRow.password) {
        sendError(response, 403, "该账号尚未设置密码，请先注册或重新设置密码。");
        return;
      }

      if (!verifyPassword(String(body.password || ""), accountRow.password)) {
        sendError(response, 401, "账号或密码不正确。");
        return;
      }

      repo.updatePet(loginName, petId);
      sendJson(response, 200, {
        ok: true,
        account: repo.getAccount(loginName),
      });
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/auth/register") {
      const body = await readJsonBody(request);
      const loginName = normalizeLoginName(body.loginName);
      const petId = normalizePetId(body.petId);
      const password = String(body.password || "");

      if (password.length < 4) {
        sendError(response, 400, "密码至少需要 4 个字符。");
        return;
      }

      if (repo.accountExists(loginName)) {
        sendError(response, 409, "账号已存在，请直接登录或更换账号名。");
        return;
      }

      const hashedPassword = hashPassword(password);
      const account = repo.createAccountWithPassword(loginName, hashedPassword, petId);

      sendJson(response, 200, {
        ok: true,
        account,
      });
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/auth/auto-register") {
      const body = await readJsonBody(request);
      const petId = normalizePetId(body.petId);

      let loginName = generateAutoLoginName();
      let attempts = 0;
      while (repo.accountExists(loginName) && attempts < 10) {
        loginName = generateAutoLoginName();
        attempts += 1;
      }

      if (repo.accountExists(loginName)) {
        sendError(response, 409, "自动生成账号失败，请稍后再试。");
        return;
      }

      const generatedPassword = generateAutoPassword();
      const hashedPassword = hashPassword(generatedPassword);
      const account = repo.createAccountWithPassword(loginName, hashedPassword, petId);

      sendJson(response, 200, {
        ok: true,
        account,
        generatedPassword,
      });
      return;
    }

    if (
      request.method === "GET" &&
      pathParts.length === 3 &&
      pathParts[0] === "api" &&
      pathParts[1] === "accounts"
    ) {
      const loginName = normalizeLoginName(decodeURIComponent(pathParts[2]));
      const account = repo.getAccount(loginName);
      if (!account) {
        sendError(response, 404, "账号不存在。");
        return;
      }
      sendJson(response, 200, {
        ok: true,
        account,
      });
      return;
    }

    if (
      request.method === "POST" &&
      pathParts.length === 4 &&
      pathParts[0] === "api" &&
      pathParts[1] === "accounts" &&
      pathParts[3] === "pet"
    ) {
      const loginName = normalizeLoginName(decodeURIComponent(pathParts[2]));
      const body = await readJsonBody(request);
      const account = repo.updatePet(loginName, normalizePetId(body.petId));
      sendJson(response, 200, {
        ok: true,
        account,
      });
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/profiles") {
      const body = await readJsonBody(request);
      const loginName = normalizeLoginName(body.loginName);
      const petId = normalizePetId(body.petId);
      const nickname = ensureString(body.nickname, "nickname");
      const existingSkills = ensureString(body.existingSkills, "existingSkills");
      const highlightMoment = ensureString(body.highlightMoment, "highlightMoment");
      const potentialDirection = ensureString(body.potentialDirection, "potentialDirection");

      if (!repo.accountExists(loginName)) {
        sendError(response, 404, "账号不存在，请先登录或注册。");
        return;
      }

      const account = repo.getAccount(loginName);
      const profile = buildUserProfile(
        nickname,
        existingSkills,
        highlightMoment,
        potentialDirection,
        petId,
        account?.journeys ?? [],
      );
      repo.saveProfile(loginName, profile);
      repo.updatePet(loginName, petId);

      sendJson(response, 200, {
        ok: true,
        profile,
        account: repo.getAccount(loginName),
      });
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/sessions") {
      const body = await readJsonBody(request);
      const loginName = normalizeLoginName(body.loginName);
      const topic = ensureString(body.topic, "topic");
      const persona = normalizePersona(body.persona);
      const petId = normalizePetId(body.petId);
      const account = repo.getAccount(loginName);

      if (!account) {
        sendError(response, 404, "账号不存在，请先登录或注册。");
        return;
      }

      if (!account.profile) {
        throw new Error("请先创建角色画像，再开始话题。");
      }

      repo.updatePet(loginName, petId);
      const now = new Date().toISOString();
      const sessionId = Date.now();
      const session = {
        id: sessionId,
        loginName,
        topic,
        persona,
        petId,
        profileSnapshot: account.profile,
        answers: [],
        createdAt: now,
        updatedAt: now,
      };
      repo.createSession(session);
      repo.touchAccount(loginName);

      sendJson(response, 201, {
        ok: true,
        session: repo.getSession(sessionId),
        account: repo.getAccount(loginName),
      });
      return;
    }

    if (
      request.method === "GET" &&
      pathParts.length === 3 &&
      pathParts[0] === "api" &&
      pathParts[1] === "sessions"
    ) {
      const session = repo.getSession(pathParts[2]);

      if (!session) {
        sendError(response, 404, "未找到对应的会话。");
        return;
      }

      sendJson(response, 200, {
        ok: true,
        session,
      });
      return;
    }

    if (
      request.method === "POST" &&
      pathParts.length === 4 &&
      pathParts[0] === "api" &&
      pathParts[1] === "sessions" &&
      pathParts[3] === "answers"
    ) {
      const session = repo.getSession(pathParts[2]);

      if (!session) {
        sendError(response, 404, "未找到对应的会话。");
        return;
      }

      const body = await readJsonBody(request);
      const answer = {
        questionId: ensureString(body.questionId, "questionId"),
        dimension: ensureString(body.dimension, "dimension"),
        title: ensureString(body.title, "title"),
        prompt: ensureString(body.prompt, "prompt"),
        comparisonTarget: String(body.comparisonTarget || "").trim() || undefined,
        value: ensureString(body.value, "value"),
        trend: VALID_TRENDS.has(body.trend) ? body.trend : "neutral",
        stance: VALID_STANCES.has(body.stance) ? body.stance : "mixed",
      };

      repo.addAnswer(session.id, answer);
      repo.touchSession(session.id);

      const updatedSession = repo.getSession(session.id);
      const nextStep = updatedSession.answers.length;

      let nextQuestion = null;
      if (nextStep < AI_TOTAL_QUESTIONS) {
        nextQuestion = await generateQuestion(
          updatedSession.topic,
          nextStep,
          updatedSession.answers,
        );
      }

      sendJson(response, 200, {
        ok: true,
        answerCount: nextStep,
        session: updatedSession,
        nextQuestion,
      });
      return;
    }

    if (
      request.method === "GET" &&
      pathParts.length === 4 &&
      pathParts[0] === "api" &&
      pathParts[1] === "sessions" &&
      pathParts[3] === "questions"
    ) {
      const session = repo.getSession(pathParts[2]);

      if (!session) {
        sendError(response, 404, "未找到对应的会话。");
        return;
      }

      const step = session.answers.length;
      if (step >= AI_TOTAL_QUESTIONS) {
        sendJson(response, 200, {
          ok: true,
          question: null,
          step,
          total: AI_TOTAL_QUESTIONS,
        });
        return;
      }

      const question = await generateQuestion(session.topic, step, session.answers);

      sendJson(response, 200, {
        ok: true,
        question,
        step,
        total: AI_TOTAL_QUESTIONS,
      });
      return;
    }

    if (
      request.method === "POST" &&
      pathParts.length === 4 &&
      pathParts[0] === "api" &&
      pathParts[1] === "sessions" &&
      pathParts[3] === "report"
    ) {
      const session = repo.getSession(pathParts[2]);

      if (!session) {
        sendError(response, 404, "未找到对应的会话。");
        return;
      }

      const account = repo.getAccount(session.loginName);

      if (!account?.profile) {
        sendError(response, 400, "当前账号还没有角色画像。");
        return;
      }

      if (!session.answers.length) {
        sendError(response, 400, "至少提交一条回答后才能生成报告。");
        return;
      }

      const report = await buildReport(session.topic, session.persona, session.answers);
      const journey = syncJourneyFromSession(account, session, report);

      sendJson(response, 200, {
        ok: true,
        report,
        journey,
        account: repo.getAccount(session.loginName),
      });
      return;
    }

    if (
      request.method === "POST" &&
      pathParts.length === 4 &&
      pathParts[0] === "api" &&
      pathParts[1] === "journeys" &&
      pathParts[3] === "complete"
    ) {
      const body = await readJsonBody(request);
      const loginName = normalizeLoginName(body.loginName);
      const account = repo.getAccount(loginName);

      if (!account) {
        sendError(response, 404, "未找到对应账号。");
        return;
      }

      const journey = await completeJourney(loginName, pathParts[2], body.reflection);

      sendJson(response, 200, {
        ok: true,
        journey,
        account: repo.getAccount(loginName),
      });
      return;
    }

    if (
      request.method === "POST" &&
      pathParts.length === 4 &&
      pathParts[0] === "api" &&
      pathParts[1] === "journeys" &&
      pathParts[3] === "followups"
    ) {
      const body = await readJsonBody(request);
      const loginName = normalizeLoginName(body.loginName);
      const account = repo.getAccount(loginName);

      if (!account) {
        sendError(response, 404, "未找到对应账号。");
        return;
      }

      const journey = repo.getJourney(pathParts[2]);
      if (!journey) {
        sendError(response, 404, "未找到对应的成长记录。");
        return;
      }

      const followUp = {
        date: formatJourneyDate(),
        content: String(body.content || "").trim(),
        topic: journey.topic,
      };

      if (!followUp.content) {
        sendError(response, 400, "后续轨迹内容不能为空。");
        return;
      }

      const updated = repo.addFollowUp(pathParts[2], followUp);

      sendJson(response, 200, {
        ok: true,
        journey: updated,
        account: repo.getAccount(loginName),
      });
      return;
    }

    sendError(response, 404, "接口不存在。");
  } catch (error) {
    const message = error instanceof Error ? error.message : "服务器发生未知错误。";
    sendError(response, 400, message);
  }
}

const server = createServer((request, response) => {
  void handleRequest(request, response);
});

server.listen(DEFAULT_PORT, () => {
  console.log(`Waveward backend listening on http://localhost:${DEFAULT_PORT}`);
});
