import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkDirective from 'remark-directive';
import { shiroDirectives,shiroHtmlBlocks } from './src/lib/remark-shiro.mjs';
import rehypeRaw from 'rehype-raw';
import { rehypeShiro } from './src/lib/rehype-shiro.mjs';
import { unified } from '@astrojs/markdown-remark';
import { rehypeShiroHighlight } from './src/lib/rehype-shiro-highlight.mjs';
import rehypeSlug from 'rehype-slug';
import { rehypeResponsiveImages, responsiveImagesIntegration } from './src/lib/responsive-images.mjs';

const site = process.env.SITE_URL || 'https://example.com';
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  site,
  base,
  output: 'static',
  trailingSlash: 'always',
  integrations: [react(), sitemap(), responsiveImagesIntegration()],
  vite: { plugins: [tailwindcss()] },
  markdown: {
    syntaxHighlight: false,
    processor: unified({
      remarkPlugins: [remarkMath, remarkDirective, shiroHtmlBlocks, shiroDirectives],
      rehypePlugins: [rehypeShiroHighlight, rehypeRaw, rehypeKatex, rehypeSlug, rehypeResponsiveImages, rehypeShiro],
      remarkRehype: { footnoteLabel: '脚注', footnoteBackLabel: '返回引用' },
    }),
  },
});
