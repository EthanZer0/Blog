# 上游来源与适配记录

统一参考提交：`891bb24cd59aff7c9baaf4d9a3579ca4275da3b7`，作者 Innei，仓库 https://github.com/Innei/Shiro。

当前完整来源表和差异记录见 [前端源码审查](FRONTEND_AUDIT.md)。以该报告的当前状态为准。

CSS、SVG 与主要展示结构来自公开 Shiro；保留 AGPL 和 ADDITIONAL_TERMS。没有使用私有赞助版代码或作者个人文章。示例内容是本项目编写的演示资料，`public/avatar.png` 和 `favicon.ico` 为上游公开图标占位。

`npm run audit:source` 比对17份原样式、Spring常量和共同展示依赖；`scripts/sync-code-icons.mjs` 从固定源码生成代码语言 SVG 与颜色。构建可独立完成，不依赖 `.research`；来源校验与重新生成图标需要该源码目录。

移植不是逐字复制整个 Next 应用。框架和静态内容部分使用 Astro；D1–D8 的对齐结果与静态适配边界在审查报告中逐项列出，不能宣称已经完成像素级验收。
# 独立秋季背景适配

`src/components/SeasonalBackground.astro`、`src/scripts/seasonal-background.ts`、`src/scripts/autumn-background.ts` 与 `src/scripts/background/` 为本地独立实现。视觉及季节选择逻辑参考 https://www.xiaohanwu.com/；其 Shiroi 季节背景不在本仓库固定的公开 Shiro 源码中。本项目自行绘制银杏、樱花、雪花和彩色/发光粒子，使用 Canvas 2D，未纳入参考站增强版组件或 shader。秋季已由用户验收，新增季节效果等待用户视觉验收。
