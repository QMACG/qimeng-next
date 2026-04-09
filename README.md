# 绮梦 ACG

绮梦 ACG 是一个基于 Next.js 15、Prisma 7、MySQL/MariaDB 与 Redis 的 Galgame 文章与资源站点。

当前版本包含这些核心能力：

- 游戏、资源、标签、会社、广告、友链与文档内容的一体化管理
- 前后台分离，后台可统一维护站点设置、评论、反馈、广告、外链跳转、直链下载与网站统计
- 用户侧支持收藏、评论、评分、反馈、下载与 NSFW 显示范围控制
- 支持旧站 `/game/:cid(.html)` 301 迁移、前台 SEO 基础能力与多域名访问
- 支持前台网站统计脚本注入、评论内容审核、用户名审核与用户组昵称配色

本项目修改自 [KUN1007/kun-touchgal-next](https://github.com/KUN1007/kun-touchgal-next)，在此致谢原项目的开源分享。

## 技术栈

- Next.js 15
- React 19
- Prisma 7
- MySQL / MariaDB
- Redis
- HeroUI
- PM2

## 运行要求

- Node.js 22+
- pnpm 10+
- MySQL 8+ 或 MariaDB 10.6+
- Redis 6+

## 本地开发

1. 安装依赖

```bash
corepack enable
corepack pnpm install
```

2. 复制环境变量

```bash
copy .env.example .env
```

3. 按实际环境填写 `.env`

基础必填：

- `KUN_DATABASE_URL`
- `KUN_VISUAL_NOVEL_SITE_URL`
- `NEXT_PUBLIC_KUN_PATCH_ADDRESS_DEV`
- `NEXT_PUBLIC_KUN_PATCH_ADDRESS_PROD`
- `REDIS_HOST`
- `REDIS_PORT`
- `JWT_SECRET`
- 邮件相关变量

如需启用评论与用户名云审核，还需要：

- `ALIYUN_GREEN_ACCESS_KEY_ID`
- `ALIYUN_GREEN_ACCESS_KEY_SECRET`
- `ALIYUN_GREEN_ENDPOINT`

如需启用站内直链下载，还需要：

- `KUN_DIRECT_DOWNLOAD_ACCOUNT_ID`
- `KUN_DIRECT_DOWNLOAD_APPLICATION_KEY`
- `KUN_DIRECT_DOWNLOAD_BUCKET_ID`
- `KUN_DIRECT_DOWNLOAD_HOSTS`

4. 同步 Prisma

```bash
corepack pnpm prisma:generate
corepack pnpm prisma:push
```

5. 启动开发环境

```bash
corepack pnpm dev
```

默认访问地址：

- `http://127.0.0.1:3000`

## 常用命令

```bash
corepack pnpm dev
corepack pnpm build
corepack pnpm typecheck
corepack pnpm prisma:push
corepack pnpm prisma:generate
```

## 多域名配置

项目支持多域名访问：

- `KUN_VISUAL_NOVEL_SITE_URL`：主域名
- `KUN_VISUAL_NOVEL_SITE_URLS`：其他绑定域名，使用英文逗号分隔
- `NEXT_PUBLIC_KUN_PATCH_ADDRESS_PROD`：正式环境地址，通常与主域名一致

示例：

```env
KUN_VISUAL_NOVEL_SITE_URL="https://game.example.com"
KUN_VISUAL_NOVEL_SITE_URLS="https://www.game.example.com,https://gal.example.com"
NEXT_PUBLIC_KUN_PATCH_ADDRESS_PROD="https://game.example.com"
```

## 评论审核

后台评论管理页现在支持独立的“评论审核”设置：

- 是否开启评论与简评云审核
- 是否开启用户名审核
- 关键词黑名单 / 白名单
- 用户黑名单 / 白名单
- 超过多少字才进入云审核

本地黑白名单始终优先生效，云审核仅在满足设置条件时调用阿里云内容审核接口。

## 昵称配色

后台站点设置新增“昵称配色”页签，可分别设置不同用户组的昵称颜色。保存后会同步影响评论区、反馈区、评分区、顶栏、资料卡等主要昵称展示位置。

## 首号管理员规则

当数据库中还没有任何用户时，第一个成功注册的账号会自动成为最高权限账号。

## 许可

- `AGPL-3.0-only`
