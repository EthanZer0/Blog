# Shiro Astro

基于公开 Shiro 的静态移植版本，专注视觉设计与阅读体验。当前是可运行的迁移基础，尚未完成全部视觉对照验收。无需 Mix Space 后端或 Node 生产服务器。

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
- `src/content/posts/*.md`：文稿。
- `src/content/notes/*.md`：手记。
- `public/avatar.png`：当前为上游图标占位；替换成你自己的头像。
- `src/pages/about.astro`：个人介绍。

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

slug 与 categorySlug 使用小写英文、数字及连字符。文稿地址为 `/posts/<categorySlug>/<slug>/`，手记为 `/notes/<slug>/`。`draft: true` 的内容不会进入公开产物；若源码仓库公开，草稿源文件仍然公开，请勿提交私密内容。

已支持常规 Markdown、GFM、脚注、折叠 HTML、KaTeX 公式、代码高亮、`:::note` / `:::tip` / `:::info` / `:::warning` / `:::danger` 与 `:::gallery` 容器。未实现的 Shiro 特殊容器会报告构建错误；完整扩展语法兼容状态见迁移文档。

## GitHub Pages

1. 将仓库推送到 GitHub，主分支为 `main`。
2. 仓库 Settings → Pages → Source 选择 GitHub Actions。
3. 提交后工作流自动检查、构建、索引并部署。

工作流自动适配项目子路径 `/仓库名/` 与 `用户名.github.io` 根路径。如果使用自定义域名，在仓库 Settings → Secrets and variables → Actions → Variables 设置 `SITE_URL=https://你的域名`、`BASE_PATH=/`，并在 Pages 中配置域名及 DNS。

本地生产构建默认使用 `https://example.com`。部署前必须使用实际 SITE_URL；工作流会自动设置。手工构建时通过环境变量设置 SITE_URL 和 BASE_PATH，`.env.example` 仅作参考，配置文件不自动加载 `.env`。

## 许可与来源

上游作者 Innei，项目 https://github.com/Innei/Shiro，参考提交 `891bb24cd59aff7c9baaf4d9a3579ca4275da3b7`。

保留上游 `LICENSE` 与 `ADDITIONAL_TERMS.md`，沿用 AGPLv3 和上游附加商业使用条款。源码来源与适配变更见 `docs/SOURCES.md`，迁移范围和待完成事项见 `docs/MIGRATION.md`。
