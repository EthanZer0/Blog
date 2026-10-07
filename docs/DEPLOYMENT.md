# 个人配置与首次部署

## 待确定的资料

- 目标 GitHub 仓库地址（本地尚未设置 remote）。
- 站点名称、首页文案、社交链接是否沿用当前配置。
- 头像、图标、关于页以及示例文章是否替换；未确认前保留现有文件。
- 是否使用自定义域名。

个人资料位于 `src/site.config.ts`，关于页位于 `src/pages/about.astro`，文章位于 `src/content/`，头像和图标位于 `public/`。

## 部署地址

| 方式 | SITE_URL | BASE_PATH |
| --- | --- | --- |
| 用户/组织站点 | `https://用户名.github.io` | `/` |
| 项目仓库站点 | `https://用户名.github.io` | `/仓库名` |
| 自定义域名 | `https://实际域名` | `/` |

现有工作流自动推导 GitHub Pages 地址与仓库路径；自定义域名通过仓库 Actions Variables 设置 SITE_URL、BASE_PATH，并在 Pages 设置域名。配置文件读取进程环境变量，不自动读取 `.env`。

## 首次发布流程

1. 确定仓库及个人配置，核对目标远程分支，保留已有仓库内容。
2. 使用目标 SITE_URL、BASE_PATH 完成构建和产物验证。
3. 设置远程仓库，推送 main；仓库 Settings → Pages → Source 选择 GitHub Actions。
4. 等待构建与部署完成，确认 Actions 中实际部署地址。
5. 集中检查线上首页、文稿、手记、资源与搜索，以及 RSS / Sitemap 地址。

工作流采用官方示例的 actions/checkout@v7、withastro/action@v6、actions/deploy-pages@v5 和 Node 24，已于 2026-10-07 核对。[Astro 官方工作流说明](https://github.com/withastro/action#usage)

## 当前准备结果

- GitHub CLI 已登录；尚未选择目标仓库、设置 remote 或执行发布。
- 修复子路径部署时 RSS 频道地址缺少仓库路径的问题。
- 移除产物验证中的作者名硬编码；检查实际静态首页文字。
- 产物验证新增 canonical、og:url 和 RSS 频道地址与构建部署地址一致性检查。
- 本地预览依旧使用默认根路径产物；子路径验证产物单独保存在忽略目录中。
