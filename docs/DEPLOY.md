# 绮梦 ACG 部署说明

本文档面向宝塔面板正式部署，默认使用：

- Linux
- Node.js 22+
- pnpm 10+
- MySQL / MariaDB
- Redis
- Nginx
- PM2

## 一、推荐服务器配置

如果准备正式上线并承接稳定访问，建议：

- 起步：`4 核 8G`，SSD
- 更稳妥：`8 核 16G`

说明：

- 站内直链下载不会由 Next 应用直接传输大文件，应用主要负责鉴权、限额、统计和跳转
- 真正吃资源的部分主要是 SSR 页面、数据库查询、搜索、后台列表页和爬虫访问

## 二、宝塔面板准备

在宝塔中先安装：

- Nginx
- MySQL 或 MariaDB
- Redis
- Node.js 管理器

建议额外安装：

- PM2
- Git

## 三、拉取代码

```bash
cd /www/wwwroot
git clone <你的仓库地址> qimeng-next
cd qimeng-next
corepack enable
corepack prepare pnpm@latest --activate
corepack pnpm install
```

## 四、配置环境变量

```bash
cp .env.example .env
```

然后按实际环境编辑 `.env`。

至少需要配置：

- `KUN_DATABASE_URL`
- `REDIS_HOST`
- `REDIS_PORT`
- `KUN_VISUAL_NOVEL_SITE_URL`
- `NEXT_PUBLIC_KUN_PATCH_ADDRESS_PROD`
- `JWT_SECRET`
- 邮件相关变量

如果启用多域名：

- `KUN_VISUAL_NOVEL_SITE_URL` 填主域名
- `KUN_VISUAL_NOVEL_SITE_URLS` 填其他绑定域名

如果启用直链下载：

- `KUN_DIRECT_DOWNLOAD_ACCOUNT_ID`
- `KUN_DIRECT_DOWNLOAD_APPLICATION_KEY`
- `KUN_DIRECT_DOWNLOAD_BUCKET_ID`
- `KUN_DIRECT_DOWNLOAD_HOSTS`

## 五、初始化数据库

```bash
corepack pnpm prisma:generate
corepack pnpm prisma:push
```

如果这是全新站点，第一次注册成功的账号会成为最高权限账号。

## 六、构建项目

```bash
corepack pnpm build
```

Linux 环境下会生成 Next standalone 产物，PM2 直接运行：

- `.next/standalone/server.js`

## 七、使用 PM2 启动

项目自带 `ecosystem.config.cjs`，可直接启动：

```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

常用命令：

```bash
pm2 status
pm2 logs qimeng-next
pm2 restart qimeng-next
pm2 delete qimeng-next
```

## 八、Nginx 反向代理

在宝塔站点里反向代理到：

- `http://127.0.0.1:3000`

示例：

```nginx
location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

然后在宝塔中签发 SSL。

## 九、建议的上线顺序

1. 配好数据库、Redis、邮件、域名解析
2. 上传并填写 `.env`
3. 执行 `pnpm install`
4. 执行 `pnpm prisma:push`
5. 执行 `pnpm build`
6. 用 PM2 启动
7. 用 Nginx 反代并开启 HTTPS
8. 注册首个管理员账号
9. 进入后台配置站点名称、广告、友链、网站统计、资源备注等设置
