# 首轮迁移验证

日期：2026-10-06。

## 自动检查

- Astro / TypeScript：0 errors、0 warnings、0 hints。
- 15 个静态 HTML 页面成功生成。
- Pagefind 为 4 篇公开文章/手记建立中文索引。
- 全站内部路由、标题锚点、图片、样式、脚本与 React 岛产物链接检查通过。
- RSS 条目与公开文章页面数量一致。
- 演示草稿标记未进入 HTML、RSS、JSON、脚本或搜索产物。
- 产物不含 Mix Space API / Socket / Next 路由运行依赖。
- 根路径 `/` 与项目路径 `/shiro-test` 均进行完整构建及产物检查。
- Markdown 修改缓存问题已修复：生产构建先运行 `astro sync --force`。

## 集中浏览器检查

- 桌面首页和正文正常显示，无控制台 error / warn。
- 深浅主题切换并在页面跳转后保持。
- 中文搜索「写作」返回相关文稿。
- 最终正文包含 1 个原样式代码块、2 个原样式提示容器、7 个标题链接。
- 390px 手机断点隐藏桌面侧栏，显示手机菜单，正文无页面横向溢出。
- 浏览器截图保存于本地 `.verification/`，不提交仓库。

## 验证边界

以上验证确认首轮迁移可以运行与静态部署，不能替代与固定 Shiro 参考截图的逐项视觉对照。当前个人信息、头像和文章为演示占位。

GitHub Actions 工作流已提供，但尚未建立远程仓库或进行真实 Pages 部署。实际部署需要 GitHub 仓库地址及 Pages 设置。

## 第二轮视觉校准验证

- Astro / TypeScript：36 个文件，0 errors / warnings / hints。
- 根路径及 `/shiro-test` 构建、Pagefind 和产物验证通过，15 个 HTML、4 篇公开内容。
- 集中检查桌面 1440×900 和手机 390×844，深浅主题持久化正常，浏览器 error / warn 为空。
- 桌面手记纸张宽度实测 840px（14px 根字号 × 60rem），标题左对齐，正文 Noto Serif SC，目录位于独立右栏。
- 发现并当场修复手机纸张的 w-full/负边距冲突；纸张修复后覆盖可用视口宽度，无页面横向溢出。
- 首页社交按钮实测 GitHub `rgb(24,23,23)`、RSS `rgb(255,165,0)`，与上游色值一致。
- 阅读目录锚点可定位正文，选中章节及圆环百分比随滚动更新；长文向上滚动到约 1879px 时，浮动导航可见，胶囊宽度实测 329px。
- 截图：`.verification/phase2-home-desktop.jpg`、`phase2-note-desktop.jpg`、`phase2-note-mobile-dark.jpg`、`phase2-reading-dark.jpg`（本地忽略）。
- 本轮依据固定上游源码校准；未获得相同版本与个人配置的原站截图，不宣称像素级一致。剩余差异在 SOURCES.md 中逐项记录。

## 用户截图修正验证

- 还原时间轴中文原文及两行换行，移除自创标题。
- 1440×900 首屏滚动位置 0：一言区域顶部实测 942px，下箭头约 984px，均在首屏之外。
- 向下滚动 700px 后，一言区域位于视口约 242–313px，正常显示。
- 手机 390×844 检查无页面横向溢出，Hero 最小高度为一屏。
- 类型检查、静态构建及全站产物验证通过；没有为这两处样式/文案修改增加重复实现的测试。
- 截图：`.verification/home-corrected-first-fold.jpg`。

## 恢复原码边缘定位（取代上一项首屏外方案）

- 首页 Content 恢复原 63px 顶部 padding，Hero 原 -63px 桌面外边距抵消，Hero 顶部实测为 0。
- 1440×900：Hero 底边实测 900px，提示区域底边同为 900px；提示 absolute / bottom 0px / margin-top 0px，无额外 42px 文档流间隔。
- 固定版本原码在入场完成后允许首屏底部看到提示，不能承诺滚动前完全隐藏。前一节“首屏之外”的测量属于已撤销方案。
- 类型检查、构建与全站静态产物验证通过。
- 截图：`.verification/home-original-edge.jpg`。

## 完整前端源码审查验证

- 逐文件映射覆盖当前 64 个前端源码文件；完整结论和剩余差异见 `FRONTEND_AUDIT.md`，不宣称严格一致。
- `npm run audit:source` 验证固定上游提交、15 份原样式的 CSS 规则、Spring 常量及共同展示依赖版本。
- Astro / TypeScript：53 个文件，0 errors / warnings / hints。
- 根路径 `/` 与 `/shiro-test` 分别完整构建并通过 `npm run verify`：15 个 HTML 页面、4 篇公开内容的 Pagefind 索引。
- Markdown 实际渲染管线检查标题、图注、表格、脚注、代码文件名/图标/高亮/展开及 gallery。发现数学公式误入代码高亮后已修复，并增加独立回归断言。
- 集中浏览器抽查搜索、手机导航和目录抽屉。最终 390px 正文没有页面横向溢出，含 1 个复制代码按钮和 1 个块级公式，浏览器 error / warn 为空。
- 手机目录截图：`.verification/audit-mobile-toc.png`（本地忽略）。目录链接可关闭抽屉并启动章节定位。
- 构建存在原 DaisyUI `@property --radialprogress` 的 CSS 优化提示；Pagefind 略过 `/notes/` 的静态重定向文件。这两项不等同于 TypeScript 错误，也没有通过修改原 CSS 隐藏提示。
- 剩余纯前端差异未全部消除；尚未进行相同版本、个人配置与视口下的原站像素级对照。
