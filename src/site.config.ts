// Personal information is demo content. Layout and design are ported from Shiro.
import type { JSX } from 'react';
export type HeroTemplateItem = { type: keyof JSX.IntrinsicElements; text?: string; class?: string };
export type NavItem={title:string;path:string;icon:string;subMenu?:NavItem[]};
export const siteConfig = {
  topics: [] as {slug:string;name:string;icon?:string;introduce:string;description?:string}[],
  title: 'Sylvan 的小站',
  description: '记录生活，分享思考。',
  owner: 'Sylvan',
  avatar: '/avatar.png',
  hero: {
    title: {
      template: [
        { type: 'h1', text: '你好，我是 ', class: 'text-4xl font-light' },
        { type: 'span', text: 'Sylvan', class: 'text-4xl font-medium text-accent' },
        { type: 'span', text: '。', class: 'text-4xl font-light' },
        { type: 'br' },
        { type: 'span', text: '如纸的纯净，', class: 'text-4xl font-light' },
        { type: 'br' },
        { type: 'span', text: '似雪的清新。', class: 'text-4xl font-light' },
        { type: 'br' },
        {
          type: 'code',
          text: '<Student & Developer />',
          class: 'font-medium mx-2 text-3xl rounded p-1 bg-gray-200/0 hover:bg-gray-200 dark:bg-gray-800/0 dark:hover:bg-gray-800 transition-colors duration-200',
        },
      ] satisfies HeroTemplateItem[],
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
    { title: '时光', path: '/timeline/', icon: 'i-mingcute-history-line',subMenu:[{title:'手记',path:'/timeline/?type=note',icon:'i-mingcute-quill-pen-line'},{title:'文稿',path:'/timeline/?type=post',icon:'i-mingcute-book-2-line'},{title:'专栏',path:'/notes/series/',icon:'i-mingcute-align-bottom-fill'}] },
    { title: '关于', path: '/about/', icon: 'i-mingcute-user-3-line' },
  ] as NavItem[],
};
