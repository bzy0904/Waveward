// 迁移脚本：将 api/storage/db.json 中的数据导入 SQLite
// 用法：node api/migrate.cjs
const { readFile } = require("node:fs/promises");
const { DatabaseSync } = require("node:sqlite");
const { join } = require("node:path");

const DB_PATH = join(__dirname, "storage", "waveward.db");
const JSON_PATH = join(__dirname, "storage", "db.json");

async function main() {
  let raw;
  try {
    raw = await readFile(JSON_PATH, "utf8");
  } catch {
    console.log("db.json 不存在，跳过迁移。");
    return;
  }

  const data = JSON.parse(raw);
  const db = new DatabaseSync(DB_PATH);
  db.exec("PRAGMA foreign_keys = ON");

  // 建表（与 db.js 保持一致）
  db.exec(`
    CREATE TABLE IF NOT EXISTS accounts (
      loginName TEXT PRIMARY KEY, selectedPetId TEXT NOT NULL DEFAULT 'moon-rabbit',
      profile TEXT, createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY, loginName TEXT NOT NULL REFERENCES accounts(loginName) ON DELETE CASCADE,
      topic TEXT NOT NULL, persona TEXT NOT NULL, petId TEXT NOT NULL,
      profileSnapshot TEXT NOT NULL, createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sessionId INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
      questionId TEXT NOT NULL, dimension TEXT NOT NULL, title TEXT NOT NULL,
      prompt TEXT NOT NULL, comparisonTarget TEXT, value TEXT NOT NULL,
      trend TEXT NOT NULL, stance TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS journeys (
      id TEXT PRIMARY KEY, loginName TEXT NOT NULL REFERENCES accounts(loginName) ON DELETE CASCADE,
      sessionId INTEGER NOT NULL, date TEXT NOT NULL, topic TEXT NOT NULL, petId TEXT NOT NULL,
      nickname TEXT NOT NULL, discourageScore INTEGER NOT NULL, verdict TEXT NOT NULL,
      actionSuggestion TEXT NOT NULL, completed INTEGER NOT NULL DEFAULT 0,
      reflection TEXT NOT NULL DEFAULT '', stageTitle TEXT NOT NULL, growthLine TEXT NOT NULL,
      report TEXT NOT NULL, profileSnapshot TEXT NOT NULL, followUps TEXT NOT NULL DEFAULT '[]'
    );
  `);

  // 安全绑定：把 undefined 转成 null
  function v(val) {
    if (val === undefined) return null;
    if (typeof val === "number" && !Number.isFinite(val)) return null;
    return val;
  }

  db.exec("BEGIN");

  try {
    // accounts（profile 作为 JSON 列存储）
    for (const [loginName, account] of Object.entries(data.accounts || {})) {
      db.prepare(`
        INSERT OR IGNORE INTO accounts (loginName, selectedPetId, profile, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        v(loginName),
        v(account.selectedPetId) || "moon-rabbit",
        account.profile ? JSON.stringify(account.profile) : null,
        v(account.createdAt),
        v(account.updatedAt),
      );

      // journeys
      for (const journey of account.journeys || []) {
        db.prepare(`
          INSERT OR REPLACE INTO journeys
            (id, loginName, sessionId, date, topic, petId, nickname,
             discourageScore, verdict, actionSuggestion, completed, reflection,
             stageTitle, growthLine, report, profileSnapshot, followUps)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          v(journey.id), v(loginName), v(journey.sessionId), v(journey.date),
          v(journey.topic), v(journey.petId), v(journey.nickname),
          v(journey.discourageScore), v(journey.verdict), v(journey.actionSuggestion),
          journey.completed ? 1 : 0, v(journey.reflection || ""),
          v(journey.stageTitle), v(journey.growthLine),
          JSON.stringify(journey.report), JSON.stringify(journey.profileSnapshot),
          JSON.stringify(journey.followUps || []),
        );
      }
    }

    // sessions
    for (const [id, session] of Object.entries(data.sessions || {})) {
      db.prepare(`
        INSERT OR REPLACE INTO sessions
          (id, loginName, topic, persona, petId, profileSnapshot, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        v(Number(id)), v(session.loginName), v(session.topic), v(session.persona),
        v(session.petId), JSON.stringify(session.profileSnapshot),
        v(session.createdAt), v(session.updatedAt),
      );

      // answers
      for (const answer of session.answers || []) {
        db.prepare(`
          INSERT INTO answers
            (sessionId, questionId, dimension, title, prompt, comparisonTarget, value, trend, stance)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          v(Number(id)), v(answer.questionId), v(answer.dimension), v(answer.title),
          v(answer.prompt), v(answer.comparisonTarget ?? null), v(answer.value),
          v(answer.trend), v(answer.stance),
        );
      }
    }

    db.exec("COMMIT");
    console.log("迁移完成。");

    // 统计
    const accounts = db.prepare("SELECT COUNT(*) as c FROM accounts").get().c;
    const sessions = db.prepare("SELECT COUNT(*) as c FROM sessions").get().c;
    const answers = db.prepare("SELECT COUNT(*) as c FROM answers").get().c;
    const journeys = db.prepare("SELECT COUNT(*) as c FROM journeys").get().c;
    console.log(`accounts: ${accounts}, sessions: ${sessions}, answers: ${answers}, journeys: ${journeys}`);
  } catch (err) {
    db.exec("ROLLBACK");
    console.error("迁移失败：", err.message);
    process.exit(1);
  }

  db.close();
}

main();
