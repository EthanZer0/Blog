import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkDirective from 'remark-directive';
import { shiroDirectives } from './src/lib/remark-shiro.mjs';
import { rehypeShiro } from './src/lib/rehype-shiro.mjs';
import { unified } from '@astrojs/markdown-remark';
import rehypeSlug from 'rehype-slug';

const site = process.env.SITE_URL || 'https://example.com';
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  site,
  base,
  output: 'static',
  trailingSlash: 'always',
  integrations: [react(), sitemap()],
  vite: { plugins: [tailwindcss()] },
  markdown: {
    shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' } },
    processor: unified({
      remarkPlugins: [remarkMath, remarkDirective, shiroDirectives],
      rehypePlugins: [rehypeKatex, rehypeSlug, rehypeShiro],
      remarkRehype: { footnoteLabel: '脚注', footnoteBackLabel: '返回引用' },
    }),
  },
});
