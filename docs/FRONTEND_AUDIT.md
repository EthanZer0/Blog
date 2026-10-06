# 前端源码审查（2026-10-06）

审查基准为公开 Shiro 固定提交 `891bb24cd59aff7c9baaf4d9a3579ca4275da3b7`（apps/web）。本地源码位于 `.research/Shiro`。本报告覆盖本地前端所有源码文件，并按实际入口组件追溯上游实现。没有把上游整个应用的全部功能视为已经迁移。

**结论：本轮修正了一批实质性差异，但仍存在视觉和交互差异，不能称为严格等同或已经通过像素级验收。** 以下 D 项是当前差异，不是已完成事项；不以静态化为理由把纯前端动效自动排除。

## 已修正的主要差异

- 全站 Content、NormalContainer、Paper 间距，避免首页之外漏掉全局容器。
- Header 真正使用的 40px 方圆头像、手机网格、滚动条补偿宽度、普通页面淡出规则。
- 文稿默认列表的额外标题、计数、分割线；恢复置顶图标、摘要、预览图、时间和分类 SVG。
- 页脚双行排版、原箭头 SVG、三档主题控件及系统主题。
- 手机导航恢复 Vaul 底部抽屉。手机目录按上游 modal 的移动分支恢复 PresentSheet/FAB，不使用桌面弹窗。
- 原时间线页标题/副标题/进度文字/年月列表，移除自加筛选胶囊；首页手记“更多”指向时间线。
- 手记入口改为最新手记，补回左侧手记时间线和原前后篇结构；文稿移除自加前后篇。
- 标题锚点、图注、表格外层、罗马数字脚注、代码品牌色和图标、文件名、长代码展开、原横向 gallery。
- 补接原滚动条、遮罩、代码字体、图片进入动画的 CSS；没有覆盖原段落行距和图片圆角。
- 原滚动弹簧及阅读百分比公式。移除导致标题偏移叠加的全局 smooth/scroll-padding。
- 锁定与上游一致的 React、Tailwind、DaisyUI、Motion、Shiki、Vaul、react-photo-view 等共同展示依赖。Astro 自身内部的 Shiki 版本不负责正文高亮，正文直接调用原版 3.21.0。

## 当前仍有差异

| 编号 | 上游行为 | 当前状态与影响 |
| --- | --- | --- |
| D1 | Next 导航的共享 layoutId；Header 菜单/图标跨页面连续动画、切换过渡 | 普通静态链接会刷新页面；保留光斑和浮动导航，但跨页连续性不相同。没有菜单层级配置或 MenuPopover。 |
| D2 | 首页 Activity 的逐项进入、年度时间线逐日/节点/标签的原 Spring 延时及 FloatPopover；节日 Windsock；时间线逐组进入；CountUp | 图形静态几何和年度遮罩已保留；逐项动画/Popover 未完整迁移；条件装饰未迁移。TimelineProgress 为 Motion 数值动画，原 CountUp 细节不同，计时器由 2ms 改为 1s。12个月范围以构建日期和上海时区确定。 |
| D3 | TocTree 的 IntersectionObserver 活跃章节策略、自动居中、RightToLeft 进入和共享标记动画；完整 Modal stack | 当前滚动阈值选择章节；标记为 CSS，未移植全部进入/自动居中动画；手机抽屉未共享原全局模态栈。 |
| D4 | PostItemComposer 的 compact/loose 用户偏好；标签弹窗；编辑时间浮层；自适应代码高度及 copy 图标切换动效 | 默认 loose 布局已恢复；其余显示模式/浮层未迁移。复制可用，但没有原 Motion 图标及 AutoResizeHeight 完整动画；滚动遮罩和展开保留静态适配。 |
| D5 | API/Algolia 搜索内容、subtitle、键盘列表自动滚入视口、关闭动画与服务徽标 | 使用本地 Pagefind；面板主要几何相同，结果结构、底栏、错误提示及关闭动画仍有差异。独立 `/search/` 是额外回退页。 |
| D6 | 原分类单数路由、标签 TagDetailModal、自定义页面阅读结构、手记 nid/topic | 本地 categories/tags 和关于页为额外静态页；标签展示方式不相同。手记 slug 替代 nid，未实现 topic、系列和全部元信息字段。 |
| D7 | markdown-to-jsx 扩展（Tabs、spoiler、tag、grid/masonry、carousel 别名、LinkCard、视频、React/HTML 扩展、Lexical）、原 heading/脚注 id、关联文章、版权文案/弹窗 | Astro remark/rehype 只覆盖目前列明的 Markdown 范围；未知 directive 报错。标题/脚注 id 为 Astro 规范。关联文章与完整版权界面未迁移；版权授权文字使用本站配置范围，不替用户自动声明 CC 许可。未知代码语言以 plaintext 回退。 |
| D8 | 图片元数据/blurhash、失败条、EXIF、尺寸优化；gallery 共用 PhotoProvider、完整懒加载/进入动画；链接 favicon/Popover | 单图查看器依赖版本与原版相同；没有全部附属界面。gallery 采用原横向结构和控制，但多图查看器分组、图片进入/懒加载等不完全一致；普通链接缺少 favicon 与浮层。 |

这些纯前端差异仍需按原码补齐，不能因为当前可以构建就认定“严格相似”已经达成。移动、图片等新组件的尺寸改变后也仍需验证。

## 静态化适配与个人配置

以下为用户已允许抛弃的后台能力：登录、所有者编辑、在线人数/实时活动、评论、阅读/点赞统计、订阅服务、网关信息。相关前端控件随能力移除，页面自然会少一些区域。分享、阅读设置等纯前端功能不能笼统归入后台，当前未移植也算差异。

文字、头像、社交项目、菜单和页脚链接本来就是配置。本地是演示资料，不能以作者或其他部署站的配置作为唯一主题实现。代码字体保留原远程 font-face；Manrope/Noto Serif SC 使用本地 Fontsource，外部字体可用性与浏览器渲染仍会影响结果。

## 验证与限制

- `npm run audit:source`：固定提交、15份样式、全部 Spring 常量及共同展示依赖版本比对。只忽略构建路径指令和空行，**不忽略 CSS 规则差异**。需要本地 `.research/Shiro`。
- `npm run verify:renderers`：使用实际 Markdown 管线验证图片/图注、标题、表格、脚注、代码文件名/品牌图标/高亮/expand、gallery；另检查块级公式不能被代码高亮器误处理。
- `npm run check`：Astro/TypeScript；`npm run build` 与 `npm run verify`：静态路由、内部链接、锚点、资源、RSS、草稿隔离和无后端运行依赖。
- 根路径及 `/shiro-test` 分别构建验证。`/notes/` 为 Astro 静态重定向，Pagefind 会略过无 `<html>` 的重定向文件；文章仍只有4篇进入索引。
- 保持原 Tailwind/DaisyUI 版本后，CSS 优化器对 DaisyUI 的 `@property --radialprogress` 有一条提示；没有为了消除提示而修改上游 CSS。
- 浏览器只做集中桌面/390px 抽查：首页、搜索、手机导航/目录、正文结构及溢出。尚未得到同一版本/配置/尺寸的原站截图，没有做逐像素误差统计。

## 逐文件对照

上游路径以下均相对 `apps/web/src/`；“结构恢复”表示按原源结构适配，并不表示该文件逐字一致。15份纯 CSS 的规则一致性由自动比对单独保证。

| 本地源码 | 上游来源 | 审查结论 |
| --- | --- | --- |
| `src/components/DesktopNav.tsx` | `components/layout/header/internal/HeaderContent.tsx; internal/hooks.ts` | 保留胶囊、spotlight、197–247px 淡出、600px 向上滚动与 120ms 防抖；NormalContainer 页面不淡出。跨页面共享动画见 D1。 |
| `src/components/Footer.astro` | `components/layout/footer/Footer.tsx; FooterInfo.tsx; components/icons/arrow.tsx` | 恢复原间距、箭头 SVG、copyright 和 Powered by 两行、主题控件布局；链接为个人配置，订阅/网关/语言切换不接入。 |
| `src/components/Header.astro` | `components/layout/header/Header.tsx; internal/HeaderArea.tsx; internal/SiteOwnerAvatar.tsx` | 恢复实际 Header 使用的 40px 方圆头像、网格、移动端 w-0 和滚动条补偿宽度；不再用未被 Header 使用的森林 Logo 替代头像。右侧认证改为搜索。 |
| `src/components/Hero.tsx` | `app/[locale]/(home)/components/Hero.tsx; TwoColumnLayout.tsx` | 恢复原尺寸、800px 下限、首屏负边距、内部 bottom-0 页脚及主要弹簧；个人标题/头像来自配置。 |
| `src/components/MobileImage.tsx` | `components/ui/image/MobilePhotoView.tsx; ZoomedImage.tsx` | 同版本 react-photo-view，单图 PhotoProvider/photoClosable；保留静态 img；图片附属功能见 D8。 |
| `src/components/MobileMenu.tsx` | `components/layout/header/internal/HeaderDrawer*.tsx; components/ui/sheet/Sheet.tsx` | 用同版本 Vaul 恢复底部抽屉、遮罩、handle、列表间距、原 Spring 和逐项延时；个人菜单使用本地配置。 |
| `src/components/PostItem.astro` | `components/modules/post/PostItem.tsx; PostMetaBar.tsx; shared/PinIconToggle.tsx; ui/effect/MagneticHoverEffect.tsx` | 恢复 loose 标题、pin、摘要、300字截断、预览图、meta、阅读全文布局；磁吸保留 0.05 与原 easing。compact/标签弹窗见 D4。 |
| `src/components/SearchDialog.tsx` | `components/modules/shared/SearchFAB.tsx` | 恢复搜索面板尺寸、输入框、结果列表、选中背景、热键；Pagefind 替换 API，结果及底栏适配见 D5。 |
| `src/components/ThemeSwitcher.tsx` | `components/ui/theme-switcher/ThemeSwitcher.tsx` | 原三档按钮、SVG、指示器偏移和 flushSync；系统主题、持久化由浏览器维护。 |
| `src/components/TimelineProgress.tsx` | `components/modules/timeline/TimelineProgress.tsx` | 原文字、6位小数、两秒进入；把原 2ms 刷新改为 1s，计数动画实现不同，见 D2。 |
| `src/components/Toc.astro` | `components/modules/shared/ArticleRightAside.tsx; ReadIndicator.tsx; modules/toc/TocTree.tsx; TocItem.tsx` | 恢复侧栏高度、根标题深度、文字间距、底部阅读百分比及回顶部；动效与高亮策略见 D3。 |
| `src/components/TocDialog.tsx` | `components/modules/toc/TocFAB.tsx; components/ui/modal/stacked/modal.tsx; components/ui/sheet/Sheet.tsx; components/ui/fab/FABContainer.tsx` | 按移动端分支恢复底部抽屉，不使用桌面居中弹窗；恢复 FAB 尺寸和向下滚动隐藏。目录细节见 D3。 |
| `src/components/upstream/bookmark.tsx` | `components/icons/bookmark.tsx` | 原 SVG/常量；抽取纯展示代码、去掉框架依赖。Logo、bookmark、return 为保留源资产，当前部分未使用；404 修正无效 clipPath。 |
| `src/components/upstream/clock.tsx` | `components/icons/clock.tsx` | 原 SVG/常量；抽取纯展示代码、去掉框架依赖。Logo、bookmark、return 为保留源资产，当前部分未使用；404 修正无效 clipPath。 |
| `src/components/upstream/empty.tsx` | `components/icons/empty.tsx` | 原 SVG/常量；抽取纯展示代码、去掉框架依赖。Logo、bookmark、return 为保留源资产，当前部分未使用；404 修正无效 clipPath。 |
| `src/components/upstream/fa-hash.tsx` | `components/icons/fa-hash.tsx` | 原 SVG/常量；抽取纯展示代码、去掉框架依赖。Logo、bookmark、return 为保留源资产，当前部分未使用；404 修正无效 clipPath。 |
| `src/components/upstream/Logo.tsx` | `components/layout/header/internal/Logo.tsx` | 原 SVG/常量；抽取纯展示代码、去掉框架依赖。Logo、bookmark、return 为保留源资产，当前部分未使用；404 修正无效 clipPath。 |
| `src/components/upstream/menu-collection.tsx` | `components/icons/menu-collection.tsx` | 原 SVG/常量；抽取纯展示代码、去掉框架依赖。Logo、bookmark、return 为保留源资产，当前部分未使用；404 修正无效 clipPath。 |
| `src/components/upstream/NotFoundArtwork.tsx` | `components/common/404.tsx` | 原 SVG/常量；抽取纯展示代码、去掉框架依赖。Logo、bookmark、return 为保留源资产，当前部分未使用；404 修正无效 clipPath。 |
| `src/components/upstream/pin.tsx` | `components/modules/shared/PinIconToggle.tsx` | 原 SVG/常量；抽取纯展示代码、去掉框架依赖。Logo、bookmark、return 为保留源资产，当前部分未使用；404 修正无效 clipPath。 |
| `src/components/upstream/return.tsx` | `components/icons/return.tsx` | 原 SVG/常量；抽取纯展示代码、去掉框架依赖。Logo、bookmark、return 为保留源资产，当前部分未使用；404 修正无效 clipPath。 |
| `src/components/upstream/spring.ts` | `constants/spring.ts` | 原 SVG/常量；抽取纯展示代码、去掉框架依赖。Logo、bookmark、return 为保留源资产，当前部分未使用；404 修正无效 clipPath。 |
| `src/components/YearTimeline.astro` | `app/[locale]/(home)/components/HomePageTimeLine.tsx` | 原文字、12个月、每日/每月柱形和遮罩；构建时生成数据。逐项动画及 Popover 仍有差异 D2。 |
| `src/content.config.ts` | `models/writing.ts + API 内容模型` | Astro 内容 schema，保留文章与手记公开字段；尚无主题/心情/天气等完整字段。 |
| `src/layouts/Article.astro` | `app/[locale]/posts/(post-detail)/Container.tsx; posts/(post-detail)/[category]/[slug]/page.tsx; notes/layout.tsx; components/layout/container/Paper.tsx` | 恢复文稿/手记容器、元信息 SVG、手记侧栏及前后篇；移除文稿自加前后篇。版权文案及高级阅读功能见 D4/D7。 |
| `src/layouts/Base.astro` | `app/[locale]/layout.tsx; components/layout/Content.tsx` | 恢复全局 Content 与主题预处理；SEO、RSS、静态资源地址由 Astro 生成。 |
| `src/layouts/Listing.astro` | `components/layout/container/Normal.tsx; components/modules/post/PostItemComposer.tsx` | 恢复 NormalContainer；文稿页去掉自加可见标题、计数、分隔线。分类/标签额外页面见差异 D6。 |
| `src/lib/content.ts` | `app/[locale]/posts/**/api.ts; app/[locale]/notes/**/api.ts` | 静态内容适配：草稿过滤、排序、去重、路由及日期。没有对应主题视觉代码。 |
| `src/lib/rehype-shiro-highlight.mjs` | `components/ui/code-highlighter/shiki/core.ts` | 直接使用 Shiki 3.21.0、原 github-light/dark 和四个原 transformer；公式交给 KaTeX；未知语言采用 plaintext。 |
| `src/lib/rehype-shiro.mjs` | `components/ui/markdown/renderers/{heading,paragraph,table,image,footnotes}.tsx; ui/banner/Banner.tsx; ui/code-highlighter/shiki/ShikiWrapper.tsx; ui/gallery/Gallery.tsx` | 按原结构生成标题/图注/表格/脚注/代码卡片/横向图库；保留 Astro slug、静态 URL；完整 Markdown 语法差异见 D7。 |
| `src/lib/remark-shiro.mjs` | `components/ui/markdown/parsers/container.tsx` | 支持提示容器及 gallery；未支持的指令报错。完整语法见 D7。 |
| `src/lib/upstream-code-languages.json` | `components/ui/code-highlighter/constants.tsx; language-icons.tsx; components/icons/status.tsx` | 从原 TSX 生成的 SVG/品牌色，生成器为 scripts/sync-code-icons.mjs。 |
| `src/lib/url.ts` | `i18n/navigation; lib/route-builder.ts` | GitHub Pages base 地址适配，无自加视觉样式。 |
| `src/pages/404.astro` | `components/common/404.tsx; app/global-not-found.tsx` | 恢复原 SVG 与文字、固定居中；沿用本站 shell；SVG 原无效 clipPath 引用修正。 |
| `src/pages/about.astro` | `app/[locale]/(page-detail)/Container.tsx; layout/container/Normal.tsx` | 恢复 NormalContainer；个人说明为演示内容，未支持完整自定义页面阅读界面。 |
| `src/pages/categories/[category].astro` | `app/[locale]/category/[slug]/page.tsx` | 静态分类聚合；路由为 categories，页面额外标题及模式见 D6。 |
| `src/pages/feed.xml.ts` | `app/feed/route.tsx` | 静态 RSS；内容来自公开 Markdown，无视觉主题代码。 |
| `src/pages/index.astro` | `app/[locale]/(home)/page.tsx; components/ActivityScreen.tsx; ActivityPostList.tsx; ActivityCard.tsx` | 静态文章/手记生成首页；恢复原更多入口、相对时间、活动图标和发布文案。活动动画/节日装饰见 D2。 |
| `src/pages/notes/[slug].astro` | `app/[locale]/notes/[id]/page.tsx` | 构建时手记路由，nid 改为 slug，复用 Article。 |
| `src/pages/notes/index.astro` | `app/[locale]/notes/page.tsx` | 恢复进入最新公开手记；静态生成 meta refresh 重定向，空集合提供回退页面。 |
| `src/pages/posts/[category]/[slug].astro` | `app/[locale]/posts/(post-detail)/[category]/[slug]/page.tsx` | 构建时文稿路由，复用 Article。 |
| `src/pages/posts/index.astro` | `app/[locale]/posts/page.tsx` | 恢复默认 loose 列表，不显示自加页标题。 |
| `src/pages/robots.txt.ts` | `app/robots.ts / 静态 sitemap 适配` | 静态爬虫与 sitemap 地址，无视觉主题代码。 |
| `src/pages/search.astro` | `components/modules/shared/SearchFAB.tsx` | 保留独立 Pagefind 搜索回退页；Header 已使用原面板几何。此额外页面不等同原版搜索面板。 |
| `src/pages/tags/[tag].astro` | `components/modules/post/fab/PostTagsFAB.tsx` | 标签页代替 TagDetailModal，明确视觉差异 D6。 |
| `src/pages/timeline.astro` | `app/[locale]/timeline/page.tsx; ui/list/TimelineList.tsx` | 恢复时间线标题、篇数、进度文字和列表布局，去掉自加筛选按钮；query 参数本地过滤，动画见 D2。 |
| `src/scripts/site.ts` | `lib/scroller.ts; hooks/common/use-relative-time.ts; ui/relative-time/RelativeTime.tsx; hooks/shared/use-read-percent.ts; ui/gallery/Gallery.tsx` | 移植滚动弹簧、相对时间、阅读公式；连接复制、图库、图像查看器和 header；动画残差见 D1/D2/D3/D8。 |
| `src/site.config.ts` | `app.default.theme-config.ts; layout/header/config.ts; layout/footer/config.ts` | 个人内容与菜单配置，不能据此推断原站个人配置。 |
| `src/styles/global.css` | `styles/index.css + 静态结构适配` | 移除自加段落行距、图片圆角、table display:block、双重平滑滚动、details 菜单/目录规则；其余辅助 CSS 仍是适配，不列作逐字一致。 |
| `src/styles/upstream/animation.css` | `styles/animation.css` | 自动源码比对通过：仅 reference/source 扫描路径和空行适配，无样式规则修改。 |
| `src/styles/upstream/Gallery.css` | `components/ui/gallery/Gallery.css` | 自动源码比对通过：仅 reference/source 扫描路径和空行适配，无样式规则修改。 |
| `src/styles/upstream/image-zoom.css` | `styles/image-zoom.css` | 自动源码比对通过：仅 reference/source 扫描路径和空行适配，无样式规则修改。 |
| `src/styles/upstream/layer.css` | `styles/layer.css` | 自动源码比对通过：仅 reference/source 扫描路径和空行适配，无样式规则修改。 |
| `src/styles/upstream/markdown-variants.css` | `components/ui/markdown/markdown-variants.css` | 自动源码比对通过：仅 reference/source 扫描路径和空行适配，无样式规则修改。 |
| `src/styles/upstream/markdown.css` | `components/ui/markdown/markdown.css` | 自动源码比对通过：仅 reference/source 扫描路径和空行适配，无样式规则修改。 |
| `src/styles/upstream/mask.css` | `styles/mask.css` | 自动源码比对通过：仅 reference/source 扫描路径和空行适配，无样式规则修改。 |
| `src/styles/upstream/print.css` | `styles/print.css` | 自动源码比对通过：仅 reference/source 扫描路径和空行适配，无样式规则修改。 |
| `src/styles/upstream/scrollbar.css` | `styles/scrollbar.css` | 自动源码比对通过：仅 reference/source 扫描路径和空行适配，无样式规则修改。 |
| `src/styles/upstream/Shiki.css` | `components/ui/code-highlighter/shiki/Shiki.css` | 自动源码比对通过：仅 reference/source 扫描路径和空行适配，无样式规则修改。 |
| `src/styles/upstream/tailwindcss.css` | `styles/tailwindcss.css` | 自动源码比对通过：仅 reference/source 扫描路径和空行适配，无样式规则修改。 |
| `src/styles/upstream/theme.css` | `styles/theme.css` | 自动源码比对通过：仅 reference/source 扫描路径和空行适配，无样式规则修改。 |
| `src/styles/upstream/variables.css` | `styles/variables.css` | 自动源码比对通过：仅 reference/source 扫描路径和空行适配，无样式规则修改。 |
| `src/styles/upstream/webfont.css` | `styles/webfont.css` | 自动源码比对通过：仅 reference/source 扫描路径和空行适配，无样式规则修改。 |
| `src/styles/upstream/ZoomedImage.css` | `components/ui/image/ZoomedImage.css` | 自动源码比对通过：仅 reference/source 扫描路径和空行适配，无样式规则修改。 |

共覆盖 64 个本地前端源码文件。`src/content/` 示例 Markdown 为用户写作数据，非主题实现；根配置、生成脚本和依赖锁另已审查。
