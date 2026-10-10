# 维护「书与影」

作品记录放在 `src/content/works/`，每件作品一个 Markdown 文件。首页「近期」、时光和 RSS 只收录文稿与手记；作品短记只出现在书与影和搜索中。

## 新增作品

BetterTypora 博客插件 0.15 起可在「博客 → 书与影」中新建、筛选和编辑作品，正文短记仍使用 Typora。属性页的「封面、日期与评论」可编辑封面与评论关联；评分留空代表未评分。图片管理、保存版本、发布和回收站沿用插件现有流程。作品草稿可通过插件的浏览器预览查看，正式构建不会生成草稿预览页面。

复制 `src/content/works/example.md` 并重命名，填写真实内容后将 `draft` 改为 `false`。默认页面为空，示例不会生成公开页面。

```yaml
---
title: 作品名称
slug: my-first-book
type: book
creator: 作者姓名
originalTitle: Original title
year: 2020
cover: /images/collections/my-first-book.jpg
status: in-progress
recorded: 2026-10-10
summary: 一句话短评。
draft: true
---
这里写个人短记、摘录和补充说明。
```

`title`、`slug`、`type`、`status`、`recorded` 必填。`slug` 使用小写英文、数字和连字符，是稳定网址标识，不能重复。作品网址为 `/collections/my-first-book/`。按记录日期倒序展示，同日按 slug 排序。

| 字段 | 用法 |
| --- | --- |
| `type` | `book` 书籍、`movie` 电影、`series` 剧集 |
| `status` | `planned` 想读／想看、`in-progress` 在读／正在看、`finished` 已读／已看完 |
| `rating` | 可选，0–10，最多一位小数；不填则不显示评分 |
| `finished` | 可选，完成日期；只在完成状态显示 |
| `creator`、`originalTitle`、`year` | 可选，作者／导演、原名、发行年份 |
| `summary` | 可选，卡片的一句话短评 |
| `review` | 可选，关联公开文稿，见下文 |
| `draft` | 默认 false；true 时不生成详情、不收录搜索或站点地图 |

草稿仅阻止网站发布；公开 Git 仓库中的源文件仍可被阅读，不要放私密内容。

## 封面与状态

本地封面放在 `public/images/collections/`，字段填写 `/images/collections/文件名.jpg`；也可以填写 HTTPS 图片地址。不要填写 Windows 文件路径或手动加部署子路径。站点自动处理 BASE_PATH。封面完整显示，无图或加载失败时显示文字封面。

更新阅读状态时修改 `status`；完成后可加 `finished: 2026-10-10`。`recorded` 是记录时间，修改状态不会改变排序。评分和完成日期都可以省略。

## 关联长篇评论

书评、影评继续存放在 `src/content/posts/`。作品填写 `review: reading-demo` 这样的文稿 id 或 slug，也支持 `posts/reading-demo.md`、`/posts/essays/reading-demo/`。引用必须唯一匹配已公开文稿；不存在、歧义或仅匹配草稿时，构建会指出作品文件和关联原因。长评只维护一份，作品正文写简短补充即可。

## 剧透折叠

```html
<details>
<summary>含剧透，点击展开</summary>
<p>在这里填写剧透内容。</p>
</details>
```

## 本地预览

运行 `npm run dev`，访问终端给出的地址下的 `/collections/`。列表的类型和状态筛选保存在网址中，作品详情的返回链接恢复相同筛选。关闭 JavaScript 时展示全部作品。

发布前运行 `npm run check`、`npm run build`、`npm run verify`。重复 slug、无效评分及错误评论关联会阻止构建。提交、推送和部署按博客现有流程执行。
