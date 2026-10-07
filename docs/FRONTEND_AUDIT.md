# 前端源码审查与对齐结果（2026-10-06）

## 2026-10-07 更新

- 原生窗帘切页动画保留，时长按用户要求为 500ms；源码检查显式允许这一个时长差异。
- 图片放大已修复 Astro 切页造成的动态基础 CSS 丢失，以及首次克隆图解码和入场动画导致的闪烁。适配位于 global.css / ArticleEnhancements，不改变上游 ZoomedImage 源实现；用户验证通过。
- 下面逐文件表包含早期审查结论，若与 D1–D8 当前状态或本节冲突，以当前状态为准。例如数字 nid、手记元数据、Tabs 等现已支持。
- 手记字形选择 NoteFontFab 已接入：原四格布局、字形 SVG、字体栈与本地偏好；静态 adapter 处理 Astro 移除动态字体 link 的生命周期。图标逐字来源校验已加入 audit:source。原主题没有通用的字号与行距设置面板。
- 新增文件 NoteFontSettings.tsx 对应 `components/modules/note/NoteFontFab.tsx`；upstream/note-font-icons.tsx 原样抽取该文件 SansFont 之后的预览字形。TocDialog 统一承接原 FABContainer 布局，手记目录隐藏断点改为 xl，与手记桌面侧栏衔接，修复中间宽度没有目录的问题。

基准：公开 Shiro 提交 `891bb24cd59aff7c9baaf4d9a3579ca4275da3b7`，Shiro 6.6.7，来源 `.research/Shiro/apps/web/src`。本轮按此前 D1–D8 对齐展示组件和交互，优先移植原组件、原 CSS、原 SVG 和原弹簧参数。框架适配不等于逐字复制整个 Next 应用，也未做同配置、同视口的逐像素误差统计。

## D1–D8 的当前状态

| 项目 | 本轮实现 | 原码依据／适配边界 |
| --- | --- | --- |
| D1 导航 | Astro ClientRouter；持久化 Header；共享菜单图标和下划线 LayoutGroup；桌面 MenuPopover；手机子菜单；切换后刷新选中项 | HeaderContent、HeaderDrawerContent、MenuPopover；Next Link 替换为静态路由与 Astro 导航，配置仍为本站个人菜单。 |
| D2 首页／时间线 | 使用 HomePageTimeLine 的逐日、月份节点、文字延时和 FloatPopover；时间范围按浏览器当前月份；恢复 Windsock；Activity 按原分组进入；逐年进入；原 CountUp 和 2ms 计时 | HomePageTimeLine、ActivityScreen、Windsock、TimelineProgress。更正前报告：Windsock 是“风向标”导航，普通 ActivityList 不是逐项动画；没有按错误描述添加节日装饰或逐项动画。 |
| D3 目录／模态层 | 原 IO rootMargin、章节联动、目录自动居中、RightToLeft、共享活动标记；统一桌面弹窗与手机 Vaul 抽屉；支持标签云→详情叠加 | TocTree、TocItem、modal/stacked、PresentSheet；全局数据连接适配为浏览器事件，替代原 Jotai/provider。 |
| D4 文稿／代码 | loose/compact 偏好、创建／修改时间排序与升降序；标签云与标签详情；编辑时间 FloatPopover；原 ShikiWrapper、AutoResizeHeight、copy 图标过渡、滚动遮罩 | PostItemComposer、PostSettingsFAB、PostTagsFAB、PostMetaBar、ShikiWrapper；列表数据来自公开内容文件。 |
| D5 搜索 | subtitle、键盘滚入视口、退出动画、原面板与结果行尺寸、服务底栏；切页关闭、保留搜索热键 | SearchFAB；API／Algolia 替换为 Pagefind，结果内容、错误提示与服务名称按实际静态实现展示。 |
| D6 路由／手记／页面 | 原 posts/tag 路径；手记 nid 数字地址和旧 slug 重定向；mood/weather 原 SVG；可配置 topic 和原 NoteBottomTopic／NoteTopicDetail 展示；关于页恢复自定义页容器、正文与阅读侧栏 | 原码实际没有前报告推断的“category 单数页”；分类元信息恢复纯文字。专栏索引是静态数据入口，不能宣称是上游已有同名页面。未接入后台计数、评论、编辑等能力。 |
| D7 Markdown | Tabs、spoiler、tag、grid（含 images）、原 ResponsiveMasonry、carousel、静态 LinkCard、原 VideoPlayer；原标题 slug 与 index__id、脚注 id／返回高亮；关联阅读；原 PostCopyright 界面、复制反馈与 CC 浮层 | 原 renderers、parsers/container、PostRelated、PostCopyright；普通 HTML 可以渲染。未接入任意 React 代码执行与 Lexical 编辑器数据；LinkCard 元信息由作者在构建输入中提供，不能调用 Mix Space 私有 API。本站文章默认 reserved，只有作者选择 CC 才展示完整 CC 声明。 |
| D8 图片／链接 | 原 ZoomedImage：blurhash、占位、加载／失败提示、EXIF、懒加载、进入动画、桌面 zoom／手机 PhotoView；原 Gallery、分组 PhotoProvider、自动播放、图注；普通链接原 favicon SVG 和浮层 | ZoomedImage、Gallery、Lazyload、MobilePhotoView、Favicon；Next 图片组件适配为静态 img，不提供服务器动态缩图或第三方图床裁切接口。 |

## 首屏底部位置

继续使用 Hero 原 `lg:h-dvh lg:min-h-[800px]`、TwoColumnLayout 的 `size-full` 和内部 `bottom-0`，没有加额外高度或向下偏移。800px 是上游下限：720px 高视口中底部区域的 top 约729px、bottom 800px，轻微滚动即进入；视口更高时表现随原规则变化，不能将示例站某次截图的位置硬编码为全视口行为。

## 核验与诚实边界

- `npm run audit:source`：固定提交；17份原 CSS（仅去除构建引用和空行）；全部 Spring 常量；共同展示依赖版本；MobilePhotoView、LazyLoad、color 的原实现比对。
- `npm run check`：Astro／TypeScript。`npm run verify:renderers`：实际渲染管线覆盖图片、表格、代码、公式、脚注及原扩展语法。
- 根路径与 `/shiro-test`：完整构建、内部资源与锚点、RSS、公开内容／草稿隔离、无后台运行依赖检查。
- 浏览器集中检查桌面与390px手机：跨页导航、列表设置、标签栈、目录定位、正文与图片。没有进行大量逐页面截图测试。
- DaisyUI 原 `@property --radialprogress` 在构建优化器中保留提示；不为消除提示而改原 CSS。开发模式中 Vaul 的旧 ref 访问可能触发 React19提示，共同依赖仍严格按上游锁定。

上述“对齐”指列出的展示结构、参数与交互已接入。API 数据源、框架路由生命周期、静态图片处理、内容格式支持及个人配置仍有明确适配，不能称整个 Shiro 已100%逐字或逐像素迁移。后续手记字形、分享和原沉浸阅读的当前实现见下文与 MIGRATION.md；任意 React 扩展不在静态迁移范围。

## 新组件逐文件来源

| 本地文件／组件 | 上游路径（相对 apps/web/src） |
| --- | --- |
| YearTimeline.tsx、Windsock.tsx | app/[locale]/(home)/components/HomePageTimeLine.tsx、Windsock.tsx |
| TocTree.tsx、TocDialog.tsx | components/modules/toc/TocTree.tsx、TocItem.tsx；components/ui/modal/stacked |
| ModalRoot.tsx、FloatPopover.tsx、MenuPopover.tsx | components/ui/modal/stacked；components/ui/float-popover；components/layout/header/internal/MenuPopover.tsx |
| PostSettings.tsx、EditedTime.tsx | components/modules/post/fab/PostSettingsFAB.tsx、PostTagsFAB.tsx；PostMetaBar.tsx |
| PostCopyright.tsx、NoteMetadata.tsx、NoteBottomTopic.tsx、NoteTopicDetail.tsx | components/modules/post/PostCopyright.tsx；components/modules/note/NoteMetaBar.tsx、NoteBottomTopic.tsx、NoteTopicDetail.tsx |
| MarkdownTabs.tsx、StaticLinkCard.tsx、ArticleEnhancements.tsx | components/ui/markdown/renderers/tabs.tsx；components/ui/link-card/LinkCard.tsx；原渲染组件的静态 HTML 接入层 |
| upstream/ShikiWrapper、AutoResizeHeight、use-mask-scrollarea | components/ui/code-highlighter/shiki/ShikiWrapper.tsx；components/ui/auto-resize-height；hooks/common/use-mask-scrollarea.ts |
| upstream/ZoomedImage、MobilePhotoView、LazyLoad、Gallery、GridImages | components/ui/image；components/common/Lazyload.tsx；components/ui/gallery；components/ui/markdown/renderers/image.tsx |
| upstream/VideoPlayer、VolumeSlider、useVideo、createHTMLMediaHook、IconScaleTransition | components/ui/video-player；components/ui/transition；原播放器媒体 hook |
| upstream/Favicon、platform SVG、link-parser | components/ui/favicon；components/icons/platform；lib/link-parser.ts |
| upstream/Tag、Avatar、FlexText、MotionButton、FloatPanel、Select、Toaster、toast-styles | 原同名 ui 组件；浏览器状态及路径由 upstream/adapters.tsx 接入 |
| upstream/color、datetime、CountUp、meta-icon、appearance/emoji/weather/pen/close | lib/color.ts、lib/datetime.ts、ui/number-transition/CountUp.tsx、lib/meta-icon.ts、components/icons |
| lib/heading-slug.ts、remark-shiro.mjs、rehype-shiro.mjs | Markdown.tsx 的 slugify、原 renderers／parsers，适配为构建管线 |

## 逐文件对照

上游路径以下均相对 `apps/web/src/`；“结构恢复”表示按原源结构适配，并不表示该文件逐字一致。17份纯 CSS 的规则一致性由自动比对单独保证。

| 本地源码 | 上游来源 | 审查结论 |
| --- | --- | --- |
| `src/components/DesktopNav.tsx` | `components/layout/header/internal/HeaderContent.tsx; internal/hooks.ts` | 保留胶囊、spotlight、197–247px 淡出、600px 向上滚动与 120ms 防抖；NormalContainer 页面不淡出。跨页面共享动画由持久化 Header 和 LayoutGroup 承接。 |
| `src/components/Footer.astro` | `components/layout/footer/Footer.tsx; FooterInfo.tsx; components/icons/arrow.tsx` | 恢复原间距、箭头 SVG、copyright 和 Powered by 两行、主题控件布局；链接为个人配置，订阅/网关/语言切换不接入。 |
| `src/components/Header.astro` | `components/layout/header/Header.tsx; internal/HeaderArea.tsx; internal/SiteOwnerAvatar.tsx` | 恢复实际 Header 使用的 40px 方圆头像、网格、移动端 w-0 和滚动条补偿宽度；不再用未被 Header 使用的森林 Logo 替代头像。右侧认证改为搜索。 |
| `src/components/Hero.tsx` | `app/[locale]/(home)/components/Hero.tsx; TwoColumnLayout.tsx` | 恢复原尺寸、800px 下限、首屏负边距、内部 bottom-0 页脚及主要弹簧；个人标题/头像来自配置。 |
| `src/components/MobileMenu.tsx` | `components/layout/header/internal/HeaderDrawer*.tsx; components/ui/sheet/Sheet.tsx` | 用同版本 Vaul 恢复底部抽屉、遮罩、handle、列表间距、原 Spring 和逐项延时；个人菜单使用本地配置。 |
| `src/components/PostItem.astro` | `components/modules/post/PostItem.tsx; PostMetaBar.tsx; shared/PinIconToggle.tsx; ui/effect/MagneticHoverEffect.tsx` | 恢复 loose 标题、pin、摘要、300字截断、预览图、meta、阅读全文布局；磁吸保留 0.05 与原 easing。compact、排序、标签弹窗已接入。 |
| `src/components/SearchDialog.tsx` | `components/modules/shared/SearchFAB.tsx` | 恢复搜索面板尺寸、输入框、结果列表、选中背景、热键；Pagefind 替换 API；补齐 subtitle、键盘滚动、底栏及退出动画。 |
| `src/components/ThemeSwitcher.tsx` | `components/ui/theme-switcher/ThemeSwitcher.tsx` | 原三档按钮、SVG、指示器偏移和 flushSync；系统主题、持久化由浏览器维护。 |
| `src/components/TimelineProgress.tsx` | `components/modules/timeline/TimelineProgress.tsx` | 原文字、6位小数、两秒进入；恢复原 2ms 刷新和 CountUp。 |
| `src/components/Toc.astro` | `components/modules/shared/ArticleRightAside.tsx; ReadIndicator.tsx; modules/toc/TocTree.tsx; TocItem.tsx` | 恢复侧栏高度、根标题深度、文字间距、底部阅读百分比及回顶部；使用 TocTree 的原 IO、自动居中和共享标记。 |
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

## 分享与原沉浸阅读补齐（2026-10-07）

- ArticleShare.tsx 对应原 Post/NoteActionAside、ActionAsideContainer、ShareModal；复用原平台 SVG、二维码尺寸、桌面面板与按钮动效。移除后台操作后仅保留分享，窄屏面板与错误处理有明确适配。
- site.ts 对应 ImmersiveReadingInteractionProvider、TocAside；原 300ms 检测、20% 目录透明度、pointerEvents 与 smooth Spring 保留。仅文稿和自定义页启用，手记不启用。
- 模态栈新增按弹窗选择点击外部关闭，分享沿用原设置；其他弹窗行为保持原配置。
- 本轮类型检查、源码审计、根路径/子路径构建及集中功能验证通过；实际系统分享使用模拟验证，未进行全面像素对照。

## 参考站目录颜色校准（2026-10-07）

- 用户指定参考站：https://www.xiaohanwu.com/posts/life/20241202 。实际目录使用 text-neutral-8，亮色 #52525b、暗色 #d4d4d8；未选中/悬停/沉浸父层透明度仍为 0.5/0.8/0.2。
- TocTree 明确采用上述主题文字色，覆盖桌面目录及手机目录抽屉。此项以参考站实测为标准，是相对于固定上游提交 text-neutral (#c7c7cc) 的明确差异；没有修改全站 neutral 变量或上游样式文件。

## 视觉收尾审查（2026-10-07）

| 检查项 | 原码标准及本轮处理 |
| --- | --- |
| 主题/正文 | 17 份原样式审计继续通过；目录颜色采用用户指定参考站，作为独立明确例外。 |
| 阅读容器/标题/Paper | 保留原 max-w、标题与 lg/xl 侧栏断点；恢复 Paper 的打印背景、边框与阴影取消，手记两侧栏隐藏。 |
| 目录 | 恢复 font-sans、原 Divider 与视口右缘 30px 的最大宽度；删除强制 opacity-100，让当前章节悬停也按原规则到 0.8。 |
| 日期/元信息 | 文稿沿用原 29 天前相对时间、之后完整日期；手记恢复年月日星期/medium 字重及修改日期浮层；恢复原 0.5px 竖分隔线与分类图标半像素偏移。 |
| 阅读进度 | 正文单独作为 WrappedElement 等价范围，排除标题/元信息；原 Progress SVG 和圆环色，0% 图标及 200ms 淡入淡出。目录进度不可见时显示边缘进度条，包括手记平板断点；正文末尾隐藏。 |
| 过期提示 | 补齐原 PostOutdate 的已修改且超过 60 天规则、原 Banner 几何与 SVG；静态页进入时计算，日期采用上海时区。 |
| 版权反馈 | 等待剪贴板写入后提示成功，失败提示实际错误。 |

新增 NoteHeaderDate、ReadIndicator、PostOutdate 为静态生命周期适配；Banner 仅改图标 import 路径、status 删除未使用 React 值导入，Progress 完整保留原码。没有声称整个项目已逐像素一致。

## 首页多行模板（2026-10-07）

- 原 Hero.tsx 使用模板项 type、可选 text/class 顺序创建元素；补齐无文字标签不传子节点的行为，支持原生 br 换行。
- 本地类型限制为 React 原生标签，保留可选文字与类名；空模板不调用逐字动画。既有首页几何、字号及动画参数未改。
- 三行示例是个人配置内容，不代表官方默认文案；官方默认模板为空。README 已说明配置方式。
