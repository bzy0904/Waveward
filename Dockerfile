# ===== 构建阶段：编译前端 =====
FROM node:24-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# ===== 运行阶段：最小化镜像 =====
FROM node:24-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
COPY api ./api
EXPOSE 3001
CMD ["node", "api/server.js"]
