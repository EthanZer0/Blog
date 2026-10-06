# 上游来源与适配记录

统一参考提交：`891bb24cd59aff7c9baaf4d9a3579ca4275da3b7`，作者 Innei，仓库 https://github.com/Innei/Shiro。

| 本地 | 上游 apps/web/src/ | 适配 |
| --- | --- | --- |
| src/styles/upstream/tailwindcss.css | styles/tailwindcss.css | 扫描路径加入 Astro，去掉未使用的编辑器扫描路径 |
| src/styles/upstream/variables.css | styles/variables.css | 保留主题变量 |
| src/styles/upstream/theme.css | styles/theme.css | 保留深浅代码主题等规则 |
| src/styles/upstream/layer.css | styles/layer.css | 保留时间线、辅助类与纸张阴影 |
| src/styles/upstream/animation.css | styles/animation.css | 原动画样式 |
| src/styles/upstream/image-zoom.css | styles/image-zoom.css | 原图片缩放样式 |
| src/styles/upstream/markdown*.css | components/ui/markdown/markdown*.css | 仅改 Tailwind reference 相对路径 |
| src/styles/upstream/Shiki.css | components/ui/code-highlighter/shiki/Shiki.css | 原代码块样式；仅改 reference 路径 |
| src/components/upstream/spring.ts | constants/spring.ts | 原 Spring 参数 |
| src/components/upstream/Logo.tsx | components/layout/header/internal/Logo.tsx | 原 SVG 标志；替换 className 合并工具，移除重复的装饰 path id |
| src/components/upstream/menu-collection.tsx | components/icons/menu-collection.tsx | 原导航图标 |
| src/components/Hero.tsx | app/[locale]/(home)/components/Hero.tsx、TwoColumnLayout.tsx | 原布局类；配置显式导入，Image 换 img，文本入场保留参数；静态 HTML 初始可见 |
| src/components/Header.astro | components/layout/header/Header.tsx、internal/HeaderContent.tsx | 原网格与胶囊样式；静态路由；认证去掉，添加搜索入口 |
| src/components/Footer.astro | components/layout/footer/Footer.tsx、FooterInfo.tsx | 原间距与链接布局；主题在浏览器管理 |
| src/pages/index.astro | app/[locale]/(home)/components/Activity*.tsx、HomePageTimeLine.tsx | 原双栏、活动列表及时间线骨架，数据来自公开内容 |
| src/components/PostItem.astro | components/modules/post/PostItem.tsx | 原 loose 模式标题、摘要和 meta 布局，无互动计数 |
| src/layouts/Article.astro | app/[locale]/posts/(post-detail)/Container.tsx、[category]/[slug]/page*.tsx、components/layout/container/Paper.tsx | 原标题/主栏/200px 侧栏；手记纸张布局；构建时渲染 |
| src/components/Toc.astro | components/modules/shared/ArticleRightAside.tsx | 保留 sticky 与侧栏尺寸，目录由构建结果产生 |
| src/lib/rehype-shiro.mjs | components/ui/banner/Banner.tsx、components/icons/status.tsx、markdown/renderers/table.tsx | 提示容器复用原色彩、布局和 SVG 路径，表格复用原 DaisyUI 类 |
| public/avatar.png、favicon.ico | apps/web/public/android-chrome-512x512.png、favicon.ico | 上游站点图标，演示占位，需换成用户资料 |

没有使用上游个人文章、签名、私有赞助版代码。示例文稿为本移植项目的演示内容。

## 视觉边界

Hero 文案与格式在上游本来就由个人配置提供，此处为可编辑的演示配置。公开仓库不能唯一确定作者站点的所有个人配置。

页面切换暂时采用普通链接；未移植所有滚动触发动画、磁吸交互、导航浮现和完整目录动画。容器渲染、代码块工具栏、头像与正文细节仍须进行参考对照。这些差异明确记录，不能称为已完成高保真验收。

正文无衬线与手记衬线字体遵循上游 `lib/fonts.ts` 的 Manrope 300/400/500 和 Noto Serif SC 400；以 Fontsource 本地字体替代 Next Google Font 构建器，读者浏览不依赖 Google Fonts 请求。
