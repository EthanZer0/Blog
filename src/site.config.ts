// Personal information is demo content. Layout and design are ported from Shiro.
export const siteConfig = {
  title: 'Sylvan 的小站',
  description: '记录生活，分享思考。',
  owner: 'Sylvan',
  avatar: '/avatar.png',
  hero: {
    title: {
      template: [
        { type: 'h1' as const, text: '你好，我是 ', class: 'text-4xl font-light' },
        { type: 'span' as const, text: 'Sylvan', class: 'text-4xl font-medium text-accent' },
        { type: 'span' as const, text: '。', class: 'text-4xl font-light' },
      ],
    },
    description: '在文字里，收藏日常的微光。',
    hitokoto: '如纸的纯净，似雪的清新。',
  },
  social: [
    { label: 'GitHub', url: 'https://github.com/', icon: 'i-mingcute-github-line', color: '#181717' },
    { label: 'RSS', url: '/feed.xml', icon: 'i-mingcute-rss-line', color: '#FFA500' },
  ],
  nav: [
    { title: '首页', path: '/', icon: 'i-mingcute-home-4-line' },
    { title: '文稿', path: '/posts/', icon: 'i-mingcute-book-2-line' },
    { title: '手记', path: '/notes/', icon: 'i-mingcute-quill-pen-line' },
    { title: '时光', path: '/timeline/', icon: 'i-mingcute-history-line' },
    { title: '关于', path: '/about/', icon: 'i-mingcute-user-3-line' },
  ],
};
