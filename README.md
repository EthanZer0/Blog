# Shiro Astro

基于公开 Shiro 的静态移植版本，专注视觉设计与阅读体验。主要页面、扩展 Markdown、手记字形设置、分享和原沉浸阅读交互已接入，已部署 GitHub Pages，尚未完成全部视觉对照验收。无需 Mix Space 后端或 Node 生产服务器。

## 本地运行

需要 Node.js 22.12+（建议 24）。

```sh
npm ci
npm run dev
```

完整搜索索引在构建时生成，搜索请使用：

```sh
npm run check
npm run build
npm run verify
npm run preview
```

## 写作与配置

- `src/site.config.ts`：站点名称、简介、Hero、头像、社交链接、导航。
- `src/site.config.ts` 的 `background`：`'auto'` 按访客本地月份和亮暗主题自动选择背景；可设置 `'spring'`、`'summer'`、`'autumn'`、`'winter'` 固定季节，或 `'none'` 关闭。手机、正文阅读页、打印及减少动态偏好下自动隐藏。

背景月份分段参照参考站：2–5 月樱花、9–11 月银杏；6–8 月及 12–1 月在亮色主题使用彩色粒子，暗色主题分别使用发光粒子和雪花。固定季节配置可用于本地验收，验收后恢复 `'auto'`。效果为本地 Canvas 2D 独立适配，尚未完成全部季节的视觉验收。

夏冬亮色粒子按个人设计使用全屏均匀、零散的柔和纯色圆点（直径 2.6–4.2px），约每 170px 网格一个，漂浮速度 2–4px/s；不发光、不闪烁、不响应滚动，也不在中央淡出。
- `src/content/posts/*.md`：文稿。
- `src/content/notes/*.md`：手记。
- `public/avatar.jpg`：当前个人头像，首页与导航栏共用；路径由 `siteConfig.avatar` 配置。
- `src/pages/about.astro`：个人介绍。

首页大字使用 `hero.title.template` 按顺序组合，沿用 Shiro 的 `type`、可选 `text` 和可选 `class`。换行写作 `{ type: 'br' }`，不需要填写文字；字体与字号配置在各片段的 `class`，小字简介在 `hero.description`。当前包含两行介绍与一行 code，可直接替换：

```ts
template: [
  { type: 'h1', text: '嗨！我是', class: 'text-4xl font-light' },
  { type: 'span', text: '凌晨Feng', class: 'font-medium mx-2 text-4xl' },
  { type: 'span', text: '👋', class: 'font-light text-4xl' },
  { type: 'br' },
  { type: 'span', text: '一隅清净地，且行，且留。', class: 'text-4xl font-light' },
  {
    type: 'code',
    text: '<Student & Developer />',
    class: 'font-medium mx-2 text-3xl rounded p-1 bg-gray-200/0 hover:bg-gray-200 dark:bg-gray-800/0 dark:hover:bg-gray-800 transition-colors duration-200',
  },
]
```

`code` 前沿用参考站的自动换行，不额外插入 `br`；这样文字块按内容撑开，保持原双栏布局的左侧起点。

文章元数据示例：

```yaml
title: 我的第一篇文章
description: 文章摘要
published: 2026-10-06T18:00:00+08:00
slug: my-first-post
category: 随笔
categorySlug: essays
tags: [生活]
draft: false
pin: false
```

slug 与 categorySlug 使用小写英文、数字及连字符。文稿地址为 `/posts/<categorySlug>/<slug>/`，手记有 `nid` 时为 `/notes/<nid>/`，否则为 `/notes/<slug>/`。`draft: true` 的内容不会进入公开产物；若源码仓库公开，草稿源文件仍然公开，请勿提交私密内容。

已支持常规 Markdown、GFM、脚注、折叠 HTML、KaTeX 公式、代码高亮、`:::note` / `:::tip` / `:::info` / `:::warning` / `:::danger` 与 `:::gallery` 容器。未实现的 Shiro 特殊容器会报告构建错误；完整扩展语法兼容状态见迁移文档。

## GitHub Pages

首次部署与个人资料替换步骤见 [部署记录](docs/DEPLOYMENT.md)。

1. 将仓库推送到 GitHub，主分支为 `main`。
2. 仓库 Settings → Pages → Source 选择 GitHub Actions。
3. 提交后工作流自动检查、构建、索引并部署。

工作流自动适配项目子路径 `/仓库名/` 与 `用户名.github.io` 根路径。如果使用自定义域名，在仓库 Settings → Secrets and variables → Actions → Variables 设置 `SITE_URL=https://你的域名`、`BASE_PATH=/`，并在 Pages 中配置域名及 DNS。

本地生产构建默认使用 `https://example.com`。部署前必须使用实际 SITE_URL；工作流会自动设置。手工构建时通过环境变量设置 SITE_URL 和 BASE_PATH，`.env.example` 仅作参考，配置文件不自动加载 `.env`。

## 许可与来源

上游作者 Innei，项目 https://github.com/Innei/Shiro，参考提交 `891bb24cd59aff7c9baaf4d9a3579ca4275da3b7`。

保留上游 `LICENSE` 与 `ADDITIONAL_TERMS.md`，沿用 AGPLv3 和上游附加商业使用条款。源码来源与适配变更见 `docs/SOURCES.md`，迁移范围见 `docs/MIGRATION.md`，最新逐文件审查及剩余视觉差异见 `docs/FRONTEND_AUDIT.md`。

## 本轮新增的写作字段

手记可设置 `nid`（唯一正整数）、`mood`、`weather`、`topic`；专栏介绍配置在 `siteConfig.topics`。文稿 `related` 填公开文稿的 id 或 slug。`license` 默认为 `reserved`；`CC-BY-NC-SA-4.0` 才启用原 CC 声明。`images` 可填写 `src/width/height/accent/blurHash`，用于原图片占位和色彩展示。

已接入 Tabs、spoiler、tag、grid、masonry、carousel、静态 LinkCard 和视频。完整来源与明确边界见 [前端源码审查](docs/FRONTEND_AUDIT.md)。

手记右下角字形按钮提供原主题的四种字体选择，选择会在浏览器中保存。霞鹜文楷和悠哉沿用上游 CDN 按需加载，无需后端；网络不可用时使用备用字体。文稿不受手记字形偏好影响。
