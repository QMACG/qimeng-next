# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
RUN npm install -g corepack@latest && corepack enable

FROM base AS deps
# lockfileVersion 9 需要 pnpm 9
RUN corepack prepare pnpm@9 --activate
# postinstall 会执行 prisma generate，需 schema / prisma.config；generate 不连库但配置会读 KUN_DATABASE_URL
ENV KUN_DATABASE_URL="mysql://docker:docker@127.0.0.1:3306/dummy"
COPY package.json pnpm-lock.yaml .npmrc ./
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# next.config 通过 validations/dotenv-check 读 .env；ENV 先于 COPY，dotenv 不会覆盖已有变量
ENV NODE_ENV=production
ENV SKIP_POSTBUILD_SITEMAP=1
COPY .env.example .env

RUN pnpm prisma:generate && pnpm build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 --ingroup nodejs nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --chown=nextjs:nodejs ecosystem.docker.cjs /app/ecosystem.docker.cjs

RUN mkdir -p /app/uploads && chown nextjs:nodejs /app/uploads \
  && npm install -g pm2@5

USER nextjs

EXPOSE 3000

# cluster 多进程吃满多核；PM2_INSTANCES 由 compose / 运行时注入
CMD ["pm2-runtime", "/app/ecosystem.docker.cjs"]
