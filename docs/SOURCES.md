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
| src/components/Hero.tsx | app/[locale]/(home)/components/Hero.tsx、TwoColumnLayout.tsx | 原布局类；配置显式导入，Image 换 img，标题/描述/社交/页脚入场保留原 Spring 与延时；品牌色和按压缩放复用 SocialIcon/MotionButton；静态 HTML 初始可见 |
| src/components/Header.astro | components/layout/header/Header.tsx、internal/HeaderContent.tsx | 原网格与胶囊样式；DesktopNav.tsx 复用光斑算法、197–247px 淡出、600px 向上滚动浮现与 120ms 防抖；认证去掉，添加搜索入口 |
| src/components/Footer.astro | components/layout/footer/Footer.tsx、FooterInfo.tsx | 原间距与链接布局；主题在浏览器管理 |
| src/pages/index.astro | app/[locale]/(home)/components/Activity*.tsx、HomePageTimeLine.tsx | 原双栏、活动列表及时间线骨架，数据来自公开内容 |
| src/components/PostItem.astro | components/modules/post/PostItem.tsx | 原 loose 模式标题、摘要和 meta 布局；site.ts/global.css 移植 MagneticHoverEffect 的 0.05 位移、变换原点、背景和缓动；无互动计数 |
| src/layouts/Article.astro | app/[locale]/posts/(post-detail)/Container.tsx、[category]/[slug]/page*.tsx、components/layout/container/Paper.tsx | 文稿原居中标题/主栏/200px 侧栏；手记恢复 notes/layout.tsx 的 60rem 主栏、xl 三栏、左对齐标题和 Paper；正文构建时渲染；文稿版权区域复用 PostCopyright 排版 |
| src/components/Toc.astro | components/modules/shared/ArticleRightAside.tsx、ReadIndicator.tsx、modules/toc/TocItem.tsx、TocTree.tsx | 原目录文字间距、章节标记、圆环百分比与回到顶部；目录由构建结果产生 |
| src/components/YearTimeline.astro | app/[locale]/(home)/components/HomePageTimeLine.tsx | 原月节点、2px 每日短线、同日堆叠、3px 月累计柱、标签位置和遮罩揭示；按上海时区分组公开内容 |
| src/lib/rehype-shiro.mjs | components/ui/banner/Banner.tsx、components/icons/status.tsx、markdown/renderers/table.tsx | 提示容器复用原色彩、布局和 SVG 路径，表格复用原 DaisyUI 类 |
| public/avatar.png、favicon.ico | apps/web/public/android-chrome-512x512.png、favicon.ico | 上游站点图标，演示占位，需换成用户资料 |

没有使用上游个人文章、签名、私有赞助版代码。示例文稿为本移植项目的演示内容。

## 视觉边界

Hero 文案与格式在上游本来就由个人配置提供，此处为可编辑的演示配置。公开仓库不能唯一确定作者站点的所有个人配置。

页面切换采用普通链接，导航跨页面的共享 layoutId 动画因此未复刻；手机菜单和手机目录目前仍为原生 details，尚未迁移原版 Drawer/TocFAB。年度时间线保留几何与遮罩动画，逐日弹簧延时动画和 FloatPopover 仍使用静态标记及原生 title；动态列表仍是静态公开内容适配。文章列表摘要、前后篇入口、代码块工具栏尚有适配差异，代码字体仍为系统回退。头像和个人信息是占位。未获得同一固定版本、同一配置的原站截图，当前为源码尺寸/样式校准与本地集中检查，不能称为已完成像素级验收。

正文无衬线与手记衬线字体遵循上游 `lib/fonts.ts` 的 Manrope 300/400/500 和 Noto Serif SC 400；以 Fontsource 本地字体替代 Next Google Font 构建器，读者浏览不依赖 Google Fonts 请求。
