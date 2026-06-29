import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const DB_DIR = fileURLToPath(new URL("./storage/", import.meta.url));
const DB_PATH = join(DB_DIR, "waveward.db");

// 确保存储目录存在
mkdirSync(DB_DIR, { recursive: true });

// 初始化数据库连接
const db = new DatabaseSync(DB_PATH);
db.exec("PRAGMA journal_mode = WAL");
db.exec("PRAGMA foreign_keys = ON");

// ===== 建表 =====
db.exec(`
  CREATE TABLE IF NOT EXISTS accounts (
    loginName     TEXT PRIMARY KEY,
    selectedPetId TEXT NOT NULL DEFAULT 'moon-rabbit',
    profile       TEXT,
    password      TEXT,
    createdAt     TEXT NOT NULL,
    updatedAt     TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id              INTEGER PRIMARY KEY,
    loginName       TEXT NOT NULL REFERENCES accounts(loginName) ON DELETE CASCADE,
    topic           TEXT NOT NULL,
    persona         TEXT NOT NULL,
    petId           TEXT NOT NULL,
    profileSnapshot TEXT NOT NULL,
    createdAt       TEXT NOT NULL,
    updatedAt       TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS answers (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    sessionId        INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    questionId       TEXT NOT NULL,
    dimension        TEXT NOT NULL,
    title            TEXT NOT NULL,
    prompt           TEXT NOT NULL,
    comparisonTarget TEXT,
    value            TEXT NOT NULL,
    trend            TEXT NOT NULL,
    stance           TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS journeys (
    id               TEXT PRIMARY KEY,
    loginName        TEXT NOT NULL REFERENCES accounts(loginName) ON DELETE CASCADE,
    sessionId        INTEGER NOT NULL,
    date             TEXT NOT NULL,
    topic            TEXT NOT NULL,
    petId            TEXT NOT NULL,
    nickname         TEXT NOT NULL,
    discourageScore  INTEGER NOT NULL,
    verdict          TEXT NOT NULL,
    actionSuggestion TEXT NOT NULL,
    completed        INTEGER NOT NULL DEFAULT 0,
    reflection       TEXT NOT NULL DEFAULT '',
    stageTitle       TEXT NOT NULL,
    growthLine       TEXT NOT NULL,
    report           TEXT NOT NULL,
    profileSnapshot  TEXT NOT NULL,
    followUps        TEXT NOT NULL DEFAULT '[]'
  );

  CREATE INDEX IF NOT EXISTS idx_sessions_loginName ON sessions(loginName);
  CREATE INDEX IF NOT EXISTS idx_answers_sessionId ON answers(sessionId);
  CREATE INDEX IF NOT EXISTS idx_journeys_loginName ON journeys(loginName);
`);

// ===== 迁移：为已存在的 accounts 表补充 password 列 =====
const accountColumns = db.prepare("PRAGMA table_info(accounts)").all();
if (!accountColumns.some((col) => col.name === "password")) {
  db.exec("ALTER TABLE accounts ADD COLUMN password TEXT");
}

// ===== 迁移：为已存在的 journeys 表补充 process_analysis 列 =====
const journeyColumns = db.prepare("PRAGMA table_info(journeys)").all();
if (!journeyColumns.some((col) => col.name === "processAnalysis")) {
  db.exec("ALTER TABLE journeys ADD COLUMN processAnalysis TEXT NOT NULL DEFAULT ''");
}

// ===== 预编译语句 =====
const stmts = {
  // accounts
  upsertAccount: db.prepare(`
    INSERT INTO accounts (loginName, selectedPetId, profile, password, createdAt, updatedAt)
    VALUES (@loginName, @selectedPetId, @profile, @password, @createdAt, @updatedAt)
    ON CONFLICT(loginName) DO UPDATE SET
      selectedPetId = @selectedPetId,
      updatedAt = @updatedAt
  `),
  getAccount: db.prepare(`SELECT * FROM accounts WHERE loginName = ?`),
  getAccountExists: db.prepare(`SELECT loginName FROM accounts WHERE loginName = ?`),
  createAccountWithPassword: db.prepare(`
    INSERT INTO accounts (loginName, selectedPetId, profile, password, createdAt, updatedAt)
    VALUES (@loginName, @selectedPetId, NULL, @password, @createdAt, @updatedAt)
  `),
  updateAccountPet: db.prepare(`
    UPDATE accounts SET selectedPetId = ?, updatedAt = ? WHERE loginName = ?
  `),
  updateAccountProfile: db.prepare(`
    UPDATE accounts SET profile = ?, updatedAt = ? WHERE loginName = ?
  `),
  touchAccount: db.prepare(`UPDATE accounts SET updatedAt = ? WHERE loginName = ?`),

  // sessions
  insertSession: db.prepare(`
    INSERT INTO sessions (id, loginName, topic, persona, petId, profileSnapshot, createdAt, updatedAt)
    VALUES (@id, @loginName, @topic, @persona, @petId, @profileSnapshot, @createdAt, @updatedAt)
  `),
  getSession: db.prepare(`SELECT * FROM sessions WHERE id = ?`),
  touchSession: db.prepare(`UPDATE sessions SET updatedAt = ? WHERE id = ?`),

  // answers
  insertAnswer: db.prepare(`
    INSERT INTO answers (sessionId, questionId, dimension, title, prompt, comparisonTarget, value, trend, stance)
    VALUES (@sessionId, @questionId, @dimension, @title, @prompt, @comparisonTarget, @value, @trend, @stance)
  `),
  getAnswersBySession: db.prepare(`SELECT * FROM answers WHERE sessionId = ? ORDER BY id`),

  // journeys
  getJourney: db.prepare(`SELECT * FROM journeys WHERE id = ?`),
  getJourneysByAccount: db.prepare(`SELECT * FROM journeys WHERE loginName = ? ORDER BY rowid DESC`),
  countSessionsByAccount: db.prepare(`SELECT COUNT(*) as cnt FROM sessions WHERE loginName = ?`),
  insertJourney: db.prepare(`
    INSERT INTO journeys (id, loginName, sessionId, date, topic, petId, nickname,
      discourageScore, verdict, actionSuggestion, completed, reflection,
      stageTitle, growthLine, report, profileSnapshot, followUps)
    VALUES (@id, @loginName, @sessionId, @date, @topic, @petId, @nickname,
      @discourageScore, @verdict, @actionSuggestion, @completed, @reflection,
      @stageTitle, @growthLine, @report, @profileSnapshot, @followUps)
    ON CONFLICT(id) DO UPDATE SET
      date = @date, topic = @topic, petId = @petId, nickname = @nickname,
      discourageScore = @discourageScore, verdict = @verdict,
      actionSuggestion = @actionSuggestion, report = @report,
      profileSnapshot = @profileSnapshot
  `),
  updateJourneyCompletion: db.prepare(`
    UPDATE journeys SET completed = 1, reflection = ?, stageTitle = ?, growthLine = ?, processAnalysis = ?
    WHERE id = ?
  `),
  countCompletedJourneys: db.prepare(`
    SELECT COUNT(*) as cnt FROM journeys WHERE loginName = ? AND completed = 1
  `),
  updateJourneyFollowUps: db.prepare(`
    UPDATE journeys SET followUps = ? WHERE id = ?
  `),
};

// ===== 序列化辅助 =====
function rowToAnswer(row) {
  return {
    questionId: row.questionId,
    dimension: row.dimension,
    title: row.title,
    prompt: row.prompt,
    comparisonTarget: row.comparisonTarget ?? undefined,
    value: row.value,
    trend: row.trend,
    stance: row.stance,
  };
}

function rowToSession(row) {
  if (!row) return null;
  return {
    id: row.id,
    loginName: row.loginName,
    topic: row.topic,
    persona: row.persona,
    petId: row.petId,
    profileSnapshot: JSON.parse(row.profileSnapshot),
    answers: stmts.getAnswersBySession.all(row.id).map(rowToAnswer),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function rowToJourney(row) {
  if (!row) return null;
  return {
    id: row.id,
    sessionId: row.sessionId,
    date: row.date,
    topic: row.topic,
    petId: row.petId,
    nickname: row.nickname,
    discourageScore: row.discourageScore,
    verdict: row.verdict,
    actionSuggestion: row.actionSuggestion,
    completed: Boolean(row.completed),
    reflection: row.reflection,
    stageTitle: row.stageTitle,
    growthLine: row.growthLine,
    answers: stmts.getAnswersBySession.all(row.sessionId).map(rowToAnswer),
    report: JSON.parse(row.report),
    profileSnapshot: JSON.parse(row.profileSnapshot),
    followUps: JSON.parse(row.followUps),
    processAnalysis: row.processAnalysis ? JSON.parse(row.processAnalysis) : null,
  };
}

function serializeAccount(loginName) {
  const accountRow = stmts.getAccount.get(loginName);
  if (!accountRow) return null;

  const journeys = stmts.getJourneysByAccount.all(loginName).map(rowToJourney);
  const profile = accountRow.profile ? JSON.parse(accountRow.profile) : null;

  // 动态同步 profile 里的计数（避免 profile JSON 里的旧值过时）
  // shelangCount = 发起的 session 总数；completedCount = 已完成 journey 数
  if (profile) {
    const sessionCount = stmts.countSessionsByAccount.get(loginName).cnt;
    const completedCount = journeys.filter((j) => j.completed).length;
    profile.shelangCount = sessionCount;
    profile.completedCount = completedCount;
    profile.completionRate = sessionCount > 0
      ? Math.round((completedCount / sessionCount) * 100)
      : 0;
  }

  return {
    loginName: accountRow.loginName,
    selectedPetId: accountRow.selectedPetId,
    profile,
    journeys,
    hasPassword: Boolean(accountRow.password),
    updatedAt: accountRow.updatedAt,
  };
}

// ===== 导出数据访问 API =====
export const repo = {
  // ===== accounts =====
  ensureAccount(loginName, petId = "moon-rabbit") {
    const now = new Date().toISOString();
    const existing = stmts.getAccount.get(loginName);
    if (!existing) {
      stmts.upsertAccount.run({
        loginName,
        selectedPetId: petId,
        profile: null,
        password: null,
        createdAt: now,
        updatedAt: now,
      });
    }
    return serializeAccount(loginName);
  },

  getAccount(loginName) {
    return serializeAccount(loginName);
  },

  getAccountRow(loginName) {
    return stmts.getAccount.get(loginName) ?? null;
  },

  accountExists(loginName) {
    return Boolean(stmts.getAccountExists.get(loginName));
  },

  createAccountWithPassword(loginName, password, petId = "moon-rabbit") {
    const now = new Date().toISOString();
    stmts.createAccountWithPassword.run({
      loginName,
      selectedPetId: petId,
      password,
      createdAt: now,
      updatedAt: now,
    });
    return serializeAccount(loginName);
  },

  updatePet(loginName, petId) {
    const now = new Date().toISOString();
    stmts.updateAccountPet.run(petId, now, loginName);
    return serializeAccount(loginName);
  },

  saveProfile(loginName, profile) {
    const now = new Date().toISOString();
    stmts.updateAccountProfile.run(JSON.stringify(profile), now, loginName);
  },

  touchAccount(loginName) {
    stmts.touchAccount.run(new Date().toISOString(), loginName);
  },

  // ===== sessions =====
  createSession(session) {
    stmts.insertSession.run({
      id: session.id,
      loginName: session.loginName,
      topic: session.topic,
      persona: session.persona,
      petId: session.petId,
      profileSnapshot: JSON.stringify(session.profileSnapshot),
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    });
  },

  getSession(sessionId) {
    const row = stmts.getSession.get(String(sessionId));
    return rowToSession(row);
  },

  touchSession(sessionId) {
    stmts.touchSession.run(new Date().toISOString(), String(sessionId));
  },

  // ===== answers =====
  addAnswer(sessionId, answer) {
    stmts.insertAnswer.run({
      sessionId: String(sessionId),
      questionId: answer.questionId,
      dimension: answer.dimension,
      title: answer.title,
      prompt: answer.prompt,
      comparisonTarget: answer.comparisonTarget ?? null,
      value: answer.value,
      trend: answer.trend,
      stance: answer.stance,
    });
  },

  getAnswerCount(sessionId) {
    return stmts.getAnswersBySession.all(String(sessionId)).length;
  },

  // ===== journeys =====
  upsertJourney(journey) {
    stmts.insertJourney.run({
      id: journey.id,
      loginName: journey.loginName,
      sessionId: journey.sessionId,
      date: journey.date,
      topic: journey.topic,
      petId: journey.petId,
      nickname: journey.nickname,
      discourageScore: journey.discourageScore,
      verdict: journey.verdict,
      actionSuggestion: journey.actionSuggestion,
      completed: journey.completed ? 1 : 0,
      reflection: journey.reflection ?? "",
      stageTitle: journey.stageTitle,
      growthLine: journey.growthLine,
      report: JSON.stringify(journey.report),
      profileSnapshot: JSON.stringify(journey.profileSnapshot),
      followUps: JSON.stringify(journey.followUps ?? []),
    });
  },

  getJourney(journeyId) {
    return rowToJourney(stmts.getJourney.get(journeyId));
  },

  completeJourney(journeyId, reflection, stageTitle, growthLine, processAnalysis) {
    stmts.updateJourneyCompletion.run(
      reflection ?? "",
      stageTitle,
      growthLine,
      processAnalysis ?? "",
      journeyId,
    );
  },

  countCompletedJourneys(loginName) {
    return stmts.countCompletedJourneys.get(loginName).cnt;
  },

  addFollowUp(journeyId, followUp) {
    const journey = rowToJourney(stmts.getJourney.get(journeyId));
    if (!journey) return null;
    const followUps = [...journey.followUps, followUp];
    stmts.updateJourneyFollowUps.run(JSON.stringify(followUps), journeyId);
    return rowToJourney(stmts.getJourney.get(journeyId));
  },

  // ===== 内部工具 =====
  serializeAccount,
};

export { db };
