# Waveward Backend

本目录提供一个零依赖的本地 Node 后端，默认监听 `3001` 端口，并使用 `api/storage/db.json` 做文件持久化。

## 启动

```bash
npm run server
```

开发模式：

```bash
npm run dev:server
```

两个脚本都会自动加载项目根目录的 `.env` 文件（如果存在），无需额外依赖。

## DeepSeek 配置

AI 能力（问题生成、报告 summary、维度洞察、行动建议）默认接入 DeepSeek，无 key 时自动回退到本地智能模板。

在项目根目录创建 `.env`：

```env
DEEPSEEK_API_KEY=sk-你的key
# 以下为可选项，留空走默认
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
DEEPSEEK_MODEL=deepseek-chat
```

- API Key 在 https://platform.deepseek.com 申请
- 模型可选 `deepseek-chat`（V3，默认，快且便宜）或 `deepseek-reasoner`（R1，带推理）
- 兼容旧的 `OPENAI_API_KEY` / `OPENAI_BASE_URL` / `OPENAI_MODEL`，优先级低于 `DEEPSEEK_*`
- 任意 AI 调用失败（网络/超时/格式异常）都会静默回退到本地模板，前端无感知

## 接口

- `GET /api/health`
- `POST /api/auth/login`
- `GET /api/accounts/:loginName`
- `POST /api/accounts/:loginName/pet`
- `POST /api/profiles`
- `POST /api/sessions`
- `GET /api/sessions/:sessionId`
- `POST /api/sessions/:sessionId/answers`
- `POST /api/sessions/:sessionId/report`
- `POST /api/journeys/:journeyId/complete`

## 说明

- 返回结构统一包含 `ok` 字段
- 接口已经加上 CORS，前端开发环境可直接通过 Vite 代理访问 `/api`
- 当前适合本地开发和接口联调；后续可以把 `db.json` 替换为正式数据库
