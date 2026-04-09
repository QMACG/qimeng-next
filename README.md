# 绮梦 ACG

绮梦 ACG 是一个基于 Next.js 15、Prisma 7、MySQL/MariaDB 和 Redis 的 Galgame 文章与资源站点。

当前项目形态：

- 游戏与资源一体化管理
- 后台统一管理文章、游戏、标签、会社、广告、友链、反馈、网站统计、直链下载和站点设置
- 普通用户以浏览、收藏、评论、评分、下载为主
- 支持多域名访问
- 支持 Markdown 正文渲染、首页广告、反馈文章、网站统计脚本和后台统计

本项目修改自 [KUN1007/kun-touchgal-next](https://github.com/KUN1007/kun-touchgal-next)，感谢开源。

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

至少需要确认：

- `KUN_DATABASE_URL`
- `REDIS_HOST`
- `REDIS_PORT`
- `KUN_VISUAL_NOVEL_SITE_URL`
- `NEXT_PUBLIC_KUN_PATCH_ADDRESS_DEV`
- `NEXT_PUBLIC_KUN_PATCH_ADDRESS_PROD`
- `JWT_SECRET`
- 邮件相关变量

如果启用站内直链下载，还需要填写：

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

默认访问：

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

项目支持多域名访问。

- `KUN_VISUAL_NOVEL_SITE_URL`：主域名
- `KUN_VISUAL_NOVEL_SITE_URLS`：其他绑定域名，使用英文逗号分隔
- `NEXT_PUBLIC_KUN_PATCH_ADDRESS_PROD`：正式环境地址，通常与主域名一致

示例：

```env
KUN_VISUAL_NOVEL_SITE_URL="https://game.example.com"
KUN_VISUAL_NOVEL_SITE_URLS="https://www.game.example.com,https://gal.example.com"
NEXT_PUBLIC_KUN_PATCH_ADDRESS_PROD="https://game.example.com"
```

## 首号管理员规则

当数据库中还没有任何用户时，第一个成功注册的账号会自动成为最高权限账号。

正式环境建议顺序：

1. 先完成数据库、Redis、邮件配置
2. 首次启动站点
3. 注册第一个账号
4. 进入后台确认权限正常
5. 再按需开放或关闭注册

## 部署说明

详细部署文档见：

- [docs/DEPLOY.md](./docs/DEPLOY.md)

## 许可

当前仓库保留：

- `AGPL-3.0-only`
