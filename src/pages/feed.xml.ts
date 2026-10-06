import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { articles, articlePath, withBase } from '../lib/content';
import { siteConfig } from '../site.config';

export async function GET(context: APIContext) {
  const entries = [...await articles('posts'), ...await articles('notes')].sort((a,b) => b.data.published.getTime()-a.data.published.getTime());
  return rss({ title: siteConfig.title, description: siteConfig.description, site: context.site!, items: entries.map(entry => ({ title: entry.data.title, description: entry.data.description, pubDate: entry.data.published, link: withBase(articlePath(entry)), categories: entry.data.tags })), customData: '<language>zh-CN</language>' });
}
