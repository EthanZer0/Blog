// Personal site configuration. Layout and design are ported from Shiro.
import type { JSX } from 'react';
export type HeroTemplateItem = { type: keyof JSX.IntrinsicElements; text?: string; class?: string };
export type NavItem={title:string;path:string;icon:string;subMenu?:NavItem[]};
export const siteConfig = {
  topics: [] as {slug:string;name:string;icon?:string;introduce:string;description?:string}[],
  title: '凌晨Feng - 静思，笃行',
  description: '一隅清净地，且行，且留。',
  owner: '凌晨Feng',
  avatar: '/avatar.png',
  hero: {
    title: {
      template: [
        { type: 'h1', text: '嗨！我是', class: 'text-4xl font-light' },
        { type: 'span', text: '凌晨Feng', class: 'text-4xl font-medium text-accent' },
        { type: 'br' },
        { type: 'span', text: '一隅清净地，且行，且留。', class: 'text-4xl font-light' },
        {
          type: 'code',
          text: '<Student & Developer />',
          class: 'font-medium mx-2 text-3xl rounded p-1 bg-gray-200/0 hover:bg-gray-200 dark:bg-gray-800/0 dark:hover:bg-gray-800 transition-colors duration-200',
        },
      ] satisfies HeroTemplateItem[],
    },
    description: 'Roam far,and store the quiet musings.',
    hitokoto: '如纸的纯净，似雪的清新。',
  },
  social: [
    { label: 'GitHub', url: 'https://github.com/EthanZer0/Blog', icon: 'i-mingcute-github-line', color: '#181717' },
    { label: 'Bilibili', url: 'https://space.bilibili.com/383490657', icon: 'bilibili', color: '#00A1D6' },
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
